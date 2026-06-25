"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Flame, BookOpen, Camera, Music } from "lucide-react";

const featured = {
  categorie: "À la une",
  titre: "Festival de la Mangue Francisque 2025",
  desc: "La quatrième édition du Festival de la Mangue Francisque rassemblera agriculteurs, artisans et visiteurs pour célébrer ce fruit emblématique de Gros-Morne. Concerts, expositions et gastronomie locale au programme.",
  date: "15 Juillet 2025",
  emoji: "🥭",
  href: "/actualites",
};

const sidePosts = [
  {
    icon: BookOpen,
    accent: "text-amber-500",
    bg: "bg-amber-50",
    categorie: "Histoire",
    titre: "Paul Prompt & Étienne Magny — Héros de l'indépendance",
    date: "Dossier historique",
    href: "/histoire",
  },
  {
    icon: Camera,
    accent: "text-purple-600",
    bg: "bg-purple-50",
    categorie: "Galerie",
    titre: "Les nouvelles photos de la communauté sont en ligne",
    date: "Ce mois-ci",
    href: "/galerie",
  },
  {
    icon: Music,
    accent: "text-green-700",
    bg: "bg-green-50",
    categorie: "Culture",
    titre: "Le Rara de Gros-Morne — traditions et identité créole",
    date: "Dossier culture",
    href: "/culture",
  },
];

export default function FeaturedSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <Flame className="w-4 h-4 text-red-500" />
          <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">En ce moment</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Featured card — large */}
          <Link
            href={featured.href}
            className="lg:col-span-3 group relative bg-gray-950 rounded-3xl overflow-hidden min-h-72 flex flex-col justify-end p-8 hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Bg decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-gray-950 to-gray-900" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-green-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl" />

            {/* Content */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {featured.categorie}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight group-hover:text-green-300 transition-colors">
                {featured.emoji} {featured.titre}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-2">{featured.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {featured.date}
                </div>
                <span className="flex items-center gap-1 text-green-400 text-sm font-bold group-hover:gap-2 transition-all">
                  Lire <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* Side posts */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {sidePosts.map(({ icon: Icon, accent, bg, categorie, titre, date, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-bold uppercase tracking-wider ${accent}`}>{categorie}</span>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug mt-0.5 mb-1 group-hover:text-green-700 transition-colors">
                    {titre}
                  </h4>
                  <span className="text-gray-400 text-xs">{date}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors shrink-0 mt-1" />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
