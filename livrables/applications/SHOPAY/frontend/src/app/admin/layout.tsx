'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Store, Building2, Receipt, BarChart3, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { href: '/admin/boutiques', label: 'Boutiques', icon: Building2 },
  { href: '/admin/payments', label: 'Paiements', icon: Receipt },
  { href: '/admin/stats', label: 'Statistiques', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && user?.role !== 'PLATFORM_SUPER_ADMIN') router.replace('/login');
  }, [hydrated, user, router]);

  if (!hydrated || user?.role !== 'PLATFORM_SUPER_ADMIN') return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: 'var(--color-line)', background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">SHOPAY <span style={{ color: 'var(--color-ink-3)', fontWeight: 600 }}>Admin</span></span>
        </div>
        <nav className="hidden sm:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ background: pathname === item.href ? 'var(--color-primary-soft)' : 'transparent', color: pathname === item.href ? 'var(--color-primary-2)' : 'var(--color-ink-2)' }}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem' }}>
          <LogOut className="w-4 h-4" />
        </button>
      </header>
      <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-7">{children}</main>
    </div>
  );
}
