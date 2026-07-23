import type { Metadata } from 'next';

// Contenu juridique générique rédigé pour combler le point #5 du cahier des charges
// (site vitrine 10 pages) — À FAIRE RELIRE PAR UN VRAI JURISTE avant toute mise en
// production réelle. N'engage pas Haitech Solutions tel quel.

export const metadata: Metadata = {
  title: 'Mentions légales — OTELA',
  description: 'Mentions légales de la plateforme OTELA, éditée par Haitech Solutions.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--color-ink)' }}>Mentions légales</h1>
      <p className="text-xs mb-10" style={{ color: 'var(--color-ink-3)' }}>Dernière mise à jour : 23 juillet 2026</p>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>1. Éditeur du site</h2>
          <p>
            La plateforme OTELA est éditée par <strong>Haitech Solutions</strong>, société
            exploitant la chaîne hôtelière OTELA en Haïti. Pour toute question relative
            à l'édition du site, voir les coordonnées de nos établissements sur la
            page <a href="/contact" className="underline">Contact</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>2. Hébergement</h2>
          <p>
            Le site et l'application de réservation sont hébergés sur une infrastructure
            dédiée. Les coordonnées complètes de l'hébergeur sont communiquées sur
            demande auprès de l'éditeur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>3. Propriété intellectuelle</h2>
          <p>
            L'ensemble des éléments du site OTELA (textes, logos, photographies,
            structure du site) est protégé au titre de la propriété intellectuelle.
            Toute reproduction, même partielle, sans autorisation préalable est
            interdite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>4. Responsabilité</h2>
          <p>
            Haitech Solutions s'efforce d'assurer l'exactitude des informations
            diffusées sur le site (disponibilités, tarifs, descriptions des
            établissements) mais ne saurait être tenue responsable des erreurs ou
            omissions, ni de l'indisponibilité temporaire du service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-ink)' }}>5. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit haïtien. Tout litige
            relatif à leur interprétation ou à leur exécution relève de la compétence
            des juridictions haïtiennes.
          </p>
        </section>
      </div>
    </div>
  );
}
