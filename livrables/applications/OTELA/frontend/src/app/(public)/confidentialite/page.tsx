import type { Metadata } from 'next';

// Contenu juridique générique — À FAIRE RELIRE PAR UN VRAI JURISTE avant toute mise
// en production réelle, même remarque que mentions-legales/page.tsx. Le contenu
// reflète fidèlement ce que l'application collecte réellement (cf. Client model :
// nom/téléphone/email, aucun tracker tiers dans le codebase), pas une liste
// générique copiée d'ailleurs.

export const metadata: Metadata = {
  title: 'Politique de confidentialité — OTELA',
  description: 'Comment OTELA collecte, utilise et protège les données personnelles de ses clients.',
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--color-ink)' }}>Politique de confidentialité</h1>
      <p className="text-xs mb-10" style={{ color: 'var(--color-ink-3)' }}>Dernière mise à jour : 23 juillet 2026</p>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>1. Données collectées</h2>
          <p>
            Lors d'une réservation, OTELA collecte uniquement : votre nom, votre
            numéro de téléphone et votre adresse email. Aucune autre donnée
            personnelle (pièce d'identité, données bancaires) n'est demandée ni
            stockée sur le site au moment de la réservation en ligne.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>2. Finalité du traitement</h2>
          <p>
            Ces informations servent exclusivement à traiter votre réservation, vous
            envoyer la confirmation et votre facture, et vous permettre de laisser un
            avis après votre séjour. Elles ne sont jamais utilisées à des fins de
            prospection commerciale sans votre consentement explicite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>3. Destinataires</h2>
          <p>
            Vos données sont accessibles uniquement au personnel de l'établissement
            concerné par votre séjour (réception, direction) et à l'administration de
            la chaîne. Elles ne sont jamais vendues ni transmises à des tiers à des
            fins commerciales.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>4. Durée de conservation</h2>
          <p>
            Vos données sont conservées pendant la durée nécessaire à la gestion de
            votre séjour et des obligations comptables qui en découlent (facturation).
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>5. Vos droits</h2>
          <p>
            Vous disposez d'un droit d'accès, de rectification et de suppression de
            vos données personnelles. Pour l'exercer, contactez directement
            l'établissement où vous avez séjourné via la page
            « <a href="/contact" className="underline">Contact</a> ».
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>6. Cookies</h2>
          <p>
            Le site utilise uniquement un cookie technique strictement nécessaire au
            maintien de votre session lorsque vous êtes connecté à l'espace
            professionnel. Aucun cookie publicitaire ni traceur tiers n'est utilisé.
          </p>
        </section>
      </div>
    </div>
  );
}
