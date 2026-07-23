import type { Metadata } from 'next';

// Contenu juridique générique — À FAIRE RELIRE PAR UN VRAI JURISTE avant toute mise
// en production réelle, même remarque que mentions-legales/page.tsx.

export const metadata: Metadata = {
  title: 'Conditions générales — OTELA',
  description: 'Conditions générales d\'utilisation et de vente de la plateforme de réservation OTELA.',
};

export default function CguPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--color-ink)' }}>Conditions générales d'utilisation et de vente</h1>
      <p className="text-xs mb-10" style={{ color: 'var(--color-ink-3)' }}>Dernière mise à jour : 23 juillet 2026</p>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>1. Objet</h2>
          <p>
            Les présentes conditions régissent l'utilisation du site OTELA et la
            réservation en ligne de chambres dans l'un des établissements de la chaîne.
            Toute réservation effectuée sur le site implique l'acceptation pleine et
            entière des présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>2. Réservation</h2>
          <p>
            La réservation est confirmée dès sa validation sur le site ; une référence
            unique et un email de confirmation sont alors transmis au client. Le client
            peut consulter sa réservation à tout moment via la page
            « <a href="/ma-reservation" className="underline">Ma réservation</a> », en
            indiquant sa référence et l'email utilisé lors de la réservation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>3. Tarifs et paiement</h2>
          <p>
            Les tarifs affichés sont exprimés en gourdes (HTG) ou en dollars américains
            (USD), selon le choix effectué lors de la recherche, et incluent les taxes
            applicables. Le prix affiché au moment de la réservation est le prix dû,
            sans conversion ni frais cachés.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>4. Annulation</h2>
          <p>
            Chaque établissement de la chaîne applique sa propre politique
            d'annulation, communiquée lors de la réservation et consultable à tout
            moment sur la fiche de la réservation via « Ma réservation ». À défaut de
            politique spécifique, l'annulation reste possible jusqu'à l'arrivée prévue,
            sous réserve des conditions communiquées par l'établissement.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>5. Obligations du client</h2>
          <p>
            Le client s'engage à fournir des informations exactes lors de la
            réservation et à se présenter à l'établissement muni d'une pièce
            d'identité. Toute dégradation constatée dans la chambre pourra faire
            l'objet d'une facturation complémentaire.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>6. Modification des présentes conditions</h2>
          <p>
            Haitech Solutions se réserve le droit de modifier les présentes conditions
            à tout moment. Les conditions applicables sont celles en vigueur à la date
            de la réservation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>7. Droit applicable et litiges</h2>
          <p>
            Les présentes conditions sont soumises au droit haïtien. En cas de litige,
            une solution amiable sera recherchée avant toute action devant les
            juridictions compétentes en Haïti.
          </p>
        </section>
      </div>
    </div>
  );
}
