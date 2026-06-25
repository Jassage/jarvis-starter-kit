"use client";

import { Camera, MapPin, Clock, Star, ArrowRight, Mountain, Waves, TreePine, Landmark } from "lucide-react";

const lieux = [
  {
    id: 1,
    nom: "Les Mornes Panoramiques",
    categorie: "Nature",
    icon: Mountain,
    couleur: "from-green-500 to-teal-600",
    bg: "bg-green-50",
    description:
      "Les collines verdoyantes de Gros-Morne offrent des panoramas à couper le souffle sur la vallée et les villages environnants. Idéal pour la randonnée et la photographie.",
    duree: "2-4 heures",
    difficulte: "Modérée",
    tags: ["Randonnée", "Vue panoramique", "Nature"],
  },
  {
    id: 2,
    nom: "Sources & Rivières Naturelles",
    categorie: "Eau",
    icon: Waves,
    couleur: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    description:
      "Les sources naturelles et rivières qui traversent la région de Gros-Morne sont des joyaux cachés. L'eau claire et fraîche descend des mornes pour créer des espaces de baignade naturelle.",
    duree: "1-3 heures",
    difficulte: "Facile",
    tags: ["Baignade", "Fraîcheur", "Nature"],
  },
  {
    id: 3,
    nom: "Forêts & Végétation Tropicale",
    categorie: "Écotourisme",
    icon: TreePine,
    couleur: "from-emerald-500 to-green-700",
    bg: "bg-emerald-50",
    description:
      "Les zones boisées autour de Gros-Morne abritent une biodiversité remarquable. Oiseaux endémiques, plantes médicinales et arbres fruitiers tropicaux composent ce trésor naturel.",
    duree: "3-5 heures",
    difficulte: "Modérée",
    tags: ["Biodiversité", "Oiseaux", "Plantes"],
  },
  {
    id: 4,
    nom: "Centre-Ville Historique",
    categorie: "Patrimoine",
    icon: Landmark,
    couleur: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    description:
      "Le centre-ville de Gros-Morne conserve l'architecture coloniale et les places publiques qui témoignent de son histoire. L'église centrale, le marché et les bâtiments anciens valent le détour.",
    duree: "1-2 heures",
    difficulte: "Facile",
    tags: ["Architecture", "Histoire", "Marché"],
  },
  {
    id: 5,
    nom: "Marchés Locaux Traditionnels",
    categorie: "Culture",
    icon: Camera,
    couleur: "from-purple-500 to-violet-600",
    bg: "bg-purple-50",
    description:
      "Les marchés traditionnels de Gros-Morne sont une fenêtre ouverte sur la vie locale. Produits agricoles frais, artisanat local, épices et saveurs haïtiennes authentiques s'y retrouvent.",
    duree: "1-2 heures",
    difficulte: "Facile",
    tags: ["Artisanat", "Gastronomie", "Vie locale"],
  },
  {
    id: 6,
    nom: "Fête Patronale & Rara",
    categorie: "Événement",
    icon: Star,
    couleur: "from-red-500 to-pink-600",
    bg: "bg-red-50",
    description:
      "Les fêtes patronales et le Rara de Gros-Morne sont des moments de célébration intense. Musique, danse, costumes colorés et traditions vaudoues se mêlent dans une fête populaire inoubliable.",
    duree: "Toute la journée",
    difficulte: "Facile",
    tags: ["Musique", "Danse", "Tradition"],
  },
];

export default function TourismeSection() {
  return (
    <section id="tourisme" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            Lieux à visiter
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Découvrez{" "}
            <span className="gradient-text">Gros-Morne</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Entre nature sauvage, patrimoine historique et culture vivante,
            Gros-Morne réserve bien des surprises à ses visiteurs.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {lieux.map((lieu) => {
            const Icon = lieu.icon;
            return (
              <div
                key={lieu.id}
                className="group bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden card-hover"
              >
                {/* Card header */}
                <div className={`h-40 bg-gradient-to-br ${lieu.couleur} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: "radial-gradient(circle at 30% 70%, white 0%, transparent 60%)"
                  }} />
                  <Icon className="w-16 h-16 text-white/80" strokeWidth={1} />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${lieu.bg} text-xs font-bold text-gray-700`}>
                    {lieu.categorie}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{lieu.nom}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {lieu.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lieu.duree}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lieu.difficulte}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lieu.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

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
            href="#geographie"
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
