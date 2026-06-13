const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

const courses = [
  { id: 'c1', title: 'React & Next.js : du zéro au déploiement', cat: 'Développement web', level: 'Intermédiaire',
    hours: 18.5, price: 0, color: 'brand',
    blurb: 'Construis des apps full-stack modernes avec React 19, le routing serveur et les Server Actions.' },
  { id: 'c2', title: 'Design UI/UX : systèmes et prototypage', cat: 'Design produit', level: 'Tous niveaux',
    hours: 12, price: 49, color: 'violet',
    blurb: 'Des fondations visuelles aux design systems livrables, pensés pour le dev.' },
  { id: 'c3', title: 'Python pour la Data Science & le ML', cat: 'Data & IA', level: 'Débutant',
    hours: 22, price: 59, color: 'teal',
    blurb: 'Pandas, visualisation, et premiers modèles de machine learning sur cas réels.' },
  { id: 'c4', title: 'Marketing digital & growth en 2026', cat: 'Marketing', level: 'Intermédiaire',
    hours: 9.5, price: 39, color: 'amber',
    blurb: 'SEO, acquisition payante, et boucles de croissance qui scalent.' },
  { id: 'c5', title: 'Anglais professionnel & prise de parole', cat: 'Langues', level: 'Tous niveaux',
    hours: 14, price: 0, color: 'green',
    blurb: 'Gagne en aisance pour les réunions, présentations et négociations.' },
  { id: 'c6', title: 'Cybersécurité : fondamentaux défensifs', cat: 'Sécurité', level: 'Intermédiaire',
    hours: 16, price: 69, color: 'rose',
    blurb: 'Comprendre les menaces, sécuriser les apps et répondre aux incidents.' },
];

// Modules/leçons du cours c1, utilisés pour la démo de structure de contenu
const modules = [
  { title: 'Mise en route', order: 0, lessons: [
    { title: 'Bienvenue & objectifs du cours', type: 'VIDEO', duration: '4:12', order: 0 },
    { title: "Installer l'environnement", type: 'VIDEO', duration: '8:40', order: 1 },
    { title: 'Ressources & repo de départ', type: 'PDF', duration: 'PDF', order: 2 },
  ]},
  { title: 'Les fondations de React', order: 1, lessons: [
    { title: 'Composants & JSX', type: 'VIDEO', duration: '12:05', order: 0 },
    { title: 'Props, state et événements', type: 'VIDEO', duration: '15:22', order: 1 },
    { title: 'Quiz — Fondations', type: 'QUIZ', duration: '10 q', order: 2 },
  ]},
  { title: 'Routing avec Next.js', order: 2, lessons: [
    { title: 'App Router & layouts', type: 'VIDEO', duration: '14:18', order: 0 },
    { title: 'Server vs Client Components', type: 'VIDEO', duration: '11:47', order: 1 },
    { title: 'Data fetching & cache', type: 'VIDEO', duration: '16:30', order: 2 },
    { title: 'Ressources — Patterns de routing', type: 'PDF', duration: 'PDF', order: 3 },
  ]},
  { title: 'Server Actions & mutations', order: 3, lessons: [
    { title: 'Formulaires & actions serveur', type: 'VIDEO', duration: '13:55', order: 0 },
    { title: "Validation & gestion d'erreurs", type: 'VIDEO', duration: '12:10', order: 1 },
    { title: 'Quiz — Server Actions', type: 'QUIZ', duration: '12 q', order: 2 },
  ]},
  { title: 'Déploiement & production', order: 4, lessons: [
    { title: 'Optimiser le build', type: 'VIDEO', duration: '9:42', order: 0 },
    { title: 'Déployer sur Vercel', type: 'VIDEO', duration: '7:28', order: 1 },
    { title: 'Projet final & certificat', type: 'PROJECT', duration: 'Projet', order: 2 },
  ]},
];

const quizQuestions = [
  { q: "Dans l'App Router de Next.js, quel fichier définit une interface partagée persistante entre plusieurs pages ?",
    options: ['page.js', 'layout.js', 'route.js', 'template.js'], answer: 1,
    explain: "layout.js enveloppe les pages d'un segment et persiste lors de la navigation, contrairement à template.js qui se remonte à chaque navigation." },
  { q: 'Par défaut, les composants dans l\'App Router sont…',
    options: ['des Client Components', 'des Server Components', 'des composants statiques', 'rendus uniquement côté client'], answer: 1,
    explain: 'Tous les composants sont des Server Components par défaut ; on ajoute "use client" pour basculer côté client.' },
  { q: 'Quelle directive transforme un composant en Client Component ?',
    options: ['"use server"', '"use strict"', '"use client"', '"client only"'], answer: 2,
    explain: 'La directive "use client" en haut du fichier marque la frontière client.' },
  { q: "Quel hook permet de lire les paramètres dynamiques d'une route côté client ?",
    options: ['useRouter', 'useParams', 'useSearchParams', 'usePathname'], answer: 1,
    explain: 'useParams() renvoie les segments dynamiques de la route courante.' },
  { q: "Pour un chargement progressif d'un segment, on utilise le fichier…",
    options: ['loading.js', 'spinner.js', 'suspense.js', 'pending.js'], answer: 0,
    explain: 'loading.js crée automatiquement une frontière Suspense avec un état de chargement.' },
];

