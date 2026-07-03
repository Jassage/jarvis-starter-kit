'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Zap, X, Phone, Copy, Check, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { paymentsApi } from '@/lib/api';

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

type Method = 'MONCASH' | 'NATCASH';

function SubscriptionModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [method, setMethod] = useState<Method>('MONCASH');
  const [copied, setCopied] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [done, setDone] = useState(false);

  const { data: methodsData } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentsApi.getMethods().then(r => r.data.data.numbers),
  });

  const numbers = methodsData?.[method] as { number: string; name: string } | undefined;
  const payNumber = numbers?.number ?? '...';

  const submitMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('planId', plan.id);
      fd.append('method', method);
      fd.append('currency', plan.currency || 'HTG');
      fd.append('transactionRef', transactionRef);
      if (senderNumber) fd.append('senderNumber', senderNumber);
      if (screenshot) fd.append('screenshot', screenshot);
      return paymentsApi.submitProof(fd);
    },
    onSuccess: () => setDone(true),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(payNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const errorMsg = (submitMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white sticky top-0">
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

        {done ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Preuve envoyée !</h3>
            <p className="text-sm text-gray-500">
              Notre équipe vérifie votre transfert. Votre plan <strong>{plan.name}</strong> sera activé sous 24h ouvrables.
              Vous recevrez une notification.
            </p>
            <button onClick={onClose} className="mt-2 w-full py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors">
              Terminé
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Choix méthode */}
            <div className="grid grid-cols-2 gap-2">
              {(['MONCASH', 'NATCASH'] as Method[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    method === m ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m === 'MONCASH' ? 'MonCash' : 'NatCash'}
                </button>
              ))}
            </div>

            {/* Étape 1 : envoyer */}
            <div>
              <p className="text-sm text-gray-700 font-medium mb-1.5">
                1. Transférez <strong className="text-gray-900">{formatPrice(plan.price, plan.currency)}</strong> au numéro {method === 'MONCASH' ? 'MonCash' : 'NatCash'} :
              </p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
                <Phone className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-mono font-semibold text-gray-900">{payNumber}</span>
                {numbers?.name && <span className="text-xs text-gray-400">({numbers.name})</span>}
                <button onClick={handleCopy} className="ml-auto text-gray-400 hover:text-primary-500 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Étape 2 : preuve */}
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium">2. Envoyez la preuve du transfert</p>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Référence / ID de transaction *</label>
                <input
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  placeholder="Ex : le code reçu par SMS"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Votre numéro d'envoi (optionnel)</label>
                <input
                  value={senderNumber}
                  onChange={e => setSenderNumber(e.target.value)}
                  placeholder="+509 ..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div>
                <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{screenshot ? screenshot.name : 'Capture d\'écran (optionnel)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setScreenshot(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

            <button
              onClick={() => submitMutation.mutate()}
              disabled={!transactionRef.trim() || submitMutation.isPending}
              className="w-full py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : 'Envoyer ma preuve de paiement'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Activation sous 24h après vérification. Le paiement automatique arrive bientôt.
            </p>
          </div>
        )}
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
