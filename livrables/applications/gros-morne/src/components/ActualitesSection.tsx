"use client";

import { Newspaper, Calendar, ArrowRight, Tag } from "lucide-react";

const actualites = [
  {
    id: 1,
    titre: "Inauguration du nouveau marché communal",
    categorie: "Développement",
    catColor: "bg-green-100 text-green-700",
    date: "15 juin 2025",
    resume:
      "Le nouveau marché communal de Gros-Morne a été inauguré en présence des autorités locales. Cette infrastructure moderne permettra à des centaines de commerçants d'exercer dans de meilleures conditions.",
  },
  {
    id: 2,
    titre: "Fête patronale : programme des festivités",
    categorie: "Culture",
    catColor: "bg-purple-100 text-purple-700",
    date: "3 juin 2025",
    resume:
      "Le comité d'organisation de la fête patronale annuelle a dévoilé le programme des festivités. Au menu : concerts, processions religieuses, expositions artisanales et compétitions sportives.",
  },
  {
    id: 3,
    titre: "Projet de réhabilitation des routes rurales",
    categorie: "Infrastructure",
    catColor: "bg-blue-100 text-blue-700",
    date: "28 mai 2025",
    resume:
      "Un projet de réhabilitation des routes rurales reliant les sections communales au centre-ville est en cours de planification. Ce projet améliorera l'accès des agriculteurs aux marchés.",
  },
  {
    id: 4,
    titre: "L'école primaire nationale lauréate nationale",
    categorie: "Éducation",
    catColor: "bg-amber-100 text-amber-700",
    date: "20 mai 2025",
    resume:
      "Des élèves de l'École Nationale de Gros-Morne ont remporté le premier prix du concours national de mathématiques. Une fierté pour toute la communauté.",
  },
  {
    id: 5,
    titre: "Nouvelle clinique communautaire ouverte",
    categorie: "Santé",
    catColor: "bg-red-100 text-red-700",
    date: "10 mai 2025",
    resume:
      "Une nouvelle clinique communautaire financée par une ONG internationale a ouvert ses portes à Gros-Morne, offrant des soins de santé primaires gratuits aux familles les plus vulnérables.",
  },
  {
    id: 6,
    titre: "Festival de la mangue : édition 2025",
    categorie: "Culture",
    catColor: "bg-orange-100 text-orange-700",
    date: "5 mai 2025",
    resume:
      "La quatrième édition du Festival de la Mangue de Gros-Morne rassemblera agriculteurs, artisans et visiteurs pour célébrer ce fruit emblématique de la région.",
  },
];

export default function ActualitesSection() {
  return (
    <section id="actualites" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
            <Newspaper className="w-4 h-4" />
            Actualités locales
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            La vie à{" "}
            <span className="gradient-text">Gros-Morne</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Restez connecté aux dernières nouvelles de votre ville. Événements,
            projets de développement, culture et communauté.
          </p>
        </div>

        {/* Featured + grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Featured article */}
          <div className="lg:col-span-2 bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-8 text-white relative overflow-hidden card-hover">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4">
              À la une
            </span>
            <h3 className="text-2xl font-black mb-3">{actualites[0].titre}</h3>
            <p className="text-green-200 leading-relaxed mb-6">{actualites[0].resume}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <Calendar className="w-4 h-4" />
                {actualites[0].date}
              </div>
              <button className="flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all">
                Lire <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side article */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 card-hover flex flex-col">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 w-fit ${actualites[1].catColor}`}>
              {actualites[1].categorie}
            </span>
            <h3 className="text-lg font-black text-gray-900 mb-3 flex-1">{actualites[1].titre}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{actualites[1].resume}</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Calendar className="w-3 h-3" />
                {actualites[1].date}
              </div>
              <button className="text-green-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                Lire <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Articles list */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {actualites.slice(2).map((actu) => (
            <div key={actu.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover flex flex-col">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 w-fit ${actu.catColor}`}>
                {actu.categorie}
              </span>
              <h3 className="font-bold text-gray-900 text-sm mb-2 flex-1 leading-snug">{actu.titre}</h3>
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-3">
                <Calendar className="w-3 h-3" />
                {actu.date}
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-green-700 text-green-700 font-bold hover:bg-green-700 hover:text-white transition-all duration-200">
            <Tag className="w-4 h-4" />
            Voir toutes les actualités
          </button>
        </div>
      </div>
    </section>
  );
}
