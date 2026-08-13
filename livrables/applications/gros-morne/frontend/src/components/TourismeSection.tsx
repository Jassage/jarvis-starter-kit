"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Camera, MapPin, Clock, ArrowRight, Mountain, Waves, TreePine, Landmark, Star, Church, Gem, Footprints, BedDouble, Utensils, Compass, Search } from "lucide-react";
import { tourismeApi } from "@/lib/api";

const CarteInteractive = dynamic(() => import("./CarteInteractive"), { ssr: false });

interface Traduction {
  locale: "FR" | "HT";
  description: string;
  conseils: string | null;
}

interface TourismPlace {
  id: string;
  nom: string;
  categorie: string;
  duree: string | null;
  difficulte: string | null;
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  traductions: Traduction[];
}

const STYLE_PAR_CATEGORIE: Record<string, { icon: typeof Mountain; couleur: string; bg: string; label: string }> = {
  NATURE: { icon: TreePine, couleur: "from-emerald-500 to-green-700", bg: "bg-emerald-50", label: "Nature" },
  CASCADE: { icon: Waves, couleur: "from-blue-500 to-cyan-600", bg: "bg-blue-50", label: "Cascade" },
  RIVIERE: { icon: Waves, couleur: "from-blue-500 to-cyan-600", bg: "bg-blue-50", label: "Rivière" },
  MONTAGNE: { icon: Mountain, couleur: "from-green-500 to-teal-600", bg: "bg-green-50", label: "Montagne" },
  GROTTE: { icon: Gem, couleur: "from-stone-500 to-stone-700", bg: "bg-stone-50", label: "Grotte" },
  EGLISE: { icon: Church, couleur: "from-amber-500 to-orange-600", bg: "bg-amber-50", label: "Église" },
  SITE_HISTORIQUE: { icon: Landmark, couleur: "from-amber-500 to-orange-600", bg: "bg-amber-50", label: "Site historique" },
  SENTIER: { icon: Footprints, couleur: "from-lime-500 to-green-600", bg: "bg-lime-50", label: "Sentier" },
  HEBERGEMENT: { icon: BedDouble, couleur: "from-indigo-500 to-blue-600", bg: "bg-indigo-50", label: "Hébergement" },
  RESTAURANT: { icon: Utensils, couleur: "from-red-500 to-rose-600", bg: "bg-red-50", label: "Restaurant" },
  CULTURE: { icon: Camera, couleur: "from-purple-500 to-violet-600", bg: "bg-purple-50", label: "Culture" },
  EVENEMENT: { icon: Star, couleur: "from-red-500 to-pink-600", bg: "bg-red-50", label: "Événement" },
  AUTRE: { icon: Compass, couleur: "from-gray-500 to-gray-700", bg: "bg-gray-50", label: "Autre" },
};

export default function TourismeSection() {
  const [lieux, setLieux] = useState<TourismPlace[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      tourismeApi
        .list(q.trim() ? { q: q.trim() } : undefined)
        .then(({ data }) => setLieux(data.data.lieux))
        .catch(() => setLieux([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const pointsCarte = lieux
    .filter((l): l is TourismPlace & { latitude: number; longitude: number } => l.latitude !== null && l.longitude !== null)
    .map((l) => ({ id: l.id, nom: l.nom, categorie: STYLE_PAR_CATEGORIE[l.categorie]?.label, latitude: l.latitude, longitude: l.longitude }));

  return (
    <section id="tourisme" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            Lieux à visiter
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Découvrez{" "}
            <span className="gradient-text">Gros-Morne</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Entre nature sauvage, patrimoine historique et culture vivante,
            Gros-Morne réserve bien des surprises à ses visiteurs.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un lieu (nom, description)..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Carte interactive */}
        <div id="carte" className="mb-12 scroll-mt-24">
          <CarteInteractive points={pointsCarte} />
        </div>

        {lieux.length === 0 && (
          <p className="text-center text-gray-400 mb-12">Aucun lieu ne correspond à cette recherche.</p>
        )}

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {lieux.map((lieu) => {
            const style = STYLE_PAR_CATEGORIE[lieu.categorie] ?? STYLE_PAR_CATEGORIE.AUTRE;
            const Icon = style.icon;
            const description = lieu.traductions.find((t) => t.locale === "FR")?.description ?? "";
            return (
              <div
                key={lieu.id}
                className="group bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden card-hover"
              >
                {/* Card header */}
                <div className={`h-40 bg-gradient-to-br ${style.couleur} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: "radial-gradient(circle at 30% 70%, white 0%, transparent 60%)"
                  }} />
                  <Icon className="w-16 h-16 text-white/80" strokeWidth={1} />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${style.bg} text-xs font-bold text-gray-700`}>
                    {style.label}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{lieu.nom}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {description}
                  </p>

                  {/* Meta */}
                  {(lieu.duree || lieu.difficulte) && (
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      {lieu.duree && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lieu.duree}
                        </div>
                      )}
                      {lieu.difficulte && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lieu.difficulte}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {lieu.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lieu.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <button className="flex items-center gap-2 text-sm font-semibold text-green-700 group-hover:gap-3 transition-all duration-200">
                    En savoir plus <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="relative bg-gradient-to-r from-green-700 via-green-800 to-teal-900 rounded-3xl p-8 sm:p-12 overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 80% 50%, #fbbf24 0%, transparent 50%)"
          }} />
          <Mountain className="w-12 h-12 text-green-400/60 mx-auto mb-4" />
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Venez visiter Gros-Morne
          </h3>
          <p className="text-green-200 max-w-xl mx-auto mb-6">
            Planifiez votre visite et découvrez la beauté cachée de cette
            ville haïtienne authentique. Chaque coin de rue raconte une histoire.
          </p>
          <a
            href="#carte"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-400 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <MapPin className="w-4 h-4" />
            Voir sur la carte
          </a>
        </div>
      </div>
    </section>
  );
}
