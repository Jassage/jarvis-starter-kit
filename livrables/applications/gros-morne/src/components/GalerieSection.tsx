"use client";

import { useState } from "react";
import { Camera, Upload, X, ZoomIn, Heart, MapPin, Filter } from "lucide-react";

const categories = ["Tout", "Nature", "Culture", "Vie locale", "Architecture", "Événements"];

const photos = [
  {
    id: 1,
    titre: "Paysage des mornes",
    auteur: "Jean P.",
    lieu: "Mornes de Gros-Morne",
    categorie: "Nature",
    likes: 42,
    emoji: "🏔️",
    bg: "from-green-400 to-teal-600",
    size: "large",
  },
  {
    id: 2,
    titre: "Marché du dimanche",
    auteur: "Marie F.",
    lieu: "Centre-ville",
    categorie: "Vie locale",
    likes: 38,
    emoji: "🛒",
    bg: "from-amber-400 to-orange-500",
    size: "normal",
  },
  {
    id: 3,
    titre: "Fête patronale 2024",
    auteur: "Pierre A.",
    lieu: "Place centrale",
    categorie: "Événements",
    likes: 95,
    emoji: "🎉",
    bg: "from-purple-500 to-pink-600",
    size: "normal",
  },
  {
    id: 4,
    titre: "Rivière Blanche",
    auteur: "Claudette M.",
    lieu: "Section Rivière Blanche",
    categorie: "Nature",
    likes: 61,
    emoji: "🏞️",
    bg: "from-blue-400 to-cyan-500",
    size: "normal",
  },
  {
    id: 5,
    titre: "Église historique",
    auteur: "Robert T.",
    lieu: "Centre de Gros-Morne",
    categorie: "Architecture",
    likes: 29,
    emoji: "⛪",
    bg: "from-slate-400 to-slate-600",
    size: "normal",
  },
  {
    id: 6,
    titre: "Rara — carnaval de rue",
    auteur: "Nadège B.",
    lieu: "Gros-Morne",
    categorie: "Culture",
    likes: 113,
    emoji: "🥁",
    bg: "from-red-400 to-rose-600",
    size: "large",
  },
  {
    id: 7,
    titre: "Récolte de mangues",
    auteur: "Félix C.",
    lieu: "Savane Carrée",
    categorie: "Vie locale",
    likes: 55,
    emoji: "🥭",
    bg: "from-yellow-400 to-amber-500",
    size: "normal",
  },
  {
    id: 8,
    titre: "Coucher de soleil",
    auteur: "Isabelle J.",
    lieu: "Boucan Richard",
    categorie: "Nature",
    likes: 87,
    emoji: "🌅",
    bg: "from-orange-400 to-red-500",
    size: "normal",
  },
];

export default function GalerieSection() {
  const [filtre, setFiltre] = useState("Tout");
  const [showUpload, setShowUpload] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const filtered = filtre === "Tout" ? photos : photos.filter(p => p.categorie === filtre);

  function toggleLike(id: number) {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setShowUpload(false); setSubmitted(false); }, 2500);
  }

  return (
    <section id="galerie" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-3">
              <Camera className="w-4 h-4" />
              Galerie collaborative
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Gros-Morne en <span className="gradient-text">images</span>
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Photos partagées par la communauté</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Partager une photo
          </button>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltre(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filtre === cat
                  ? "bg-green-700 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid masonry-like */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className={`group relative rounded-2xl overflow-hidden shadow-md cursor-pointer card-hover ${
                photo.size === "large" ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              {/* Photo placeholder (gradient) */}
              <div className={`bg-gradient-to-br ${photo.bg} ${photo.size === "large" ? "h-72 sm:h-full min-h-56" : "h-44"} flex items-center justify-center relative`}>
                <span className={`${photo.size === "large" ? "text-7xl" : "text-5xl"} select-none`}>
                  {photo.emoji}
                </span>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Category badge */}
                <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-black/40 backdrop-blur text-white text-xs font-bold rounded-full">
                  {photo.categorie}
                </span>
              </div>
              {/* Card footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white font-bold text-sm truncate">{photo.titre}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-white/60 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{photo.lieu}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                    className="flex items-center gap-1 text-xs font-bold transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${liked.has(photo.id) ? "text-red-400 fill-red-400" : "text-white/60"}`} />
                    <span className={liked.has(photo.id) ? "text-red-400" : "text-white/60"}>
                      {photo.likes + (liked.has(photo.id) ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">
            {photos.length} photos partagées par la communauté
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-purple-600 text-purple-700 font-bold hover:bg-purple-600 hover:text-white transition-all duration-200">
            <Camera className="w-4 h-4" />
            Voir toutes les photos
          </button>
        </div>
      </div>

      {/* Modal upload */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-fade-in-up">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Partager une photo</h3>
                  <p className="text-gray-500 text-sm">Contribuez à la mémoire visuelle de Gros-Morne</p>
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📸</div>
                  <h4 className="font-black text-gray-900 text-xl mb-2">Photo reçue !</h4>
                  <p className="text-gray-500 text-sm">Votre photo sera visible après modération (24–48h).</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Zone de drop */}
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Cliquez pour choisir une photo</p>
                    <p className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP — max 10 Mo</p>
                    <input type="file" accept="image/*" className="hidden" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre de la photo *</label>
                    <input required type="text" placeholder="Ex: Coucher de soleil sur les mornes"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm">
                        {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lieu</label>
                      <input type="text" placeholder="Ex: Boucan Richard"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Votre prénom</label>
                    <input type="text" placeholder="Ex: Jean-Pierre"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm" />
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black hover:opacity-90 hover:scale-[1.01] transition-all duration-200 shadow-md flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Publier la photo
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
