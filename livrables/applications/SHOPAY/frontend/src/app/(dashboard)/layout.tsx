'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || user.role === 'PLATFORM_SUPER_ADMIN')) router.replace('/login');
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Chargement de votre espace...</span>
      </div>
    );
  }
  if (!user || user.role === 'PLATFORM_SUPER_ADMIN') return null;

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
