"use client";

import { Music, Utensils, Heart, Palette } from "lucide-react";

const categories = [
  {
    icon: Music,
    title: "Musique & Danse",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    textColor: "text-purple-700",
    items: [
      { name: "Rara", desc: "Processions musicales de rue avec bandes, trompettes en bambou et percussions. Tradition vivante du carnaval rural haïtien." },
      { name: "Kompa", desc: "La musique nationale haïtienne résonne dans chaque fête de Gros-Morne. Les soirées dansantes sont au cœur de la vie sociale." },
      { name: "Chants sacrés", desc: "Les chants vaudous et religieux transmis de génération en génération font partie de l'identité spirituelle de la ville." },
    ],
  },
  {
    icon: Utensils,
    title: "Gastronomie",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    textColor: "text-amber-700",
    items: [
      { name: "Griot & Bannann Peze", desc: "Le plat national haïtien — porc frit croustillant avec des bananes plantain aplaties et frites, servi avec du pikliz." },
      { name: "Soup Joumou", desc: "La soupe de giraumon, symbole de liberté, servie chaque 1er janvier pour commémorer l'indépendance d'Haïti." },
      { name: "Akra & Marinade", desc: "Beignets de malanga et de légumes marinés, incontournables lors des fêtes et marchés locaux de Gros-Morne." },
    ],
  },
  {
    icon: Heart,
    title: "Traditions & Fêtes",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    textColor: "text-red-700",
    items: [
      { name: "Fête Patronale", desc: "La fête du saint patron de Gros-Morne rassemble toute la communauté pour plusieurs jours de célébration, de prières et de festivités." },
      { name: "Carnaval Local", desc: "Les chars allégoriques, costumes colorés et groupes musicaux défilent dans les rues lors du carnaval annuel." },
      { name: "Lakou & Konbit", desc: "La tradition du Lakou (cour familiale élargie) et du Konbit (travail collectif) reste vivace, symbole de solidarité haïtienne." },
    ],
  },
  {
    icon: Palette,
    title: "Artisanat",
    color: "from-teal-500 to-green-600",
    bg: "bg-teal-50",
    textColor: "text-teal-700",
    items: [
      { name: "Peinture naïve", desc: "Les artistes de Gros-Morne s'inscrivent dans la tradition de la peinture haïtienne, colorée et expressive, reconnue mondialement." },
      { name: "Vannerie & Poterie", desc: "La fabrication de paniers en osier, de jarres en terre cuite et d'objets d'artisanat se transmet de père en fils." },
      { name: "Sculpture sur bois", desc: "Les sculpteurs locaux façonnent le bois de mahogany et d'acajou en œuvres représentant la vie et la spiritualité haïtienne." },
    ],
  },
];

export default function CultureSection() {
  return (
    <section id="culture" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-4">
            <Music className="w-4 h-4" />
            Culture & Traditions
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Une culture{" "}
            <span className="gradient-text">vivante</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            La culture de Gros-Morne est un mélange riche d&apos;influences africaines,
            françaises et indigènes. Elle s&apos;exprime dans la musique, la gastronomie,
            les fêtes et l&apos;artisanat.
          </p>
        </div>

        {/* 4 category blocks */}
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map(({ icon: Icon, title, color, bg, textColor, items }) => (
            <div key={title} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${color} p-6 flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">{title}</h3>
              </div>
              {/* Items */}
              <div className="p-6 space-y-5">
                {items.map((item) => (
                  <div key={item.name} className="flex gap-4">
                    <div className={`w-2 rounded-full shrink-0 ${bg}`} />
                    <div>
                      <h4 className={`font-bold text-sm ${textColor} mb-1`}>{item.name}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom proverb */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-amber-50 to-green-50 border border-amber-200 rounded-3xl px-8 py-6 max-w-2xl">
            <p className="text-2xl font-bold text-gray-800 mb-2">
              &ldquo;Ayiti, tè glise.&rdquo;
            </p>
            <p className="text-gray-500 text-sm">
              Proverbe haïtien — &ldquo;Haïti, terre glissante&rdquo; — signe de la richesse imprévisible de notre culture.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
