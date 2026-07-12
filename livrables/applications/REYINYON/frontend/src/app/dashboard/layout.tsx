'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated, hydrate, logout } = useAuthStore();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setTried(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tried && hydrated && !user) router.replace('/login');
  }, [tried, hydrated, user, router]);

  if (!tried) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Connexion...</span>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <div className="blob-field">
        <div className="blob blob-mint" style={{ width: 420, height: 420, top: -140, left: -120 }} />
        <div className="blob blob-blue" style={{ width: 480, height: 480, bottom: -200, right: -160, animationDelay: '-8s' }} />
      </div>

      <header className="card" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-mint)' }}>
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-black tracking-tight" style={{ color: 'var(--color-ink)' }}>REYINYON</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>{user.nom}</span>
            <button
              onClick={() => logout().then(() => router.replace('/login'))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-ink-3)', background: 'var(--color-surface-2)' }}
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 relative" style={{ zIndex: 1 }}>{children}</main>
    </div>
  );
}
