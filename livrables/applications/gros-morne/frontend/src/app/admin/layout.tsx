import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration — Gros-Morne',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="gm-admin">{children}</div>;
}
