"use client";

import Link from "next/link";
import { Camera, ArrowUpRight, Heart } from "lucide-react";

const photos = [
  { titre: "Paysage des mornes",    emoji: "🏔️", bg: "from-green-500 to-teal-700",    likes: 42 },
  { titre: "Marché du dimanche",    emoji: "🛒", bg: "from-amber-400 to-orange-600",   likes: 38 },
  { titre: "Fête patronale 2024",   emoji: "🎉", bg: "from-purple-500 to-pink-700",    likes: 95 },
  { titre: "Rivière Blanche",       emoji: "🏞️", bg: "from-blue-400 to-cyan-600",     likes: 61 },
  { titre: "Rara — carnaval",       emoji: "🥁", bg: "from-red-500 to-rose-700",       likes: 113 },
  { titre: "Coucher de soleil",     emoji: "🌅", bg: "from-orange-400 to-red-600",     likes: 87 },
];

export default function GalleryPreview() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Galerie</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Photos de la <span className="text-purple-600">communauté</span>
            </h2>
          </div>
          <Link
            href="/galerie"
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
          >
            Voir toutes <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {photos.map(({ titre, emoji, bg, likes }, i) => (
            <Link
              key={titre}
              href="/galerie"
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <div
                className={`bg-gradient-to-br ${bg} flex items-center justify-center relative ${
                  i === 0 ? "h-52 sm:h-full min-h-40" : "h-24 sm:h-28"
                }`}
              >
                <span className={`select-none ${i === 0 ? "text-6xl" : "text-3xl"}`}>{emoji}</span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                {/* Like count */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                  <span className="text-white text-xs font-bold">{likes}</span>
                </div>
                {/* Title on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-bold truncate">{titre}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-4 text-center">
          <Link href="/galerie" className="inline-flex items-center gap-2 text-sm font-bold text-purple-600">
            Voir toute la galerie <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
