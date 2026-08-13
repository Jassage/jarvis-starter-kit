import { CategorieAnnuaire, Locale, StatutPublication } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';

interface TraductionInput {
  locale: Locale;
  description: string;
}

interface AnnuaireEntryInput {
  nom: string;
  categorie: CategorieAnnuaire;
  adresse?: string;
  telephone?: string;
  whatsapp?: string;
  email?: string;
  siteWeb?: string;
  horaires?: string;
  latitude?: number;
  longitude?: number;
  statutPublication: StatutPublication;
  photoId?: string;
  ordre: number;
  traductions: TraductionInput[];
}

const includePourAffichage = { traductions: true, photo: true };
const orderByDefaut = { ordre: 'asc' as const };

export async function listPublique(categorie?: CategorieAnnuaire) {
  return prisma.annuaireEntry.findMany({
    where: { statutPublication: 'PUBLIE', ...(categorie && { categorie }) },
    orderBy: orderByDefaut,
    include: includePourAffichage,
  });
}

export async function listAdmin() {
  return prisma.annuaireEntry.findMany({ orderBy: orderByDefaut, include: includePourAffichage });
}

export async function create(data: AnnuaireEntryInput) {
  return prisma.annuaireEntry.create({
    data: {
      nom: data.nom,
      categorie: data.categorie,
      adresse: data.adresse,
      telephone: data.telephone,
      whatsapp: data.whatsapp,
      email: data.email,
      siteWeb: data.siteWeb,
      horaires: data.horaires,
      latitude: data.latitude,
      longitude: data.longitude,
      statutPublication: data.statutPublication,
      photoId: data.photoId,
      ordre: data.ordre,
      traductions: { create: data.traductions.map((t) => ({ locale: t.locale, description: t.description })) },
    },
    include: includePourAffichage,
  });
}

export async function update(
  id: string,
  data: Partial<Omit<AnnuaireEntryInput, 'traductions'>> & { traductions?: TraductionInput[] }
) {
  const existing = await prisma.annuaireEntry.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Fiche introuvable');

  return prisma.annuaireEntry.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.categorie !== undefined && { categorie: data.categorie }),
      ...(data.adresse !== undefined && { adresse: data.adresse }),
      ...(data.telephone !== undefined && { telephone: data.telephone }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.siteWeb !== undefined && { siteWeb: data.siteWeb }),
      ...(data.horaires !== undefined && { horaires: data.horaires }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.statutPublication !== undefined && { statutPublication: data.statutPublication }),
      ...(data.photoId !== undefined && { photoId: data.photoId }),
      ...(data.ordre !== undefined && { ordre: data.ordre }),
      ...(data.traductions && {
        traductions: {
          upsert: data.traductions.map((t) => ({
            where: { annuaireEntryId_locale: { annuaireEntryId: id, locale: t.locale } },
            create: { locale: t.locale, description: t.description },
            update: { description: t.description },
          })),
        },
      }),
    },
    include: includePourAffichage,
  });
}

export async function remove(id: string) {
  const existing = await prisma.annuaireEntry.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Fiche introuvable');
  await prisma.annuaireEntry.delete({ where: { id } });
}

// ---------------------------------------------------------------------------------------
// Phase 3 : agrégation « toutes fiches » (page publique /annuaire). Auparavant, le frontend
// chargeait les 7 verticaux en entier (`Promise.all` de 7 appels sans filtre) puis filtrait
// nom/catégorie en mémoire côté navigateur — fonctionnel au faible volume actuel mais pas ce
// que le cahier des charges demande ("recherche et filtres réels" sur les sections à fort
// volume), et non scalable. Ici, `q` et `secteur` sont poussés dans chaque requête Prisma :
// seuls les résultats déjà filtrés transitent sur le réseau. Les libellés de catégorie
// (auparavant dupliqués côté frontend) sont résolus ici pour rester la seule source de vérité.
// ---------------------------------------------------------------------------------------

const CATEGORIE_ECO_LABEL: Record<string, string> = {
  COMMERCE: 'Commerce', CONSTRUCTION: 'Construction', AGROALIMENTAIRE: 'Agroalimentaire',
  ARTISANAT: 'Artisanat', SERVICES: 'Services', AUTRE: 'Entreprise',
};
const TYPE_ECOLE_LABEL: Record<string, string> = {
  LYCEE: 'École', COLLEGE: 'École', UNIVERSITE: 'Université', CENTRE_FORMATION: 'Formation', BIBLIOTHEQUE: 'Bibliothèque', AUTRE: 'École',
};
const TYPE_SANTE_LABEL: Record<string, string> = {
  HOPITAL: 'Hôpital', CENTRE_SANTE: 'Centre de santé', PHARMACIE: 'Pharmacie', CLINIQUE: 'Clinique', AUTRE: 'Santé',
};
const CATEGORIE_ANNUAIRE_LABEL: Record<string, string> = {
  BANQUE: 'Banque', EGLISE: 'Église', ONG: 'ONG', STATION_SERVICE: 'Station-service', BOUTIQUE: 'Boutique',
  GARAGE: 'Garage', PROFESSIONNEL: 'Professionnel', TRANSPORT: 'Transport', AUTRE: 'Autre',
};

