// Contenu du portfolio de Jaslin Occius.
// Modifie ces valeurs directement pour mettre a jour le site (aucun code a toucher ailleurs).

export const siteConfig = {
  name: "Jaslin Occius",
  role: "Ingenieur Informatique",
  rotatingRoles: [
    "Ingenieur Logiciel",
    "Developpeur Fullstack Senior",
    "Enseignant en Informatique",
  ],
  location: "Pignon, Haiti",
  email: "ingjasocius06@gmail.com",
  phone: "+509 3336-7148",
  whatsapp: "50933367148",
  // Ajoute tes vrais liens ici quand tu les auras (laisse vide pour ne pas les afficher).
  socials: {
    github: "",
    linkedin: "",
  },
  heroBio:
    "Ingenieur logiciel et enseignant universitaire, je concois des plateformes SaaS completes (gestion bancaire, immobiliere, hoteliere, scolaire...) et je forme la prochaine generation de developpeurs a l'Universite Jerusalem de Pignon.",
  aboutBio: [
    "Enseignant universitaire et ingenieur logiciel passionne par la technologie et la transmission du savoir, specialise en programmation, systemes informatiques et architecture logicielle.",
    "Actuellement coordonnateur de la Faculte des Sciences Informatiques a l'Universite Jerusalem de Pignon d'Haiti (UJEPH) et professeur dans plusieurs institutions, je concois en parallele des plateformes web et mobile completes pour des clients reels : gestion bancaire, ERP commercial, immobilier, hotellerie, e-learning, gestion scolaire.",
  ],
  photo: "/images/jaslin-occius.png",
};

export const stats = [
  { value: "15+", label: "Projets concus" },
  { value: "2024", label: "Coordonnateur a l'UJEPH" },
  { value: "3", label: "Langues parlees" },
];

export const facts = [
  {
    label: "Specialisation",
    value: "Architecture SaaS, Full-Stack, Enseignement",
  },
  { label: "Niveau", value: "Ingenieur Senior & Enseignant universitaire" },
  { label: "Formation", value: "Licence Sciences Informatiques, UJEPH" },
  { label: "Langues", value: "Francais, Creole, Anglais" },
];

export type SkillGroup = {
  title: string;
  skills: { name: string; level: number; note: string }[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Developpement Web & Logiciel",
    skills: [
      {
        name: "JavaScript / TypeScript",
        level: 90,
        note: "Coeur de tous mes projets, front comme back",
      },
      {
        name: "React & Next.js",
        level: 85,
        note: "App Router, composants serveur, interfaces dynamiques",
      },
      {
        name: "Node.js / Express",
        level: 85,
        note: "APIs REST, temps reel (Socket.IO), architecture modulaire",
      },
      {
        name: "Java",
        level: 75,
        note: "Enseigne et pratique, POO et structures de donnees",
      },
    ],
  },
  {
    title: "Donnees & Architecture",
    skills: [
      {
        name: "PostgreSQL / MySQL",
        level: 80,
        note: "Modelisation, requetes complexes, optimisation",
      },
      {
        name: "Prisma ORM",
        level: 80,
        note: "Migrations, schemas relationnels, transactions",
      },
      {
        name: "Architecture SaaS multi-tenant",
        level: 80,
        note: "Isolation des donnees, RBAC, scalabilite",
      },
    ],
  },
  {
    title: "Systemes, Reseaux & Enseignement",
    skills: [
      {
        name: "Administration systeme",
        level: 70,
        note: "Linux, deploiement, gestion de serveurs",
      },
      {
        name: "Reseaux informatiques",
        level: 70,
        note: "Installation, configuration, notions de securite",
      },
      {
        name: "Pedagogie & coordination",
        level: 90,
        note: "Coordination academique, encadrement d'etudiants",
      },
    ],
  },
];

export type Project = {
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  category: string;
  initials: string;
};

export const projectCategories = [
  "Tous",
  "FinTech",
  "Commerce",
  "Immobilier",
  "Hotellerie",
  "Media",
  "Social",
  "Associatif",
  "Education",
];

