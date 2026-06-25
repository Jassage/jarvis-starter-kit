"use client";

import { MapPin, TreePine } from "lucide-react";

const sections = [
  {
    nom: "Boucan Richard",
    desc: "Section principale de la commune, centre administratif",
    color: "from-amber-500 to-orange-500",
    principale: true,
  },
  {
    nom: "Rivière Mancelle",
    desc: "Traversée par la rivière Mancelle, terres agricoles fertiles",
    color: "from-blue-500 to-cyan-500",
    principale: false,
  },
  {
    nom: "Rivière Blanche",
    desc: "Connue pour ses eaux claires et son paysage naturel",
    color: "from-sky-400 to-blue-500",
    principale: false,
  },
  {
    nom: "L'Acul",
    desc: "Zone rurale aux traditions agricoles bien ancrées",
    color: "from-green-500 to-emerald-600",
    principale: false,
  },
  {
    nom: "Pendu",
    desc: "Section communale aux reliefs montagneux caractéristiques",
    color: "from-slate-500 to-slate-700",
    principale: false,
  },
  {
    nom: "Savane Carrée",
    desc: "Plaines et savanes, idéales pour l'élevage et les cultures",
    color: "from-lime-500 to-green-600",
    principale: false,
  },
  {
    nom: "Moulin",
    desc: "Héritière d'une longue tradition meunière et artisanale",
    color: "from-amber-600 to-yellow-500",
    principale: false,
  },
  {
    nom: "Ravine Gros-Morne",
    desc: "Section portant fièrement le nom de la commune",
    color: "from-red-500 to-rose-600",
    principale: false,
  },
];

export default function SectionsCommunes() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
            <TreePine className="w-4 h-4" />
            Organisation territoriale
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Les <span className="gradient-text">8 sections communales</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            La commune de Gros-Morne est organisée en 8 sections communales,
            chacune avec son identité et ses richesses propres.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(({ nom, desc, color, principale }, i) => (
            <div
              key={nom}
              className={`relative rounded-2xl overflow-hidden group card-hover cursor-pointer ${
                principale ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Gradient bg */}
              <div className={`bg-gradient-to-br ${color} p-6 h-full min-h-32`}>
                {principale && (
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur">
                    Section principale
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-black text-white mb-1 ${principale ? "text-xl" : "text-base"}`}>
                      {nom}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 text-white/20 font-black text-4xl leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
