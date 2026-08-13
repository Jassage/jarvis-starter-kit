'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setChecked(true));
  }, [hydrate]);

  useEffect(() => {
    if (checked && !isAuthenticated) router.replace('/admin/login');
  }, [checked, isAuthenticated, router]);

  if (!checked || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary-2)' }} />
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 sm:p-8">{children}</main>
    </div>
  );
}
