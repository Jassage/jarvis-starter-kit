'use client';

import { useRouter } from 'next/navigation';

export const ROUTES = {
  landing: '/',
  auth: '/login',
  student: '/student',
  course: '/course',
  quiz: '/quiz',
  teacher: '/teacher',
  admin: '/admin',
  certificate: '/certificate',
  comingSoon: '/bientot-disponible',
};

export const SCREENS = [
  { key: 'landing', label: 'Landing', icon: 'globe' },
  { key: 'auth', label: 'Connexion', icon: 'user' },
  { key: 'student', label: 'Étudiant', icon: 'home' },
  { key: 'course', label: 'Cours', icon: 'play' },
  { key: 'quiz', label: 'Quiz', icon: 'quiz' },
  { key: 'teacher', label: 'Professeur', icon: 'briefcase' },
  { key: 'admin', label: 'Admin', icon: 'shield' },
  { key: 'certificate', label: 'Certificat', icon: 'award' },
];

export function useGo() {
  const router = useRouter();
  return (screen) => router.push(ROUTES[screen] || '/');
}
