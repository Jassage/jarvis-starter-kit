"use client";

import { MapPin, Compass, Mountain, Droplets, Sun, Wind } from "lucide-react";

const sections = [
  {
    icon: MapPin,
    title: "Localisation",
    color: "bg-red-50 text-red-600",
    items: [
      "Département de l'Artibonite, Haïti",
      "Arrondissement de Gros-Morne",
      "À ~150 km de Port-au-Prince",
      "Coordonnées : 19°40′N, 72°41′O",
    ],
  },
  {
    icon: Mountain,
    title: "Relief & Topographie",
    color: "bg-green-50 text-green-700",
    items: [
      "Terrain majoritairement montagneux",
      "Altitude : 211 m",
      "Superficie : 397,03 km²",
      "Vallées fertiles entre les mornes",
    ],
  },
  {
    icon: Droplets,
    title: "Hydrographie",
    color: "bg-blue-50 text-blue-600",
    items: [
      "Plusieurs rivières saisonnières",
      "Sources naturelles dans les mornes",
      "Zone de captage des eaux pluviales",
      "Accès côtier indirect",
    ],
  },
  {
    icon: Sun,
    title: "Climat",
    color: "bg-amber-50 text-amber-600",
    items: [
      "Climat tropical de montagne",
      "Température : 22-30°C en moyenne",
      "Saisons pluvieuses : avril-juin, oct-nov",
      "Microclimat frais en altitude",
    ],
  },
];

const communes = [
  "Boucan Richard (commune principale)",
  "Rivière Mancelle",
  "Rivière Blanche",
  "L'Acul",
  "Pendu",
  "Savane Carrée",
  "Moulin",
  "Ravine Gros-Morne",
];

export default function GeographieSection() {
  return (
    <section id="geographie" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
            <Compass className="w-4 h-4" />
            Géographie & Localisation
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Où se trouve{" "}
            <span className="gradient-text">Gros-Morne?</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Nichée dans les montagnes du Nord-Ouest d&apos;Haïti, Gros-Morne
            bénéficie d&apos;un environnement naturel exceptionnel.
          </p>
        </div>

        {/* Map placeholder + info */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Map embed */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-80 lg:h-auto min-h-80 relative">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.1,19.3,-72.3,20.0&layer=mapnik&marker=19.667,-72.683"
              className="w-full h-full"
              style={{ border: 0, minHeight: "320px" }}
              loading="lazy"
              title="Carte de Gros-Morne"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow text-sm font-bold text-green-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              Gros-Morne, Haïti
            </div>
          </div>

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {sections.map(({ icon: Icon, title, color, items }) => (
              <div key={title} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 card-hover">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Arrondissement communes */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-3xl p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Wind className="w-6 h-6 text-green-300" />
            <h3 className="text-xl font-bold text-white">8 sections communales</h3>
          </div>
          <p className="text-green-200 mb-6 text-sm">
            La commune de Gros-Morne est divisée en 8 sections communales. Code postal : HT 4210. Densité : 392 hab/km².
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {communes.map((c) => (
              <div
                key={c}
                className={`px-4 py-3 rounded-xl text-sm font-medium text-center ${
                  c.includes("principale")
                    ? "bg-amber-500 text-white font-bold"
                    : "bg-white/15 text-white hover:bg-white/25 transition-colors"
                }`}
              >
                {c.replace(" (commune principale)", "")}
                {c.includes("principale") && (
                  <span className="block text-xs font-normal mt-0.5">Section principale</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
