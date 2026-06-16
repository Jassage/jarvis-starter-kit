import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  {
    email: "admin@konekte.ht",
    password: "Admin1234!",
    firstName: "Admin",
    birthDate: "1990-01-01",
    gender: "HOMME",
    city: "Port-au-Prince",
    bio: "Administrateur de la plateforme Konekte.",
    occupation: "Administrateur",
    interests: ["Tech", "Entrepreneuriat"],
  },
  {
    email: "marie@konekte.ht",
    password: "Test1234!",
    firstName: "Marie",
    birthDate: "1998-05-15",
    gender: "FEMME",
    city: "Port-au-Prince",
    bio: "Développeuse passionnée de tech et de kompa. J'aime les conversations profondes et les sorties en famille.",
    occupation: "Développeuse web",
    interests: ["Tech", "Musique", "Voyages", "Lecture"],
    prompt1Question: "Mon guilty pleasure :",
    prompt1Answer: "Regarder des séries haïtiennes jusqu'à 3h du matin",
    prompt2Question: "Je cherche quelqu'un qui :",
    prompt2Answer: "Aime danser le kompa ET parler de la vie",
  },
  {
    email: "sandra@konekte.ht",
    password: "Test1234!",
    firstName: "Sandra",
    birthDate: "1996-09-22",
    gender: "FEMME",
    city: "Pétionville",
    bio: "Médecin de jour, lectrice de nuit. Fan de voyages et de bonne cuisine créole.",
    occupation: "Médecin",
    interests: ["Lecture", "Voyages", "Cuisine", "Sport"],
    prompt1Question: "La chose la plus créole que je fais :",
    prompt1Answer: "Du griot le dimanche sans faute, depuis toujours",
  },
  {
    email: "rose@konekte.ht",
    password: "Test1234!",
    firstName: "Rose",
    birthDate: "2000-03-08",
    gender: "FEMME",
    city: "Delmas",
    bio: "Étudiante en droit, passionnée de mode et d'art. Je cherche quelqu'un d'ambitieux et sincère.",
    occupation: "Étudiante en droit",
    interests: ["Mode", "Art", "Musique", "Danse"],
    prompt1Question: "Mon projet secret :",
    prompt1Answer: "Ouvrir mon propre cabinet d'avocat à 30 ans",
  },
  {
    email: "jaslin@konekte.ht",
    password: "Test1234!",
    firstName: "Jaslin",
    birthDate: "2001-11-12",
    gender: "HOMME",
    city: "Pignon",
    bio: "Développeur fullstack et professeur de programmation. J'aime créer des choses utiles et avoir un impact positif.",
    occupation: "Développeur fullstack",
    interests: ["Tech", "Entrepreneuriat", "Musique", "Voyages"],
    prompt1Question: "Mon projet secret :",
    prompt1Answer: "Lancer un SaaS qui révolutionne l'éducation en Haïti",
    prompt2Question: "La chose la plus créole que je fais :",
    prompt2Answer: "Griot le dimanche avec toute la famille, sans faute",
  },
  {
    email: "pierre@konekte.ht",
    password: "Test1234!",
    firstName: "Pierre",
    birthDate: "1994-07-30",
    gender: "HOMME",
    city: "Cap-Haïtien",
    bio: "Architecte de jour, musicien de nuit. J'aime le kompa, la mer et les bons repas.",
    occupation: "Architecte",
    interests: ["Musique", "Art", "Sport", "Cuisine"],
  },
  {
    email: "nadege@konekte.ht",
    password: "Test1234!",
    firstName: "Nadège",
    birthDate: "1997-02-14",
    gender: "FEMME",
    city: "Carrefour",
    bio: "Comptable rigoureuse mais spontanée en dehors du bureau. J'adore les randonnées et la cuisine créole.",
    occupation: "Comptable",
    interests: ["Sport", "Cuisine", "Voyages", "Lecture"],
    prompt1Question: "Ce qui me fait rire :",
    prompt1Answer: "Les blagues haïtiennes de mon père, même les mauvaises",
  },
  {
    email: "jean@konekte.ht",
    password: "Test1234!",
    firstName: "Jean",
    birthDate: "1992-06-18",
    gender: "HOMME",
    city: "Jacmel",
    bio: "Entrepreneur dans le tourisme. Je vis pour les voyages, la mer et les rencontres authentiques.",
    occupation: "Entrepreneur tourisme",
    interests: ["Voyages", "Sport", "Cinéma", "Entrepreneuriat"],
  },
];

async function main() {
  console.log("Nettoyage des données existantes...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création des utilisateurs...");

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        isEmailVerified: true,
        profile: {
          create: {
            firstName: u.firstName,
            birthDate: new Date(u.birthDate),
            gender: u.gender as "HOMME" | "FEMME" | "AUTRE",
            city: u.city,
            bio: u.bio ?? null,
            occupation: u.occupation ?? null,
            interests: u.interests ?? [],
            lookingFor: u.gender === "HOMME" ? ["FEMME"] : ["HOMME"],
            relationTypes: ["SERIEUSE"],
            prompt1Question: u.prompt1Question ?? null,
            prompt1Answer: u.prompt1Answer ?? null,
            prompt2Question: u.prompt2Question ?? null,
            prompt2Answer: u.prompt2Answer ?? null,
            isVerified: u.email === "admin@konekte.ht",
            profileComplete: u.bio ? 75 : 40,
          },
        },
      },
    });
    console.log(`  ✓ ${u.firstName} (${u.email})`);
  }

  console.log("\nTous les utilisateurs ont été créés !");
  console.log("\n--- COMPTES DE TEST ---");
  console.log("Admin   : admin@konekte.ht  / Admin1234!");
  console.log("Marie   : marie@konekte.ht  / Test1234!");
  console.log("Sandra  : sandra@konekte.ht / Test1234!");
  console.log("Rose    : rose@konekte.ht   / Test1234!");
  console.log("Jaslin  : jaslin@konekte.ht / Test1234!");
  console.log("Pierre  : pierre@konekte.ht / Test1234!");
  console.log("Nadège  : nadege@konekte.ht / Test1234!");
  console.log("Jean    : jean@konekte.ht   / Test1234!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
