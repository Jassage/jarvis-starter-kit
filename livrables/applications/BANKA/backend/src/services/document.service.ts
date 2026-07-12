import fs from 'fs';
import path from 'path';
import prisma from '../utils/prisma';
import { AppError } from '../types';
import { createAuditLog } from '../utils/audit';

const TYPES_VALIDES = ['PIECE_IDENTITE', 'JUSTIFICATIF_DOMICILE', 'CONTRAT', 'AUTRE'];

export async function listDocuments(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new AppError(404, 'Client introuvable');
  return prisma.document.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    include: { creePar: { select: { nom: true, prenom: true } } },
  });
}

export async function createDocument(
  clientId: string,
  file: Express.Multer.File,
  data: { type: string; dateExpiration?: string; notes?: string },
  userId: string
) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    fs.unlink(file.path, () => {});
    throw new AppError(404, 'Client introuvable');
  }
  if (!TYPES_VALIDES.includes(data.type)) {
    fs.unlink(file.path, () => {});
    throw new AppError(400, `Type invalide. Valeurs acceptées : ${TYPES_VALIDES.join(', ')}`);
  }
  if (data.dateExpiration && new Date(data.dateExpiration) <= new Date()) {
    fs.unlink(file.path, () => {});
    throw new AppError(400, "La date d'expiration doit être dans le futur");
  }

  const document = await prisma.document.create({
    data: {
      clientId,
      type: data.type as any,
      nomFichier: file.originalname,
      cheminFichier: `/uploads/documents/${file.filename}`,
      mimeType: file.mimetype,
      tailleOctets: file.size,
      dateExpiration: data.dateExpiration ? new Date(data.dateExpiration) : undefined,
      notes: data.notes,
      creeParId: userId,
    },
    include: { creePar: { select: { nom: true, prenom: true } } },
  });

  await createAuditLog({ userId, table: 'documents', action: 'CREATE', entiteId: document.id, nouveau: { clientId, type: data.type, nomFichier: file.originalname } });
  return document;
}

export async function deleteDocument(id: string, userId: string) {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw new AppError(404, 'Document introuvable');

  await prisma.document.delete({ where: { id } });

  // Best-effort : le fichier physique est supprimé après la ligne en base — un échec de suppression
  // disque ne doit pas laisser une référence fantôme en base, l'inverse est acceptable (fichier orphelin)
  const absolutePath = path.join(__dirname, '../../', document.cheminFichier);
  fs.unlink(absolutePath, () => {});

  await createAuditLog({ userId, table: 'documents', action: 'DELETE', entiteId: id, ancien: { clientId: document.clientId, nomFichier: document.nomFichier } });
}

// Job quotidien (jobs/documentsExpiration.ts) : marque EXPIRE les documents ACTIF dont la date
// d'expiration est dépassée — ne supprime jamais le fichier, juste le statut (archivage KYC).
export async function expirerDocuments(): Promise<number> {
  const { count } = await prisma.document.updateMany({
    where: { statut: 'ACTIF', dateExpiration: { lt: new Date() } },
    data: { statut: 'EXPIRE' },
  });
  return count;
}
