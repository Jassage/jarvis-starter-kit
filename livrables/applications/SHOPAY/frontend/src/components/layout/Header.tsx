'use client';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-10"
      style={{ borderColor: 'var(--color-line)', background: 'var(--color-surface)' }}
    >
      <div className="lg:hidden font-extrabold tracking-tight">SHOPAY</div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-2)' }}
          >
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold hidden sm:inline">{user?.firstName} {user?.lastName}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem' }} aria-label="Déconnexion">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
