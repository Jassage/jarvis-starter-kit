import { MapPin, Heart, Mail, Phone, Share2, MessageCircle, Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-xl">Gros-Morne</span>
                <p className="text-green-400 text-xs">Vil Mwen — Ma Ville</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              La plateforme officielle de la communauté de Gros-Morne.
              Un espace pour partager, découvrir et célébrer notre ville,
              peu importe où nous sommes dans le monde.
            </p>
            <div className="flex gap-3">
              {[Share2, MessageCircle, Camera].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Découvrir</h4>
            <ul className="space-y-2.5">
              {["Histoire", "Géographie", "Tourisme", "Culture", "Personnalités", "Actualités"].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}`}
                    className="text-gray-400 text-sm hover:text-green-400 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                Gros-Morne, Département de l&apos;Artibonite, Haïti
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-green-500 shrink-0" />
                contact@gros-morne.ht
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                +509 3xxx xxxx
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © 2025 Gros-Morne Vil Mwen. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1.5">
            Fait avec <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> pour Gros-Morne, Haïti
          </p>
        </div>
      </div>
    </footer>
  );
}
