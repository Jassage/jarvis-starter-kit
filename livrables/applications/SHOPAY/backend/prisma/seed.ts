import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@shopay.ht';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin@123456';

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: await bcrypt.hash(superAdminPassword, 12),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'PLATFORM_SUPER_ADMIN',
    },
  });
  console.log(`✓ Super admin plateforme : ${superAdmin.email}`);

  const boutique = await prisma.boutique.upsert({
    where: { slug: 'boutique-demo' },
    update: {},
    create: {
      name: 'Boutique Démo',
      slug: 'boutique-demo',
      status: 'ACTIVE',
      description: 'Boutique de démonstration SHOPAY',
      contactEmail: 'contact@boutique-demo.ht',
      department: 'OUEST',
      commune: 'Port-au-Prince',
    },
  });

  await prisma.merchantSubscription.upsert({
    where: { boutiqueId: boutique.id },
    update: {},
    create: { boutiqueId: boutique.id, plan: 'FREE' },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'marchand@boutique-demo.ht' },
    update: {},
    create: {
      email: 'marchand@boutique-demo.ht',
      password: await bcrypt.hash('Marchand@123', 12),
      firstName: 'Jean',
      lastName: 'Marchand',
      role: 'BOUTIQUE_OWNER',
      boutiqueId: boutique.id,
    },
  });
  console.log(`✓ Boutique démo : ${boutique.slug} (propriétaire : ${owner.email})`);

  const categorie = await prisma.category.upsert({
    where: { boutiqueId_slug: { boutiqueId: boutique.id, slug: 'vetements' } },
    update: {},
    create: { boutiqueId: boutique.id, name: 'Vêtements', slug: 'vetements' },
  });

  const produits = [
    { name: 'T-shirt SHOPAY', slug: 't-shirt-shopay', basePrice: 750, stockQty: 50 },
    { name: 'Casquette brodée', slug: 'casquette-brodee', basePrice: 500, stockQty: 30 },
    { name: 'Sac en toile', slug: 'sac-en-toile', basePrice: 1200, stockQty: 20 },
  ];

  for (const p of produits) {
    await prisma.product.upsert({
      where: { boutiqueId_slug: { boutiqueId: boutique.id, slug: p.slug } },
      update: {},
      create: {
        boutiqueId: boutique.id,
        categoryId: categorie.id,
        name: p.name,
        slug: p.slug,
        basePrice: p.basePrice,
        stockQty: p.stockQty,
        status: 'ACTIVE',
      },
    });
  }
  console.log(`✓ ${produits.length} produits démo créés dans la catégorie "${categorie.name}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
