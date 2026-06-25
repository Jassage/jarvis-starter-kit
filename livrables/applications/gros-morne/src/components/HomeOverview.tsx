"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const sections = [
  {
    num: "01",
    href: "/histoire",
    title: "Histoire",
    subtitle: "Depuis 1804",
    desc: "De la guerre d'indépendance aux jours modernes — l'épopée d'une ville forgée dans la fierté haïtienne.",
    accent: "#d97706",
    dark: true,
    wide: true,
  },
  {
    num: "02",
    href: "/geographie",
    title: "Géographie",
    subtitle: "397 km²",
    desc: "Coordonnées, relief, rivières et sections communales — le territoire de Gros-Morne dans toute sa diversité.",
    accent: "#3b82f6",
    dark: false,
    wide: false,
  },
  {
    num: "03",
    href: "/tourisme",
    title: "Tourisme",
    subtitle: "Lieux à visiter",
    desc: "Mornes panoramiques, marchés traditionnels et patrimoine colonial au cœur de l'Artibonite.",
    accent: "#22c55e",
    dark: false,
    wide: false,
  },
  {
    num: "04",
    href: "/culture",
    title: "Culture",
    subtitle: "Traditions vivantes",
    desc: "Rara, Kompa, artisanat — une identité culturelle riche mêlant influences africaines et créoles.",
    accent: "#a855f7",
    dark: true,
    wide: true,
  },
  {
    num: "05",
    href: "/personnalites",
    title: "Personnalités",
    subtitle: "Fils & Filles",
    desc: "Paul Prompt, Étienne Magny — les hommes et femmes qui ont porté le nom de Gros-Morne au loin.",
    accent: "#f43f5e",
    dark: false,
    wide: false,
  },
  {
    num: "06",
    href: "/actualites",
    title: "Actualités",
    subtitle: "Vie locale",
    desc: "Développement, culture, événements — restez connecté à ce qui se passe dans votre ville.",
    accent: "#0ea5e9",
    dark: false,
    wide: false,
  },
];

export default function HomeOverview() {
  return (
    <section className="bg-white">

      {/* ── Section header ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-20 pb-10">
        <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-green-600 mb-2">Explorer la ville</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Tout sur<br />
              <span className="text-green-700">Gros-Morne</span>
            </h2>
          </div>
          <Link
            href="/communaute"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-green-800 transition-colors shrink-0"
          >
            Rejoindre <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Editorial grid ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
          {sections.map(({ num, href, title, subtitle, desc, accent, dark, wide }) => (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col justify-between p-8 sm:p-10 min-h-56 transition-all duration-500 ${
                dark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
              } hover:scale-[0.98] active:scale-[0.96]`}
              style={dark ? {} : {}}
            >
              {/* Accent top border */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: accent }}
              />

              {/* Number + arrow */}
              <div className="flex items-start justify-between mb-6">
                <span
                  className="text-xs font-black font-mono tracking-widest"
                  style={{ color: accent }}
                >
                  {num}
                </span>
                <ArrowUpRight
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0"
                  style={{ color: accent }}
                />
              </div>

              {/* Content */}
              <div>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: accent }}
                >
                  {subtitle}
                </p>
                <h3 className={`text-2xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
                  {title}
                </h3>
                <p className={`text-sm leading-relaxed ${dark ? "text-white/50" : "text-gray-400"}`}>
                  {desc}
                </p>
              </div>

              {/* Bottom line */}
              <div
                className="absolute bottom-0 left-8 right-8 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ background: `${accent}40` }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Community CTA ── */}
      <div className="relative overflow-hidden bg-gray-950">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 50%, #166534 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #d97706 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-green-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Communauté</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Gros-Morne<br />vous appartient.
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/communaute"
              className="px-7 py-4 rounded-full bg-green-600 text-white font-black hover:bg-green-500 transition-colors text-center"
            >
              Rejoindre la communauté
            </Link>
            <Link
              href="/galerie"
              className="px-7 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors text-center text-sm"
            >
              Voir la galerie
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}
