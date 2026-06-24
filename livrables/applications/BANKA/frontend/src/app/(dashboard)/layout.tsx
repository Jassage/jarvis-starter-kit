'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/ui/ToastContainer';

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f7f8fc' }}>
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: '#2563eb' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
            <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium" style={{ color: '#4a5578' }}>Chargement de votre espace...</span>
        </div>
      </div>
    );
  }
  if (!utilisateur) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f7f8fc' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {children}
        </main>
        <ToastContainer />
      </div>
    </div>
  );
}
