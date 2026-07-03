/* EduSpher — nav config, role users, category icons */

export const NAV = {
  student: [
    { key: 'student', icon: 'home', label: 'Accueil' },
    { key: 'course', icon: 'book', label: 'Mes cours' },
    { key: 'explore', icon: 'grid', label: 'Explorer' },
    { key: 'quiz', icon: 'quiz', label: 'Évaluations' },
    { key: 'certs', icon: 'award', label: 'Certificats' },
    { key: 'messages', icon: 'message', label: 'Messages' },
  ],
  teacher: [
    { key: 'teacher', icon: 'grid', label: 'Tableau de bord' },
    { key: 'tcourses', icon: 'book', label: 'Mes cours' },
    { key: 'tstudents', icon: 'users', label: 'Étudiants' },
    { key: 'trevenue', icon: 'trending', label: 'Revenus' },
    { key: 'treviews', icon: 'star', label: 'Avis' },
    { key: 'tmessages', icon: 'message', label: 'Messages' },
  ],
  admin: [
    { key: 'admin', icon: 'pieChart', label: "Vue d'ensemble" },
    { key: 'ausers', icon: 'users', label: 'Utilisateurs' },
    { key: 'acourses', icon: 'layers', label: 'Cours' },
    { key: 'arevenue', icon: 'trending', label: 'Revenus' },
  ],
};

export const ROLE_USER = {
  student: { name: 'Julien Mercier', role: 'Étudiant', initials: 'JM', avColor: 'var(--brand-soft)', avInk: 'var(--brand-ink)' },
  teacher: { name: 'Sofia Lemaire', role: 'Formatrice', initials: 'SL', avColor: 'var(--violet-soft)', avInk: 'var(--violet)' },
  admin: { name: 'Admin EduSpher', role: 'Administrateur', initials: 'AE', avColor: 'var(--ink)', avInk: '#fff' },
};

// Libellés et couleurs derives du vrai role Auth.js (enum Prisma Role)
export const ROLE_LABEL = {
  STUDENT: 'Étudiant',
  TEACHER: 'Formateur',
  ADMIN: 'Administrateur',
};

export const ROLE_AVATAR = {
  STUDENT: { avColor: 'var(--brand-soft)', avInk: 'var(--brand-ink)' },
  TEACHER: { avColor: 'var(--violet-soft)', avInk: 'var(--violet)' },
  ADMIN: { avColor: 'var(--ink)', avInk: '#fff' },
};

export function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export const CAT_ICON = {
  'Développement web': 'zap', 'Design produit': 'sparkle', 'Data & IA': 'chart',
  'Marketing': 'trending', 'Langues': 'globe', 'Sécurité': 'shield',
};
