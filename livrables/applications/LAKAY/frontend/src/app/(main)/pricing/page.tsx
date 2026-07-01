'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Zap, X, Phone, Mail, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const PLANS = [
  {
    id: 'FREE',
    name: 'Gratuit',
    price: 0,
    currency: 'HTG',
    period: '',
    description: 'Pour démarrer et tester la plateforme',
    color: 'border-gray-200',
    badge: '',
    features: [
      '3 annonces actives',
      'Validité 60 jours par annonce',
      'Photos illimitées',
      'Messagerie incluse',
      'Statistiques basiques',
    ],
  },
  {
    id: 'BASIC',
    name: 'Basic',
    price: 2500,
    currency: 'HTG',
    period: '/ 3 mois',
    description: 'Pour les propriétaires actifs',
    color: 'border-primary-300',
    badge: 'Populaire',
    features: [
      '20 annonces actives',
      'Validité 90 jours par annonce',
      'Photos illimitées',
      'Messagerie incluse',
      'Statistiques avancées',
      'Badge "Propriétaire vérifié"',
    ],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professionnel',
    price: 6500,
    currency: 'HTG',
    period: '/ 6 mois',
    description: 'Pour les agents et agences',
    color: 'border-navy-300',
    badge: '',
    features: [
      'Annonces illimitées',
      'Validité 180 jours par annonce',
      'Photos illimitées',
      'Messagerie incluse',
      'Statistiques avancées',
      'Badge "Pro"',
      'Mise en avant des annonces',
      'Support prioritaire',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Entreprise',
    price: 0,
    currency: '',
    period: '',
    description: 'Pour les grandes agences et promoteurs',
    color: 'border-gray-800',
    badge: 'Sur mesure',
    features: [
      'Tout du plan Professionnel',
      'Validité 365 jours par annonce',
      'Tableau de bord agence',
      "API d'accès",
      'Intégration personnalisée',
      'Account manager dédié',
    ],
  },
];

type Plan = typeof PLANS[number];

function formatPrice(price: number, currency: string) {
  if (price === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-HT').format(price) + ' ' + currency;
}

function SubscriptionModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const MONCASH_NUMBER = '+509 3000-0000';
  const CONTACT_EMAIL = 'contact@lakay.ht';

  const handleCopy = () => {
    navigator.clipboard.writeText(MONCASH_NUMBER.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Plan sélectionné</span>
          </div>
          <h2 className="text-2xl font-display font-bold">{plan.name}</h2>
          <p className="text-3xl font-bold mt-1">
            {formatPrice(plan.price, plan.currency)}
            {plan.period && <span className="text-base font-normal opacity-75 ml-1">{plan.period}</span>}
          </p>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Comment payer ?</h3>
            <div className="space-y-3">
              {/* Étape 1 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Envoyez via MonCash</p>
                  <p className="text-xs text-gray-500">
                    Montant : <strong className="text-gray-800">{formatPrice(plan.price, plan.currency)}</strong>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <Phone className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-mono font-semibold text-gray-900">{MONCASH_NUMBER}</span>
                    <button onClick={handleCopy} className="ml-auto text-gray-400 hover:text-primary-500 transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              {/* Étape 2 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Envoyez votre reçu par email</p>
                  <p className="text-xs text-gray-500 mb-1.5">Joignez la capture d'écran MonCash + votre email de compte LAKAY</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Abonnement ${plan.name} - Reçu MonCash`}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 text-sm font-medium text-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              {/* Étape 3 */}
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Activation sous 24h</p>
                  <p className="text-xs text-gray-500">Votre plan sera activé après vérification du paiement.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">
              Le paiement en ligne automatique (MonCash API) sera disponible prochainement. En attendant, le processus manuel prend moins de 24h ouvrables.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleChoosePlan = (plan: Plan) => {
    if (!isAuthenticated) { router.push('/register'); return; }
    setSelectedPlan(plan);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
          Des tarifs adaptés à vos besoins
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Commencez gratuitement, évoluez selon votre activité. Tous les plans incluent l'accès à la messagerie et aux statistiques.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 ${plan.color} p-6 flex flex-col`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}

            <div className="mb-5">
              <h3 className="font-display font-bold text-gray-900 text-lg">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
            </div>

            <div className="mb-6">
              {plan.id === 'ENTERPRISE' ? (
                <p className="text-2xl font-bold text-gray-900">Sur devis</p>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(plan.price, plan.currency)}</span>
                  {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
                </div>
              )}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.id === 'ENTERPRISE' ? (
              <a
                href="mailto:contact@lakay.ht"
                className="block text-center px-4 py-2.5 border-2 border-gray-800 text-gray-800 font-semibold rounded-xl hover:bg-gray-800 hover:text-white transition-colors text-sm"
              >
                Nous contacter
              </a>
            ) : plan.id === 'FREE' ? (
              <Link
                href={isAuthenticated ? '/dashboard' : '/register'}
                className="block text-center px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                {isAuthenticated ? 'Mon tableau de bord' : 'Commencer'}
              </Link>
            ) : (
              <button
                onClick={() => handleChoosePlan(plan)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-sm w-full"
              >
                <Zap className="w-4 h-4" />
                Choisir ce plan
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-navy-50 rounded-2xl p-6 text-center">
        <p className="text-gray-600 text-sm">
          Des questions sur les tarifs ? Écrivez-nous à{' '}
          <a href="mailto:contact@lakay.ht" className="text-primary-500 font-medium hover:underline">
            contact@lakay.ht
          </a>{' '}
          ou appelez le{' '}
          <a href="tel:+50930000000" className="text-primary-500 font-medium hover:underline">
            +509 3000-0000
          </a>
        </p>
      </div>

      {selectedPlan && (
        <SubscriptionModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
