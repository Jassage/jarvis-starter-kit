'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingBag, Settings, CreditCard, Store } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { key: 'dashboard', label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Produits', href: '/dashboard/products', icon: Package },
  { key: 'categories', label: 'Catégories', href: '/dashboard/categories', icon: Tags },
  { key: 'orders', label: 'Commandes', href: '/dashboard/orders', icon: ShoppingBag },
  { key: 'billing', label: 'Abonnement', href: '/dashboard/billing', icon: CreditCard },
  { key: 'settings', label: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { boutique } = useAuthStore();

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-72 border-r"
      style={{ borderColor: 'var(--color-line)', background: 'var(--color-surface)' }}
    >
      <div className="h-16 flex items-center gap-2.5 px-6 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
          <Store className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-lg tracking-tight">SHOPAY</span>
      </div>

      {boutique && (
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-ink-3)' }}>Boutique</p>
          <p className="font-bold truncate">{boutique.name}</p>
          {boutique.status === 'ACTIVE' && (
            <Link
              href={`/store/${boutique.slug}`}
              target="_blank"
              className="text-xs font-semibold mt-1 inline-block"
              style={{ color: 'var(--color-primary-2)' }}
            >
              Voir la boutique →
            </Link>
          )}
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: active ? 'var(--color-primary-soft)' : 'transparent',
                color: active ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
              }}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
