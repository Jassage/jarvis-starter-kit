"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, LayoutGrid, School, Building2, MapPinned, Landmark } from "lucide-react";
import { heroImagesApi, mediaUrl } from "@/lib/api";

const stats = [
  { icon: Users, val: "155 692", label: "Habitants" },
  { icon: LayoutGrid, val: "8", label: "Sections" },
  { icon: School, val: "45", label: "Écoles" },
  { icon: Building2, val: "560+", label: "Entreprises" },
  { icon: MapPinned, val: "28", label: "Sites touristiques" },
  { icon: Landmark, val: "397 km²", label: "Territoire" },
];

export default function HeroSection() {
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    heroImagesApi
      .get("accueil")
      .then(({ data }) => setBgImage(mediaUrl(data.data.image?.media?.url)))
      .catch(() => setBgImage(undefined));
  }, []);

  return (
    <section className="relative overflow-hidden bg-black">
      {bgImage ? (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-950 to-black" />
      )}

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-400/30 text-green-300 text-xs font-bold uppercase tracking-wider mb-5">
              Bienvenue à Gros-Morne
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-5">
              Gros-Morne,<br />
              <span className="text-green-400">notre fierté, notre avenir</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Découvrez une commune riche en histoire, en culture, en nature et pleine d&apos;opportunités.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/histoire"
                className="px-6 py-3.5 rounded-full bg-green-600 text-white font-bold text-sm hover:bg-green-500 hover:scale-105 transition-all duration-200 shadow-lg shadow-green-900/40"
              >
                Découvrir Gros-Morne
              </Link>
              <Link
                href="/investir"
                className="px-6 py-3.5 rounded-full border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition-all duration-200"
              >
                Investir maintenant
              </Link>
            </div>
          </div>

          {/* Floating stats card */}
          <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 w-full lg:w-96">
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, val, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-none">{val}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
