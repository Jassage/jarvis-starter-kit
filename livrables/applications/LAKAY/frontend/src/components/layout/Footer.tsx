import Link from 'next/link';
import { Home, Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              LAKAY
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              La plateforme immobilière de référence en Haïti. Trouvez votre maison, appartement ou terrain en toute confiance.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h4 className="font-semibold mb-4">Immobilier</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/properties?listingType=RENT" className="hover:text-primary-400 transition-colors">Maisons à louer</Link></li>
              <li><Link href="/properties?listingType=SALE" className="hover:text-primary-400 transition-colors">Maisons à vendre</Link></li>
              <li><Link href="/properties?propertyType=APARTMENT" className="hover:text-primary-400 transition-colors">Appartements</Link></li>
              <li><Link href="/properties?propertyType=LAND" className="hover:text-primary-400 transition-colors">Terrains</Link></li>
              <li><Link href="/properties?propertyType=COMMERCIAL" className="hover:text-primary-400 transition-colors">Locaux commerciaux</Link></li>
            </ul>
          </div>

          {/* Départements */}
          <div>
            <h4 className="font-semibold mb-4">Par département</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/properties?department=OUEST" className="hover:text-primary-400 transition-colors">Ouest (Port-au-Prince)</Link></li>
              <li><Link href="/properties?department=NORD" className="hover:text-primary-400 transition-colors">Nord (Cap-Haïtien)</Link></li>
              <li><Link href="/properties?department=ARTIBONITE" className="hover:text-primary-400 transition-colors">Artibonite</Link></li>
              <li><Link href="/properties?department=SUD" className="hover:text-primary-400 transition-colors">Sud (Les Cayes)</Link></li>
              <li><Link href="/properties?department=GRAND_ANSE" className="hover:text-primary-400 transition-colors">Grande-Anse</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
                Port-au-Prince, Haïti
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                +509 4000-0000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                contact@lakay.ht
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} LAKAY. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="hover:text-primary-400">Confidentialité</Link>
            <Link href="/legal/terms" className="hover:text-primary-400">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