export type SecteurAnnuaire = 'toutes' | 'entreprises' | 'ecoles' | 'sante' | 'hotels' | 'restaurants' | 'banques' | 'associations';

interface FicheUnifiee {
  id: string;
  nom: string;
  secteur: string;
  categorieLabel: string;
  adresse: string | null;
  telephone: string | null;
  latitude: number | null;
  longitude: number | null;
  photo: { url: string } | null;
}

function texteMatch(q?: string) {
  return q ? { contains: q, mode: 'insensitive' as const } : undefined;
}

export async function listToutes(secteur: SecteurAnnuaire = 'toutes', q?: string): Promise<FicheUnifiee[]> {
  const inclure = (s: SecteurAnnuaire) => secteur === 'toutes' || secteur === s;
  const texte = texteMatch(q);

  const [entreprises, hotels, restaurants, ecoles, sante, associations, annuaireEntries] = await Promise.all([
    inclure('entreprises')
      ? prisma.business.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { description: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
    inclure('hotels')
      ? prisma.hotel.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { description: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
    inclure('restaurants')
      ? prisma.restaurant.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { description: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
    inclure('ecoles')
      ? prisma.school.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { description: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
    inclure('sante')
      ? prisma.healthFacility.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { description: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
    inclure('associations')
      ? prisma.association.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { mission: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
    // Les fiches AnnuaireEntry couvrent le bucket "banques" (secteur dédié) + le reste des
    // catégories génériques (visibles seulement sous "toutes", pas de filtre dédié — même
    // limite que le comportement client précédent, non étendue ici).
    inclure('banques') || secteur === 'toutes'
      ? prisma.annuaireEntry.findMany({
          where: {
            statutPublication: 'PUBLIE',
            ...(secteur === 'banques' && { categorie: 'BANQUE' }),
            ...(texte && { OR: [{ nom: texte }, { traductions: { some: { description: texte } } }] }),
          },
          include: { photo: true },
          orderBy: { ordre: 'asc' },
        })
      : [],
  ]);

  const fiches: FicheUnifiee[] = [
    ...entreprises.map((e) => ({
      id: e.id, nom: e.nom, secteur: 'entreprises', categorieLabel: CATEGORIE_ECO_LABEL[e.categorie] ?? e.categorie,
      adresse: e.adresse, telephone: e.telephone, latitude: e.latitude, longitude: e.longitude, photo: e.photo,
    })),
    ...hotels.map((h) => ({
      id: h.id, nom: h.nom, secteur: 'hotels', categorieLabel: 'Hébergement',
      adresse: h.adresse, telephone: h.telephone, latitude: h.latitude, longitude: h.longitude, photo: h.photo,
    })),
    ...restaurants.map((r) => ({
      id: r.id, nom: r.nom, secteur: 'restaurants', categorieLabel: 'Restaurant',
      adresse: r.adresse, telephone: r.telephone, latitude: r.latitude, longitude: r.longitude, photo: r.photo,
    })),
    // École et Association n'ont pas de champ GPS en base (jamais demandé sur ces deux
    // verticaux, cf. schéma Prisma) — `null` explicite plutôt qu'une référence à un champ
    // inexistant, ces fiches n'apparaissent donc jamais sur la carte interactive.
    ...ecoles.map((e) => ({
      id: e.id, nom: e.nom, secteur: 'ecoles', categorieLabel: TYPE_ECOLE_LABEL[e.type] ?? e.type,
      adresse: e.adresse, telephone: e.telephone, latitude: null, longitude: null, photo: e.photo,
    })),
    ...sante.map((s) => ({
      id: s.id, nom: s.nom, secteur: 'sante', categorieLabel: TYPE_SANTE_LABEL[s.type] ?? s.type,
      adresse: s.adresse, telephone: s.telephone, latitude: s.latitude, longitude: s.longitude, photo: s.photo,
    })),
    ...associations.map((a) => ({
      id: a.id, nom: a.nom, secteur: 'associations', categorieLabel: 'Association',
      adresse: a.adresse, telephone: a.telephone, latitude: null, longitude: null, photo: a.photo,
    })),
    ...annuaireEntries.map((e) => ({
      id: e.id, nom: e.nom, secteur: e.categorie === 'BANQUE' ? 'banques' : 'autre',
      categorieLabel: CATEGORIE_ANNUAIRE_LABEL[e.categorie] ?? e.categorie,
      adresse: e.adresse, telephone: e.telephone, latitude: e.latitude, longitude: e.longitude, photo: e.photo,
    })),
  ];

  return fiches;
}
