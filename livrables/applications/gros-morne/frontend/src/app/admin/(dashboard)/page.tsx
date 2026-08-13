'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AdminDashboardPage() {
  const adminUser = useAuthStore((s) => s.adminUser);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-ink)' }}>
        Bonjour{adminUser ? `, ${adminUser.nom}` : ''}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-3)' }}>
        Tableau de bord du portail SMART GROS-MORNE.
      </p>

      <Link href="/admin/contenu" className="card card-hover p-5 sm:p-6 flex items-center gap-4 max-w-md">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: 'var(--gradient-brand)' }}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold" style={{ color: 'var(--color-ink)' }}>Gérer le contenu</p>
          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Textes des pages du site, en français et en kreyòl</p>
        </div>
      </Link>
    </div>
  );
}
