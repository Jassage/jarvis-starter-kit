'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const FAQS = [
  {
    q: 'Comment publier une annonce sur LAKAY ?',
    a: "Créez un compte gratuit, cliquez sur \"Publier\" dans le menu, remplissez les informations de votre bien (type, localisation, prix, photos) et soumettez. Votre annonce sera vérifiée par notre équipe sous 24h.",
  },
  {
    q: 'Est-ce que LAKAY est gratuit ?',
    a: "Oui, la publication d'annonces de base est gratuite. Des plans payants (Pro, Agence) sont disponibles pour des fonctionnalités avancées : plus de photos, mise en avant, statistiques détaillées.",
  },
  {
    q: 'Comment contacter un propriétaire ?',
    a: "Sur la page de chaque annonce, vous pouvez envoyer un message directement via notre messagerie sécurisée ou via WhatsApp si le propriétaire a renseigné son numéro.",
  },
  {
    q: 'Comment sont vérifiées les annonces ?',
    a: "Chaque annonce est examinée par notre équipe avant publication. Nous vérifions la cohérence des informations et nous contactons le propriétaire si nécessaire. Les agences partenaires ont un badge vérifié.",
  },
  {
    q: 'Comment fonctionne la carte interactive ?',
    a: "La carte affiche les annonces géolocalisées avec leurs points de repère (routes principales, marchés, écoles). Vous pouvez filtrer par zone en dessinant directement sur la carte.",
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: "Les annonces gratuites ne nécessitent aucun paiement. Pour les plans payants, nous acceptons MonCash, Digicel Top Up, cartes Visa/Mastercard et virements bancaires.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('border rounded-2xl overflow-hidden transition-all duration-200', open ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200 bg-white')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-medium text-gray-900 text-sm sm:text-base">{q}</span>
        <ChevronDown className={cn('w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200', open && 'rotate-180 text-primary-500')} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Questions fréquentes</h2>
          <p className="text-gray-500 text-sm">Tout ce que vous devez savoir sur LAKAY</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
