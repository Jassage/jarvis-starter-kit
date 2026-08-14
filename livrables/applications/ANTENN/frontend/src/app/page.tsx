import { redirect } from 'next/navigation';

// L'accueil de la régie est le moniteur d'antenne, pas le formulaire de grille : un
// opérateur qui ouvre l'outil veut d'abord savoir ce qui passe à l'antenne et ce qui
// menace la continuité.
export default function Home() {
  redirect('/moniteur');
}
