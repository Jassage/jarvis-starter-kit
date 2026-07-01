'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/users', label: 'Utilisateurs', icon: '👥', exact: false },
  { href: '/admin/listings', label: 'Annonces', icon: '🏠', exact: false },
  { href: '/admin/reports', label: 'Signalements', icon: '🚨', exact: false },
  { href: '/admin/payments', label: 'Paiements', icon: '💳', exact: false },
  { href: '/admin/config', label: 'Configuration', icon: '⚙️', exact: false },
  { href: '/admin/audit', label: 'Audit', icon: '📋', exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
    if (mounted && !user) {
      router.replace('/login');
    }
  }, [mounted, user, router]);

  if (!mounted || !user) return null;
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return null;

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-navy text-white flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <p className="font-bold">LAKAY</p>
              <p className="text-xs text-white/50">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-20">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
