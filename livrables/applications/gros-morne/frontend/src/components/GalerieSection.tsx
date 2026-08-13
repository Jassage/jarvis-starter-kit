"use client";

import { useEffect, useState } from "react";
import { Camera, Upload, X, ZoomIn, Heart, MapPin, Filter, Play } from "lucide-react";
import { galerieApi, videosApi, mediaUrl } from "@/lib/api";

interface Media { url: string }
interface GalerieMediaItem {
  id: string;
  titre: string;
  auteur: string | null;
  lieu: string | null;
  icone: string | null;
  media: Media | null;
}
interface Album {
  id: string;
  nom: string;
  categorie: string;
  medias: GalerieMediaItem[];
}

interface VideoTraduction { locale: "FR" | "HT"; description: string }
interface Video {
  id: string;
  titre: string;
  url: string;
  categorie: string;
  miseEnAvant: boolean;
  traductions: VideoTraduction[];
}

const CATEGORIE_LABEL: Record<string, string> = {
  NATURE: "Nature", CULTURE: "Culture", HISTOIRE: "Histoire", EVENEMENTS: "Événements",
  TOURISME: "Tourisme", DRONE: "Drone", VIE_LOCALE: "Vie locale", ARCHITECTURE: "Architecture", AUTRE: "Autre",
};

const CATEGORIE_COULEUR: Record<string, string> = {
  NATURE: "from-green-400 to-teal-600",
  CULTURE: "from-red-400 to-rose-600",
  HISTOIRE: "from-slate-400 to-slate-600",
  EVENEMENTS: "from-purple-500 to-pink-600",
  TOURISME: "from-cyan-400 to-blue-500",
  DRONE: "from-sky-400 to-indigo-500",
  VIE_LOCALE: "from-amber-400 to-orange-500",
  ARCHITECTURE: "from-slate-400 to-slate-600",
  AUTRE: "from-gray-400 to-gray-600",
};

interface PhotoAffichee {
  id: string;
  titre: string;
  auteur: string | null;
  lieu: string | null;
  categorie: string;
  emoji: string;
  photoUrl: string | null;
  bg: string;
}

export default function GalerieSection() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filtre, setFiltre] = useState("Tout");
  const [showUpload, setShowUpload] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    galerieApi.list().then(({ data }) => setAlbums(data.data.albums)).catch(() => setAlbums([]));
    videosApi.list().then(({ data }) => setVideos(data.data.videos)).catch(() => setVideos([]));
  }, []);

  const photos: PhotoAffichee[] = albums.flatMap((album) =>
    album.medias.map((m) => ({
      id: m.id,
      titre: m.titre,
      auteur: m.auteur,
      lieu: m.lieu,
      categorie: album.categorie,
      emoji: m.icone ?? "📷",
      photoUrl: mediaUrl(m.media?.url) ?? null,
      bg: CATEGORIE_COULEUR[album.categorie] ?? CATEGORIE_COULEUR.AUTRE,
    }))
  );

  const categoriesPresentes = Array.from(new Set(albums.map((a) => a.categorie)));
  const filtres = ["Tout", ...categoriesPresentes];
  const filtered = filtre === "Tout" ? photos : photos.filter((p) => p.categorie === filtre);

  function toggleLike(id: string) {
    setLiked((prev) => {
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

  if (photos.length === 0 && videos.length === 0) return null;

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

        {photos.length > 0 && (
          <>
            {/* Filtres */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {filtres.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltre(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    filtre === cat
                      ? "bg-green-700 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-700"
                  }`}
                >
                  {cat === "Tout" ? "Tout" : CATEGORIE_LABEL[cat]}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {filtered.map((photo) => (
                <div key={photo.id} className="group relative rounded-2xl overflow-hidden shadow-md cursor-pointer card-hover">
                  <div className={`bg-gradient-to-br ${photo.bg} h-44 flex items-center justify-center relative`}>
                    {photo.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.photoUrl} alt={photo.titre} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl select-none">{photo.emoji}</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-black/40 backdrop-blur text-white text-xs font-bold rounded-full">
                      {CATEGORIE_LABEL[photo.categorie]}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white font-bold text-sm truncate">{photo.titre}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        {photo.lieu && (<><MapPin className="w-3 h-3" /><span className="truncate max-w-[100px]">{photo.lieu}</span></>)}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                        className="flex items-center gap-1 text-xs font-bold transition-colors"
                      >
                        <Heart className={`w-3.5 h-3.5 transition-colors ${liked.has(photo.id) ? "text-red-400 fill-red-400" : "text-white/60"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm mb-3">
                {photos.length} photos partagées par la communauté
              </p>
            </div>
          </>
        )}

        {/* Vidéos */}
        {videos.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Vidéos</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => {
                const description = v.traductions.find((t) => t.locale === "FR")?.description ?? "";
                return (
                  <a
                    key={v.id}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover flex flex-col"
                  >
                    <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center relative">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      {v.miseEnAvant && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                          En vedette
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">{CATEGORIE_LABEL[v.categorie]}</p>
                      <h4 className="font-bold text-gray-900 text-sm mt-1 mb-1">{v.titre}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
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
                        {Object.values(CATEGORIE_LABEL).map((c) => <option key={c}>{c}</option>)}
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
