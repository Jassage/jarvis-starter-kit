import Link from 'next/link';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SearchBar } from '../components/search/SearchBar';
import { FeaturedListings } from '../components/properties/FeaturedListings';
import { HeroSection } from '../components/home/HeroSection';
import { FaqSection } from '../components/home/FaqSection';
import { DepartmentsSection } from '../components/home/DepartmentsSection';
import { Search, Shield, MessageSquare, TrendingUp, Home, ArrowRight } from 'lucide-react';

const PROPERTY_TYPES = [
  { icon: '🏠', label: 'Maisons', type: 'HOUSE' },
  { icon: '🏢', label: 'Appartements', type: 'APARTMENT' },
  { icon: '🛏️', label: 'Chambres', type: 'ROOM' },
  { icon: '🏰', label: 'Villas', type: 'VILLA' },
  { icon: '📍', label: 'Terrains', type: 'LAND' },
  { icon: '🏪', label: 'Commerciaux', type: 'COMMERCIAL' },
  { icon: '🏬', label: 'Bureaux', type: 'OFFICE' },
  { icon: '🏭', label: 'Entrepôts', type: 'WAREHOUSE' },
];


const FEATURES = [
  {
    icon: Search,
    title: 'Recherche intelligente',
    desc: 'Filtres avancés, carte interactive et points de repère adaptés au contexte haïtien.',
  },
  {
    icon: Shield,
    title: 'Annonces vérifiées',
    desc: 'Chaque annonce est modérée avant publication. Agences et propriétaires vérifiés.',
  },
  {
    icon: MessageSquare,
    title: 'Contact direct',
    desc: 'Messagerie instantanée sécurisée entre locataires, acheteurs et propriétaires.',
  },
  {
    icon: TrendingUp,
    title: 'Estimation gratuite',
    desc: 'Estimez la valeur de votre bien grâce à notre outil d\'évaluation intelligent.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <HeroSection />

      {/* Types de biens */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Quel type de bien recherchez-vous ?</h2>
            <p className="text-gray-400 text-sm">De la chambre à la villa, trouvez ce qui vous correspond</p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {PROPERTY_TYPES.map((type) => (
              <Link
                key={type.type}
                href={`/properties?propertyType=${type.type}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-sm transition-all duration-200 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{type.icon}</span>
                <span className="text-xs font-medium text-gray-600 text-center group-hover:text-primary-600">{type.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Annonces vedettes */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-500 text-sm font-semibold uppercase tracking-wide mb-1">À la une</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">Annonces vedettes</h2>
            </div>
            <Link href="/properties" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 group">
              Voir tout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <FeaturedListings />
          <div className="mt-8 text-center sm:hidden">
            <Link href="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500">
              Voir toutes les annonces <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Départements */}
      <DepartmentsSection />

      {/* Fonctionnalités */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-500 text-sm font-semibold uppercase tracking-wide mb-1">Nos atouts</p>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Pourquoi choisir LAKAY ?</h2>
            <p className="text-gray-500 text-sm">Conçu spécialement pour le marché immobilier haïtien</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div className="text-xs font-bold text-primary-300 mb-1">0{i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* CTA Propriétaire */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-700 via-navy-600 to-primary-600 py-20">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-3">Vous avez un bien à louer ou à vendre ?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Publiez votre annonce gratuitement et touchez des milliers de personnes en Haïti. Vérification en 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
              Publier gratuitement
            </Link>
            <Link href="/pricing" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
              Voir les plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
