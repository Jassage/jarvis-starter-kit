"use client";

import Link from "next/link";
import { MapPin, Mail, Phone, Clock, Share2, MessageCircle, Camera, Globe } from "lucide-react";
import Logo from "./Logo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const liensRapides = [
  { label: "Accueil", href: "/" },
  { label: "Découvrir Gros-Morne", href: "/histoire" },
  { label: "Tourisme", href: "/tourisme" },
  { label: "Actualités", href: "/actualites" },
  { label: "Annuaire", href: "/annuaire" },
];

const services = [
  { label: "Investir", href: "/investir" },
  { label: "Agenda", href: "/agenda" },
  { label: "Services municipaux", href: "/services-municipaux" },
  { label: "Éducation", href: "/education" },
  { label: "Santé", href: "/sante" },
  { label: "Vie associative", href: "/vie-associative" },
];

const informationsUtiles = [
  { label: "À propos", href: "/a-propos" },
  { label: "FAQ", href: "/faq" },
  { label: "Documents", href: "/documents" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
];

export default function Footer() {
  const { parametres } = useSiteSettings();

  // Chaque icône générique n'est cliquable que si l'admin a réellement renseigné le lien
  // correspondant dans Paramètres — pas de `href="#"` qui simule une affordance inexistante.
  const reseaux = [
    { Icon: Share2, href: parametres?.facebookUrl, label: "Facebook" },
    { Icon: MessageCircle, href: parametres?.whatsappUrl, label: "WhatsApp" },
    { Icon: Camera, href: parametres?.instagramUrl, label: "Instagram" },
    { Icon: Globe, href: parametres?.siteWebUrl, label: "Site web" },
  ].filter((r) => r.href);

  return (
    <footer className="bg-green-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo size={40} />
              <div>
                <span className="font-black text-lg">Smart Gros-Morne</span>
                <p className="text-green-400 text-xs">Terre d&apos;accueil et d&apos;opportunités</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Portail officiel de la commune de Gros-Morne. Découvrir, s&apos;informer, investir et
              participer au développement de notre belle commune.
            </p>
            {reseaux.length > 0 && (
              <div className="flex gap-2">
                {reseaux.map(({ Icon, href, label }) => (
                  <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-bold text-white mb-4">Liens rapides</h4>
            <ul className="space-y-2.5">
              {liensRapides.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 text-sm hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2.5">
              {services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 text-sm hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations utiles */}
          <div>
            <h4 className="font-bold text-white mb-4">Informations utiles</h4>
            <ul className="space-y-2.5">
              {informationsUtiles.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 text-sm hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Nous contacter</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {parametres?.adresse || "Rue Principale, Gros-Morne, Haïti"}
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                {parametres?.telephone || "+509 1234 5678"}
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-green-500 shrink-0" />
                {parametres?.email || "info@grosmorne.ht"}
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Clock className="w-4 h-4 text-green-500 shrink-0" />
                {parametres?.horaires || "Lun - Ven : 8:00 AM - 4:00 PM"}
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-xs">© 2026 Smart Gros-Morne. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
