/* EduSpher — mock data */

export const courses = [
  { id: 'c1', title: 'React & Next.js : du zéro au déploiement', cat: 'Développement web', level: 'Intermédiaire',
    author: 'Sofia Lemaire', authorRole: 'Lead Engineer · Vercel', hours: 18.5, lessons: 96, rating: 4.9, students: 12840,
    price: 0, tag: 'brand', color: 'brand', blurb: 'Construis des apps full-stack modernes avec React 19, le routing serveur et les Server Actions.' },
  { id: 'c2', title: 'Design UI/UX : systèmes et prototypage', cat: 'Design produit', level: 'Tous niveaux',
    author: 'Marc Dubois', authorRole: 'Design Lead · Figma', hours: 12, lessons: 64, rating: 4.8, students: 9320,
    price: 49, tag: 'violet', color: 'violet', blurb: 'Des fondations visuelles aux design systems livrables, pensés pour le dev.' },
  { id: 'c3', title: 'Python pour la Data Science & le ML', cat: 'Data & IA', level: 'Débutant',
    author: 'Amina Khelifi', authorRole: 'Data Scientist · Doctolib', hours: 22, lessons: 110, rating: 4.9, students: 18200,
    price: 59, tag: 'teal', color: 'teal', blurb: 'Pandas, visualisation, et premiers modèles de machine learning sur cas réels.' },
  { id: 'c4', title: 'Marketing digital & growth en 2026', cat: 'Marketing', level: 'Intermédiaire',
    author: 'Thomas Roy', authorRole: 'Head of Growth · Qonto', hours: 9.5, lessons: 48, rating: 4.7, students: 7610,
    price: 39, tag: 'amber', color: 'amber', blurb: 'SEO, acquisition payante, et boucles de croissance qui scalent.' },
  { id: 'c5', title: 'Anglais professionnel & prise de parole', cat: 'Langues', level: 'Tous niveaux',
    author: 'Emma Carter', authorRole: 'Coach · Cambridge', hours: 14, lessons: 72, rating: 4.8, students: 15400,
    price: 0, tag: 'green', color: 'green', blurb: 'Gagne en aisance pour les réunions, présentations et négociations.' },
  { id: 'c6', title: 'Cybersécurité : fondamentaux défensifs', cat: 'Sécurité', level: 'Intermédiaire',
    author: 'Lucas Fontaine', authorRole: 'Security Eng · OVHcloud', hours: 16, lessons: 88, rating: 4.9, students: 6240,
    price: 69, tag: 'rose', color: 'rose', blurb: 'Comprendre les menaces, sécuriser les apps et répondre aux incidents.' },
];

export const enrolled = [
  { id: 'c1', progress: 68, nextLesson: 'Server Actions & mutations', moduleIdx: 6, totalModules: 9, lastSeen: 'il y a 2 h', due: 'Certificat à 100%' },
  { id: 'c3', progress: 34, nextLesson: 'Nettoyer un dataset avec Pandas', moduleIdx: 3, totalModules: 11, lastSeen: 'hier', due: 'Quiz Module 3 dispo' },
  { id: 'c2', progress: 92, nextLesson: 'Livrer un design system', moduleIdx: 8, totalModules: 9, lastSeen: 'il y a 3 j', due: 'Bientôt terminé' },
];

export const modules = [
  { id: 'm1', title: 'Mise en route', done: true, lessons: [
    { id: 'l1', title: 'Bienvenue & objectifs du cours', type: 'video', dur: '4:12', done: true },
    { id: 'l2', title: "Installer l'environnement", type: 'video', dur: '8:40', done: true },
    { id: 'l3', title: 'Ressources & repo de départ', type: 'pdf', dur: 'PDF', done: true },
  ]},
  { id: 'm2', title: 'Les fondations de React', done: true, lessons: [
    { id: 'l4', title: 'Composants & JSX', type: 'video', dur: '12:05', done: true },
    { id: 'l5', title: 'Props, state et événements', type: 'video', dur: '15:22', done: true },
    { id: 'l6', title: 'Quiz — Fondations', type: 'quiz', dur: '10 q', done: true },
  ]},
  { id: 'm3', title: 'Routing avec Next.js', done: false, current: true, lessons: [
    { id: 'l7', title: 'App Router & layouts', type: 'video', dur: '14:18', done: true },
    { id: 'l8', title: 'Server vs Client Components', type: 'video', dur: '11:47', done: false, current: true },
    { id: 'l9', title: 'Data fetching & cache', type: 'video', dur: '16:30', done: false },
    { id: 'l10', title: 'Ressources — Patterns de routing', type: 'pdf', dur: 'PDF', done: false },
  ]},
  { id: 'm4', title: 'Server Actions & mutations', done: false, lessons: [
    { id: 'l11', title: 'Formulaires & actions serveur', type: 'video', dur: '13:55', done: false },
    { id: 'l12', title: "Validation & gestion d'erreurs", type: 'video', dur: '12:10', done: false },
    { id: 'l13', title: 'Quiz — Server Actions', type: 'quiz', dur: '12 q', done: false },
  ]},
  { id: 'm5', title: 'Déploiement & production', done: false, lessons: [
    { id: 'l14', title: 'Optimiser le build', type: 'video', dur: '9:42', done: false },
    { id: 'l15', title: 'Déployer sur Vercel', type: 'video', dur: '7:28', done: false },
    { id: 'l16', title: 'Projet final & certificat', type: 'project', dur: 'Projet', done: false },
  ]},
];

