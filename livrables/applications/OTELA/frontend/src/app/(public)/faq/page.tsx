import type { Metadata } from 'next';
import FaqAccordion from './FaqAccordion';

export const metadata: Metadata = {
  title: 'Questions fréquentes — OTELA',
  description: 'Réponses aux questions les plus fréquentes sur la réservation, le paiement et l\'annulation avec OTELA.',
};

// Reflète l'état réel de l'application (pas de promesses sur des fonctionnalités non
// livrées) — notamment le paiement en ligne, non encore actif (point #10 du cahier
// des charges, bloqué sur les credentials Digicel/MonCash).
const QUESTIONS = [
  { q: 'Comment réserver une chambre ?', a: 'Rendez-vous sur la page "Réserver", choisissez un établissement (ou laissez la recherche parcourir tous les établissements), vos dates et le nombre de personnes. La réservation est confirmée immédiatement.' },
  { q: 'Puis-je réserver seulement pour la journée, sans y passer la nuit ?', a: 'Oui, certains établissements proposent un forfait "Day-use" (à la journée). Choisissez l\'option "Day-use" dans le formulaire de recherche et indiquez vos horaires d\'arrivée et de départ.' },
  { q: 'Comment consulter ma réservation après l\'avoir effectuée ?', a: 'Rendez-vous sur la page "Ma réservation" et indiquez votre référence (reçue par email, au format OT-XXXXXX) ainsi que l\'adresse email utilisée lors de la réservation.' },
  { q: 'Comment annuler ma réservation ?', a: 'Chaque établissement applique sa propre politique d\'annulation, indiquée sur votre fiche de réservation. Contactez directement l\'établissement via la page Contact pour toute annulation.' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Le règlement s\'effectue actuellement sur place, à votre arrivée, en gourdes (HTG) ou en dollars américains (USD) selon l\'établissement. Le paiement en ligne au moment de la réservation sera disponible prochainement.' },
  { q: 'Puis-je laisser un avis sur mon séjour ?', a: 'Oui, une fois votre séjour terminé, rendez-vous sur "Ma réservation" avec votre référence et votre email : un formulaire d\'avis apparaît automatiquement pour les séjours achevés.' },
  { q: 'Quelles sont les heures de check-in et de check-out ?', a: 'Elles varient selon l\'établissement et sont indiquées sur sa fiche ainsi que dans votre email de confirmation.' },
  { q: 'Comment contacter un établissement directement ?', a: 'Toutes les coordonnées (adresse, téléphone, email) de chaque établissement de la chaîne sont regroupées sur la page Contact.' },
];

export default function FaqPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--color-ink)' }}>Questions fréquentes</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-3)' }}>Tout ce qu'il faut savoir avant, pendant et après votre séjour.</p>
      <FaqAccordion questions={QUESTIONS} />
    </div>
  );
}
