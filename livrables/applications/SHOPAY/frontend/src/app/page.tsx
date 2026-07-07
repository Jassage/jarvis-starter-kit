import Link from 'next/link';
import { Store, Package, CreditCard, BarChart3, ShieldCheck, Smartphone } from 'lucide-react';

const FEATURES = [
  { icon: Store, title: 'Votre boutique en ligne', desc: 'Créez votre boutique et publiez votre catalogue en quelques minutes.' },
  { icon: Package, title: 'Catalogue complet', desc: 'Produits, variantes (taille, couleur), stock et catégories.' },
  { icon: CreditCard, title: 'Paiements flexibles', desc: 'Carte bancaire (Stripe), MonCash, ou preuve de paiement manuelle.' },
  { icon: BarChart3, title: 'Suivi des commandes', desc: 'Tableau de bord marchand avec gestion des statuts de commande.' },
  { icon: ShieldCheck, title: 'Sécurisé', desc: 'Isolation complète des données entre boutiques, comptes et rôles.' },
  { icon: Smartphone, title: 'Pensé pour Haïti', desc: 'Départements, communes, points de repère pour la livraison.' },
];

export default function HomePage() {
  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <header className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">SHOPAY</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="btn btn-secondary">Découvrir les boutiques</Link>
          <Link href="/login" className="btn btn-secondary">Connexion</Link>
          <Link href="/register" className="btn btn-primary">Créer ma boutique</Link>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          Lancez votre boutique en ligne en <span style={{ color: 'var(--color-primary-2)' }}>quelques minutes</span>
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--color-ink-2)' }}>
          SHOPAY est la plateforme e-commerce faite pour les marchands haïtiens : catalogue, panier, commandes et paiements, tout inclus.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register" className="btn btn-primary py-3.5 px-7">Créer ma boutique gratuitement</Link>
          <Link href="/store/boutique-demo" className="btn btn-secondary py-3.5 px-7">Voir une boutique démo</Link>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-1.5">{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-4 sm:px-6 lg:px-8 py-8 text-center text-sm border-t" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-3)' }}>
        © {new Date().getFullYear()} SHOPAY — Plateforme e-commerce pour marchands haïtiens
      </footer>
    </div>
  );
}