export const quiz = {
  title: 'Quiz — Routing avec Next.js',
  course: 'React & Next.js : du zéro au déploiement',
  duration: 600, // seconds
  questions: [
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
  ],
};

export const students = [
  { name: 'Camille Bernard', email: 'camille.b@mail.com', progress: 86, courses: 4, active: 'il y a 1 h', status: 'active' },
  { name: 'Yanis Moreau', email: 'yanis.m@mail.com', progress: 42, courses: 2, active: 'hier', status: 'active' },
  { name: 'Léa Petit', email: 'lea.petit@mail.com', progress: 100, courses: 6, active: 'il y a 3 h', status: 'certified' },
  { name: 'Omar Haddad', email: 'omar.h@mail.com', progress: 18, courses: 1, active: 'il y a 5 j', status: 'risk' },
  { name: 'Chloé Girard', email: 'chloe.g@mail.com', progress: 73, courses: 3, active: 'il y a 2 h', status: 'active' },
  { name: 'Nathan Lefebvre', email: 'nathan.l@mail.com', progress: 55, courses: 2, active: 'hier', status: 'active' },
];

export const teacherCourses = [
  { title: 'React & Next.js : du zéro au déploiement', students: 12840, rating: 4.9, status: 'published', revenue: 48200, completion: 64 },
  { title: 'TypeScript avancé pour les pros', students: 3120, rating: 4.8, status: 'published', revenue: 14600, completion: 58 },
  { title: "Architecture front-end à l'échelle", students: 0, rating: 0, status: 'draft', revenue: 0, completion: 0 },
];

export const notifications = [
  { icon: 'award', color: 'amber', title: 'Certificat débloqué', body: 'Tu as terminé « Design UI/UX » à 92%.', time: '2 h' },
  { icon: 'message', color: 'brand', title: 'Réponse de Sofia Lemaire', body: 'À propos de ta question sur les Server Actions.', time: '5 h' },
  { icon: 'quiz', color: 'violet', title: 'Nouveau quiz disponible', body: 'Module 3 — Routing avec Next.js.', time: 'hier' },
  { icon: 'fire', color: 'rose', title: 'Série de 7 jours 🔥', body: 'Continue pour atteindre 10 jours.', time: 'hier' },
];

export const adminStats = { users: 48210, courses: 312, revenue: 184500, completion: 61, mrr: 22400, refunds: 1.4 };

export const quizzes = [
  { id: 'q1', title: 'Quiz — Fondations React', module: 'Module 2', course: 'React & Next.js : du zéro au déploiement', status: 'done', score: 80, passed: true, questions: 10, minutes: 10 },
  { id: 'q2', title: 'Quiz — Routing avec Next.js', module: 'Module 3', course: 'React & Next.js : du zéro au déploiement', status: 'available', score: null, passed: false, questions: 5, minutes: 10 },
  { id: 'q3', title: 'Quiz — Server Actions', module: 'Module 4', course: 'React & Next.js : du zéro au déploiement', status: 'locked', score: null, passed: false, questions: 12, minutes: 12 },
  { id: 'q4', title: 'Quiz — Données avec Pandas', module: 'Module 2', course: 'Python pour la Data Science & le ML', status: 'done', score: 70, passed: true, questions: 8, minutes: 8 },
  { id: 'q5', title: 'Examen final — Design UI/UX', module: 'Module 8', course: 'Design UI/UX : systèmes et prototypage', status: 'available', score: null, passed: false, questions: 15, minutes: 15 },
];

export const certificates = [
  { title: 'Anglais professionnel & prise de parole', instructor: 'Emma Carter', date: '3 mars 2026', score: 88, certId: 'CERT-2026-45102', color: 'green', hours: 14 },
  { title: 'Design UI/UX : systèmes et prototypage', instructor: 'Marc Dubois', date: '12 juin 2026', score: 92, certId: 'CERT-2026-88210', color: 'violet', hours: 12 },
];

export const byId = (id) => courses.find((c) => c.id === id);

export const EDU = {
  courses, enrolled, modules, quiz, quizzes, certificates, students, teacherCourses, notifications, adminStats, byId,
};
