"use client";

import { Phone, Mail, Share2, MessageCircle, Camera, Globe } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function TopBar() {
  const { parametres } = useSiteSettings();
  const telephone = parametres?.telephone || "+509 1234 5678";
  const email = parametres?.email || "info@grosmorne.ht";
  const telephoneHref = `tel:${telephone.replace(/[^\d+]/g, "")}`;

  // Mêmes icônes génériques que le Footer, mêmes règles : cliquables uniquement si l'admin a
  // renseigné le lien réel dans Paramètres (cf. hooks/useSiteSettings).
  const reseaux = [
    { Icon: Share2, href: parametres?.facebookUrl, label: "Facebook" },
    { Icon: MessageCircle, href: parametres?.whatsappUrl, label: "WhatsApp" },
    { Icon: Camera, href: parametres?.instagramUrl, label: "Instagram" },
    { Icon: Globe, href: parametres?.siteWebUrl, label: "Site web" },
  ].filter((r) => r.href);

  return (
    <div className="hidden sm:block bg-green-950 text-white/80 text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-9 flex items-center justify-between">
        <p className="truncate">Bienvenue sur le portail officiel de Gros-Morne</p>
        <div className="flex items-center gap-5 shrink-0">
          <a href={telephoneHref} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3 h-3" /> {telephone}
          </a>
          <a href={`mailto:${email}`} className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3 h-3" /> {email}
          </a>
          {reseaux.length > 0 && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              {reseaux.map(({ Icon, href, label }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
