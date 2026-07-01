'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

function MainNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-navy">LAKAY</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Annonces
              </Link>
              <Link href="/agencies" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Agences
              </Link>
              <Link href="/properties?listingType=RENT" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Location
              </Link>
              <Link href="/properties?listingType=SALE" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Achat
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/dashboard/listings/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  + Publier
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mon profil
                    </Link>
                    <Link href="/dashboard/listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mes annonces
                    </Link>
                    <Link href="/dashboard/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Favoris
                    </Link>
                    <Link href="/dashboard/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Messages
                    </Link>
                    <Link href="/dashboard/visits" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Visites
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-navy text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold">LAKAY</span>
            </div>
            <p className="text-gray-400 text-sm">
              La plateforme immobilière de référence en Haïti. Trouvez votre prochain chez-vous.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/properties" className="hover:text-white">Toutes les annonces</Link></li>
              <li><Link href="/properties?listingType=RENT" className="hover:text-white">Location</Link></li>
              <li><Link href="/properties?listingType=SALE" className="hover:text-white">Achat</Link></li>
              <li><Link href="/agencies" className="hover:text-white">Agences</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Compte</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/register" className="hover:text-white">S'inscrire</Link></li>
              <li><Link href="/login" className="hover:text-white">Se connecter</Link></li>
              <li><Link href="/dashboard/listings/new" className="hover:text-white">Publier une annonce</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>contact@lakay.ht</li>
              <li>+509 3000-0000</li>
              <li>Port-au-Prince, Haïti</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LAKAY. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
