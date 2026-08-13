import prisma from '../../config/database';

const SINGLETON_ID = 'singleton';

interface SiteSettingsInput {
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  horaires?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  siteWebUrl?: string | null;
}

// get() ne peut jamais 404 : la ligne singleton est créée à la volée au premier appel plutôt
// que par un seed obligatoire, pour ne jamais bloquer la page Contact/le footer si l'admin n'a
// encore rien renseigné (tous les champs sont nullable, la réponse est simplement vide).
export async function get() {
  return prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });
}

export async function update(data: SiteSettingsInput) {
  return prisma.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...data },
    update: data,
  });
}
