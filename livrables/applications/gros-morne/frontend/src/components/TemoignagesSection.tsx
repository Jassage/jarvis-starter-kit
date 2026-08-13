"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { temoignagesApi, mediaUrl } from "@/lib/api";

interface Temoignage {
  id: string;
  nom: string;
  fonction: string | null;
  note: number | null;
  photo: { url: string } | null;
  traductions: { locale: string; contenu: string }[];
}

export default function TemoignagesSection() {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    temoignagesApi
      .list()
      .then(({ data }) => setTemoignages(data.data.temoignages))
      .finally(() => setLoading(false));
  }, []);

  // Section masquée tant qu'aucun témoignage n'est publié — pas de contenu fabriqué pour
  // combler un module vide (même principe que les Vidéos en Phase 2d).
  if (!loading && temoignages.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Ce que dit la <span className="gradient-text">communauté</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Habitants et diaspora témoignent de leur lien avec Gros-Morne.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400">Chargement...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {temoignages.map((t) => {
              const contenu = t.traductions.find((tr) => tr.locale === "FR") ?? t.traductions[0];
              const photoUrl = t.photo ? mediaUrl(t.photo.url) : undefined;
              return (
                <div key={t.id} className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col">
                  <Quote className="w-7 h-7 text-green-200 mb-3" />
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-5">
                    {contenu?.contenu}
                  </p>
                  {t.note && (
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.note! ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt={t.nom} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {t.nom[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.nom}</div>
                      {t.fonction && <div className="text-xs text-gray-400">{t.fonction}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