export const projects: Project[] = [
  {
    title: "BANKA",
    tagline: "Plateforme de gestion bancaire complete",
    description:
      "Comptes multi-devises, credits et amortissement, caisse, RH, comptabilite SYSCOHADA et rapports de conformite BRH.",
    tags: ["Next.js", "Express", "PostgreSQL", "Prisma"],
    category: "FinTech",
    initials: "BK",
  },
  {
    title: "GESCOM",
    tagline: "ERP commercial pour un client reel",
    description:
      "Stock, ventes, achats et comptabilite pour une entreprise avec boutique de detail et entrepot grossiste.",
    tags: ["Next.js", "Express", "PostgreSQL"],
    category: "Commerce",
    initials: "GC",
  },
  {
    title: "LAKAY",
    tagline: "Marketplace immobilier haitien",
    description:
      "Recherche avancee multi-criteres, messagerie temps reel et abonnements pour agences et particuliers.",
    tags: ["Next.js", "Socket.IO", "PostGIS", "Redis"],
    category: "Immobilier",
    initials: "LK",
  },
  {
    title: "OTELA",
    tagline: "PMS hotelier multi-etablissements",
    description:
      "Reservation en ligne et back-office reception, avec moteur anti-double-reservation au niveau base de donnees.",
    tags: ["Next.js", "Express", "PostgreSQL"],
    category: "Hotellerie",
    initials: "OT",
  },
  {
    title: "ANTENN",
    tagline: "Regie de diffusion pour une chaine TV en streaming",
    description:
      "Grille de programmation, gestion des sponsors et player web pour un client de Haitech Solutions.",
    tags: ["Next.js", "Express", "PostgreSQL"],
    category: "Media",
    initials: "AN",
  },
  {
    title: "KONEKTE",
    tagline: "Application de rencontres en production",
    description:
      "Matching, chat temps reel, abonnements premium et paiements, deployee et utilisee reellement.",
    tags: ["Next.js", "Express", "Socket.IO"],
    category: "Social",
    initials: "KN",
  },
  {
    title: "ASSOCOTISE",
    tagline: "Gestion financiere associative",
    description:
      "Suivi des cotisations et depenses d'une association, application 100% client deployee en production.",
    tags: ["React", "Firebase"],
    category: "Associatif",
    initials: "AC",
  },
  {
    title: "EduSpher",
    tagline: "Plateforme e-learning complete",
    description:
      "Cours, quiz, certificats et dashboards eleve/formateur/admin avec paiements Stripe integres.",
    tags: ["Next.js", "Prisma", "Stripe"],
    category: "Education",
    initials: "ES",
  },
];

export type TimelineItem = {
  title: string;
  place: string;
  period: string;
  points: string[];
};

export const experience: TimelineItem[] = [
  {
    title: "Ingenieur Logiciel Senior",
    place: "Haitech Solutions",
    period: "Depuis 2024",
    points: [
      "Conception de plateformes sur mesure pour des clients de l'entreprise (PMS hotelier OTELA, regie de diffusion TV ANTENN)",
      "Architecture technique, choix de stack et livraison de bout en bout",
    ],
  },
  {
    title: "Developpeur Fullstack Freelance",
    place: "Independant",
    period: "Depuis 2020",
    points: [
      "Conception de plateformes web et mobile sur mesure pour entreprises, particuliers et ONG",
      "Architecture SaaS, bases de donnees et deploiement de bout en bout",
      "Plus de 15 projets livres : gestion bancaire, immobilier, hotellerie, e-learning, gestion scolaire",
    ],
  },
  {
    title: "Coordonnateur - Faculte des Sciences Informatiques",
    place: "Universite Jerusalem de Pignon d'Haiti (UJEPH)",
    period: "Depuis novembre 2024",
    points: [
      "Supervision des activites academiques",
      "Coordination des enseignants et suivi pedagogique des etudiants",
      "Organisation d'activites scientifiques",
    ],
  },
  {
    title: "Professeur d'Informatique",
    place: "UJEPH",
    period: "Depuis 2024",
    points: [
      "Java, Introduction a l'informatique, Systemes d'exploitation",
      "Systemes d'information, Reseaux informatiques, MySQL",
    ],
  },
  {
    title: "Professeur de Bureautique",
    place: "AMAG",
    period: "Depuis 2025",
    points: [
      "Enseignement de Word, Excel et PowerPoint (debutant a avance)",
      "Formation orientee vers les besoins du marche professionnel",
    ],
  },
];

export const education: TimelineItem[] = [
  {
    title: "Licence en Sciences Informatiques",
    place: "Universite Jerusalem de Pignon d'Haiti",
    period: "2020 - 2024",
    points: [],
  },
  {
    title: "Fin d'etudes secondaires",
    place: "Lycee Jacques Roumain, Gros-Morne",
    period: "2013 - 2014",
    points: [],
  },
];

export const strengths = [
  {
    title: "Capacite d'adaptation",
    description:
      "Aisance a travailler dans differents environnements academiques et technologiques.",
  },
  {
    title: "Double competence technique et pedagogique",
    description:
      "Maitrise du developpement logiciel combinee a une forte capacite de transmission du savoir.",
  },
  {
    title: "Leadership",
    description:
      "Experience en coordination d'equipe et gestion d'enseignants.",
  },
];

export const services = [
  {
    title: "Developpement Web",
    description:
      "Applications et sites sur mesure avec Next.js, React et Node.js, du prototype au deploiement.",
  },
  {
    title: "Applications Mobile",
    description:
      "Applications cross-platform avec React Native, connectees a une vraie API.",
  },
  {
    title: "Architecture SaaS & Multi-tenant",
    description:
      "Conception de plateformes scalables, securisees et pretes pour plusieurs clients.",
  },
  {
    title: "Formation & Mentorat",
    description:
      "Cours de programmation, systemes et reseaux, en individuel ou en etablissement.",
  },
];

export const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#a-propos", label: "A propos" },
  { href: "#competences", label: "Competences" },
  { href: "#projets", label: "Projets" },
  { href: "#parcours", label: "Parcours" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];