const notifications = [
  { icon: 'award', color: 'amber', title: 'Certificat débloqué', body: 'Tu as terminé « Design UI/UX » à 92%.' },
  { icon: 'message', color: 'brand', title: 'Réponse de Sofia Lemaire', body: 'À propos de ta question sur les Server Actions.' },
  { icon: 'quiz', color: 'violet', title: 'Nouveau quiz disponible', body: 'Module 3 — Routing avec Next.js.' },
  { icon: 'fire', color: 'rose', title: 'Série de 7 jours 🔥', body: 'Continue pour atteindre 10 jours.' },
];

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const student = await prisma.user.upsert({
    where: { email: 'julien@eduspher.com' },
    update: {},
    create: { name: 'Julien Mercier', email: 'julien@eduspher.com', passwordHash, role: 'STUDENT' },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'sofia@eduspher.com' },
    update: {},
    create: { name: 'Sofia Lemaire', email: 'sofia@eduspher.com', passwordHash, role: 'TEACHER' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@eduspher.com' },
    update: {},
    create: { name: 'Admin EduSpher', email: 'admin@eduspher.com', passwordHash, role: 'ADMIN' },
  });

  // Cours : tous rattachés à Sofia (seul compte formateur de démo)
  const courseRecords = {};
  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { slug: slugify(c.title) },
      update: {},
      create: {
        slug: slugify(c.title),
        title: c.title,
        description: c.blurb,
        category: c.cat,
        level: c.level,
        price: c.price,
        hours: c.hours,
        color: c.color,
        status: 'PUBLISHED',
        authorId: teacher.id,
      },
    });
    courseRecords[c.id] = course;
  }

  // Modules/leçons du cours c1
  let quizLessonForFondations = null;
  for (const m of modules) {
    const mod = await prisma.module.create({
      data: { title: m.title, order: m.order, courseId: courseRecords.c1.id },
    });
    for (const l of m.lessons) {
      const lesson = await prisma.lesson.create({
        data: { title: l.title, type: l.type, duration: l.duration, order: l.order, moduleId: mod.id },
      });
      if (l.title === 'Quiz — Fondations') quizLessonForFondations = lesson;
    }
  }

  // Quiz de démo (rattaché au module "Les fondations de React")
  let demoQuiz = null;
  if (quizLessonForFondations) {
    demoQuiz = await prisma.quiz.create({
      data: {
        lessonId: quizLessonForFondations.id,
        title: 'Quiz — Fondations React',
        durationSeconds: 600,
        questions: {
          create: quizQuestions.map((q, i) => ({
            order: i,
            text: q.q,
            options: q.options,
            answer: q.answer,
            explain: q.explain,
          })),
        },
      },
    });
  }

  // Inscriptions de Julien
  const enrolled = [
    { courseId: 'c1', progress: 68 },
    { courseId: 'c3', progress: 34 },
    { courseId: 'c2', progress: 92 },
  ];
  for (const e of enrolled) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: courseRecords[e.courseId].id } },
      update: { progress: e.progress },
      create: { userId: student.id, courseId: courseRecords[e.courseId].id, progress: e.progress },
    });
  }

  // Tentative de quiz réussie pour Julien
  if (demoQuiz) {
    await prisma.quizAttempt.create({
      data: { userId: student.id, quizId: demoQuiz.id, score: 80, passed: true },
    });
  }

  // Certificats de Julien
  const certificates = [
    { certId: 'CERT-2026-45102', courseId: 'c5', score: 88, hours: 14 },
    { certId: 'CERT-2026-88210', courseId: 'c2', score: 92, hours: 12 },
  ];
  for (const cert of certificates) {
    await prisma.certificate.upsert({
      where: { certId: cert.certId },
      update: {},
      create: {
        certId: cert.certId,
        userId: student.id,
        courseId: courseRecords[cert.courseId].id,
        score: cert.score,
        hours: cert.hours,
      },
    });
  }

  // Notifications de Julien
  for (const n of notifications) {
    await prisma.notification.create({
      data: { userId: student.id, icon: n.icon, color: n.color, title: n.title, body: n.body },
    });
  }

  console.log('Seed terminé.');
  console.log('Comptes de démo (mot de passe commun : ' + DEMO_PASSWORD + ') :');
  console.log('  - Étudiant   : julien@eduspher.com');
  console.log('  - Formateur  : sofia@eduspher.com');
  console.log('  - Admin      : admin@eduspher.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
