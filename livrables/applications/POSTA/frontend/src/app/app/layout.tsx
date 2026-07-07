'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { utilisateur, chargement, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 p-4">
        <Link href="/app" className="mb-8 text-lg font-semibold tracking-tight">
          POSTA
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/app" className="rounded px-3 py-2 hover:bg-neutral-200">
            Domaines
          </Link>
          {utilisateur?.role === 'CLIENT_ADMIN' && (
            <Link href="/app/billing" className="rounded px-3 py-2 hover:bg-neutral-200">
              Facturation
            </Link>
          )}
          {utilisateur?.role === 'SUPER_ADMIN' && (
            <>
              <Link href="/app/users" className="rounded px-3 py-2 hover:bg-neutral-200">
                Utilisateurs
              </Link>
              <Link href="/app/payments" className="rounded px-3 py-2 hover:bg-neutral-200">
                Paiements
              </Link>
              <Link href="/app/audit" className="rounded px-3 py-2 hover:bg-neutral-200">
                Journal d&apos;audit
              </Link>
            </>
          )}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3">
          <span className="text-sm text-neutral-500">
            Plateforme de mail personnalisé avec nom de domaine
          </span>
          {!chargement && utilisateur && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-neutral-700">
                {utilisateur.prenom} {utilisateur.nom}{' '}
                <span className="text-neutral-400">({utilisateur.role})</span>
              </span>
              <button
                onClick={logout}
                className="rounded border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100"
              >
                Déconnexion
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
