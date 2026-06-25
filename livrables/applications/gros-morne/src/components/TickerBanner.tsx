"use client";

import { Megaphone, Star, Zap } from "lucide-react";

const items = [
  { type: "annonce", text: "Bienvenue sur Gros-Morne Vil Mwen — La plateforme officielle de votre ville" },
  { type: "sponsor", text: "📢 Votre annonce ici — Contactez-nous pour promouvoir votre activité" },
  { type: "actu", text: "🌿 Gros-Morne : 155 692 habitants, 397 km², cœur de l'Artibonite" },
  { type: "sponsor", text: "🏪 Partenaire local ? Rejoignez notre réseau de commerçants" },
  { type: "actu", text: "📻 Francisque FM 98.9 — La voix de Gros-Morne depuis 1994" },
  { type: "annonce", text: "🤝 Rejoignez la communauté — Connectez-vous avec vos compatriotes partout dans le monde" },
  { type: "sponsor", text: "🏗️ Investissez à Gros-Morne — Opportunités économiques en croissance" },
  { type: "actu", text: "🌾 Mangue francisque, café, coton — Les richesses agricoles de notre territoire" },
  { type: "annonce", text: "📸 Partagez vos photos de Gros-Morne et contribuez à la mémoire collective" },
  { type: "sponsor", text: "🎓 Formation & Éducation — Annoncez vos cours et services éducatifs" },
];

const doubled = [...items, ...items];

const typeStyles: Record<string, string> = {
  annonce: "text-green-300",
  sponsor: "text-amber-300",
  actu: "text-blue-300",
};

const typeDot: Record<string, string> = {
  annonce: "bg-green-400",
  sponsor: "bg-amber-400",
  actu: "bg-blue-400",
};

export default function TickerBanner() {
  return (
    <div className="bg-slate-900 border-b border-slate-700 overflow-hidden">
      <div className="flex items-stretch">
        {/* Label fixe */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-700 shrink-0 z-10">
          <Megaphone className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white text-xs font-bold uppercase tracking-wider hidden sm:block">
            Infos
          </span>
        </div>

        {/* Track défilant */}
        <div className="flex-1 overflow-hidden relative">
          {/* fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          <div className="ticker-track py-2.5">
            {doubled.map((item, i) => (
              <span key={i} className="flex items-center gap-3 px-6 whitespace-nowrap">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDot[item.type]}`} />
                <span className={`text-sm font-medium ${typeStyles[item.type]}`}>
                  {item.text}
                </span>
                <Star className="w-3 h-3 text-slate-600 mx-2" />
              </span>
            ))}
          </div>
        </div>

        {/* CTA fixe */}
        <a
          href="/communaute"
          className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-600 hover:bg-amber-500 transition-colors shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-bold hidden sm:block">Annonce</span>
        </a>
      </div>
    </div>
  );
}
