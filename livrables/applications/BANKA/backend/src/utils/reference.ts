import { TypeCompte, Devise } from '@prisma/client';
import prisma from './prisma';

const typeCode: Record<TypeCompte, string> = {
  EPARGNE:      'EP',
  COURANT:      'CC',
  TERME:        'CT',
  JOINT:        'CJ',
  MICRO_EPARGNE:'ME',
  TONTINE:      'TN',
  RETRAITE:     'RT',
  JEUNESSE:     'JE',
  CREDIT:       'CL',
};

export async function generateNumeroCompte(agenceCode: string, type: TypeCompte, devise: Devise): Promise<string> {
  const deviseCode = devise === 'HTG' ? 'H' : 'D';
  const prefix = `${agenceCode}-${typeCode[type]}${deviseCode}`;

  const last = await prisma.compte.findFirst({
    where: { numeroCompte: { startsWith: prefix } },
    orderBy: { numeroCompte: 'desc' },
    select: { numeroCompte: true },
  });

  let seq = 1;
  if (last) {
    const parts = last.numeroCompte.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}-${String(seq).padStart(6, '0')}`;
}

export async function generateNumeroClient(): Promise<string> {
  const prefix = 'CLT';
  const year = new Date().getFullYear();
  const base = `${prefix}${year}`;

  const last = await prisma.client.findFirst({
    where: { numeroClient: { startsWith: base } },
    orderBy: { numeroClient: 'desc' },
    select: { numeroClient: true },
  });

  let seq = 1;
  if (last) {
    const lastSeq = parseInt(last.numeroClient.replace(base, ''), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${base}${String(seq).padStart(5, '0')}`;
}

export async function generateReferencePret(): Promise<string> {
  const prefix = 'PRE';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const base = `${prefix}${year}${month}`;

  const last = await prisma.pret.findFirst({
    where: { reference: { startsWith: base } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  let seq = 1;
  if (last) {
    const lastSeq = parseInt(last.reference.replace(base, ''), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${base}${String(seq).padStart(4, '0')}`;
}

export async function generateReferenceTransaction(type: string): Promise<string> {
  const codes: Record<string, string> = {
    DEPOT: 'DEP',
    RETRAIT: 'RET',
    VIREMENT_DEBIT: 'VIR',
    VIREMENT_CREDIT: 'VIR',
    DECAISSEMENT_PRET: 'DEC',
    REMBOURSEMENT_PRET: 'RBT',
    FRAIS: 'FRS',
    INTERET: 'INT',
    AJUSTEMENT: 'AJT',
  };
  const code = codes[type] || 'TXN';
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${code}-${datePart}-${timePart}-${rand}`;
}
