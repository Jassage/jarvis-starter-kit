"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Mountain, Waves, TreePine, Landmark, Star, Church, Gem, Footprints, BedDouble, Utensils, Compass, Camera,
} from "lucide-react";
import { tourismeApi, mediaUrl } from "@/lib/api";

interface Traduction { locale: "FR" | "HT"; description: string }
interface Photo { media: { url: string } }
interface TourismPlace {
  id: string;
  nom: string;
  categorie: string;
  photos: Photo[];
  traductions: Traduction[];
}

const STYLE_PAR_CATEGORIE: Record<string, { icon: typeof Mountain; couleur: string; label: string }> = {
  NATURE: { icon: TreePine, couleur: "from-emerald-500 to-green-700", label: "Nature" },
  CASCADE: { icon: Waves, couleur: "from-blue-500 to-cyan-600", label: "Cascade" },
  RIVIERE: { icon: Waves, couleur: "from-blue-500 to-cyan-600", label: "Rivière" },
  MONTAGNE: { icon: Mountain, couleur: "from-green-500 to-teal-600", label: "Montagne" },
  GROTTE: { icon: Gem, couleur: "from-stone-500 to-stone-700", label: "Grotte" },
  EGLISE: { icon: Church, couleur: "from-amber-500 to-orange-600", label: "Église" },
  SITE_HISTORIQUE: { icon: Landmark, couleur: "from-amber-500 to-orange-600", label: "Site historique" },
  SENTIER: { icon: Footprints, couleur: "from-lime-500 to-green-600", label: "Sentier" },
  HEBERGEMENT: { icon: BedDouble, couleur: "from-indigo-500 to-blue-600", label: "Hébergement" },
  RESTAURANT: { icon: Utensils, couleur: "from-red-500 to-rose-600", label: "Restaurant" },
  CULTURE: { icon: Camera, couleur: "from-purple-500 to-violet-600", label: "Culture" },
  EVENEMENT: { icon: Star, couleur: "from-red-500 to-pink-600", label: "Événement" },
  AUTRE: { icon: Compass, couleur: "from-gray-500 to-gray-700", label: "Autre" },
};

export default function LieuxIncontournablesSection() {
  const [lieux, setLieux] = useState<TourismPlace[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tourismeApi
      .list()
      .then(({ data }) => setLieux(data.data.lieux))
      .catch(() => setLieux([]));
  }, []);

  function scroll(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  if (lieux.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-3xl font-black text-gray-900">Lieux incontournables</h2>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/tourisme" className="hidden sm:flex items-center gap-1.5 text-green-700 text-sm font-semibold hover:gap-2.5 transition-all">
              Voir tous les lieux <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50" aria-label="Précédent">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50" aria-label="Suivant">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
          {lieux.map((lieu) => {
            const style = STYLE_PAR_CATEGORIE[lieu.categorie] ?? STYLE_PAR_CATEGORIE.AUTRE;
            const Icon = style.icon;
            const photo = mediaUrl(lieu.photos[0]?.media.url);
            const description = lieu.traductions.find((t) => t.locale === "FR")?.description ?? "";
            return (
              <Link
                key={lieu.id}
                href="/tourisme"
                className="group shrink-0 w-64 snap-start rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover"
              >
                <div className={`relative h-36 bg-gradient-to-br ${style.couleur} flex items-center justify-center`}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={lieu.nom} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-12 h-12 text-white/70" strokeWidth={1} />
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold text-gray-700">
                    {style.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{lieu.nom}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
