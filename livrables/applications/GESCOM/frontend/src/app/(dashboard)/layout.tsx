'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { utilisateur } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !utilisateur) router.replace('/login');
  }, [hydrated, utilisateur, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-primary-2)' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Chargement de votre espace...</span>
        </div>
      </div>
    );
  }
  if (!utilisateur) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
