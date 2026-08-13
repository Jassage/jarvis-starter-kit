'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, LogOut, MapPin, TreePine, Award, Compass, Newspaper, CalendarDays, Images, Video, Building2, Hotel, UtensilsCrossed, GraduationCap, HeartPulse, Users, Landmark, BookOpen, Image as ImageIcon, HelpCircle, Quote, Handshake, Mail, Send, Settings, History, FolderOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/contenu', label: 'Contenu', icon: FileText },
  { href: '/admin/images-hero', label: 'Images de fond', icon: ImageIcon },
  { href: '/admin/sections-communales', label: 'Sections communales', icon: TreePine },
  { href: '/admin/personnalites', label: 'Personnalités', icon: Award },
  { href: '/admin/tourisme', label: 'Tourisme', icon: Compass },
  { href: '/admin/actualites', label: 'Actualités', icon: Newspaper },
  { href: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/admin/galerie', label: 'Galerie', icon: Images },
  { href: '/admin/videos', label: 'Vidéos', icon: Video },
  { href: '/admin/entreprises', label: 'Entreprises', icon: Building2 },
  { href: '/admin/hotels', label: 'Hôtels', icon: Hotel },
  { href: '/admin/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { href: '/admin/ecoles', label: 'Éducation', icon: GraduationCap },
  { href: '/admin/sante', label: 'Santé', icon: HeartPulse },
  { href: '/admin/associations', label: 'Vie associative', icon: Users },
  { href: '/admin/services-municipaux', label: 'Services municipaux', icon: Landmark },
  { href: '/admin/annuaire', label: 'Annuaire (autres)', icon: BookOpen },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/temoignages', label: 'Témoignages', icon: Quote },
  { href: '/admin/partenaires', label: 'Partenaires', icon: Handshake },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Send },
  { href: '/admin/documents', label: 'Documents', icon: FolderOpen },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  { href: '/admin/journal-activite', label: "Journal d'activité", icon: History },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const adminUser = useAuthStore((s) => s.adminUser);

  return (
    <aside
      className="w-64 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-line)' }}
    >
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-brand)' }}>
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--color-ink)' }}>Gros-Morne</p>
          <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>Administration</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors')}
              style={{
                background: active ? 'var(--color-primary-soft)' : 'transparent',
                color: active ? 'var(--color-primary-2)' : 'var(--color-ink-2)',
              }}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--color-line)' }}>
        {adminUser && (
          <p className="px-3 text-xs mb-2 truncate" style={{ color: 'var(--color-ink-3)' }}>{adminUser.email}</p>
        )}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ color: 'var(--color-danger)' }}
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
