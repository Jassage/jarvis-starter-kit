'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Bell, MessageSquare, Heart, Plus, ChevronDown, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn, getInitials } from '../../lib/utils';
import { useNavCounts } from '../../hooks/useNavCounts';

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { msgCount, notifCount, favCount } = useNavCounts();

  const navLinks = [
    { label: 'Acheter', href: '/properties?listingType=SALE' },
    { label: 'Louer', href: '/properties?listingType=RENT' },
    { label: 'Agences', href: '/agencies' },
    { label: 'Estimer', href: '/estimate' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary-500">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            LAKAY
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-500',
                  pathname.startsWith(link.href.split('?')[0]) ? 'text-primary-500' : 'text-gray-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Publier */}
                <Link
                  href="/dashboard/listings/new"
                  className="hidden sm:flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Publier
                </Link>

                {/* Icônes */}
                <Link href="/dashboard/messages" className="relative p-2 text-gray-500 hover:text-primary-500 rounded-lg hover:bg-gray-50">
                  <MessageSquare className="w-5 h-5" />
                  <NavBadge count={msgCount} />
                </Link>
                <Link href="/dashboard/favorites" className="relative p-2 text-gray-500 hover:text-primary-500 rounded-lg hover:bg-gray-50">
                  <Heart className="w-5 h-5" />
                  <NavBadge count={favCount} />
                </Link>
                <Link href="/dashboard/notifications" className="relative p-2 text-gray-500 hover:text-primary-500 rounded-lg hover:bg-gray-50">
                  <Bell className="w-5 h-5" />
                  <NavBadge count={notifCount} />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-100"
                  >
                    <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {user.avatar
                        ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        : getInitials(user.firstName, user.lastName)
                      }
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                        <div className="px-4 py-2.5 border-b border-gray-50">
                          <p className="font-medium text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Tableau de bord</Link>
                        <Link href="/dashboard/listings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mes annonces</Link>
                        <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mon profil</Link>
                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 font-medium hover:bg-primary-50" onClick={() => setUserMenuOpen(false)}>Administration</Link>
                        )}
                        <div className="border-t border-gray-50 mt-1">
                          <button
                            onClick={async () => { setUserMenuOpen(false); await logout(); router.push('/'); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-500 px-3 py-2">
                  Connexion
                </Link>
                <Link href="/register" className="text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Inscription
                </Link>
              </div>
            )}

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nav mobile */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-2 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-500"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/dashboard/listings/new" className="flex items-center gap-2 mt-2 text-sm font-semibold text-primary-500" onClick={() => setMobileOpen(false)}>
                <Plus className="w-4 h-4" /> Publier une annonce
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
