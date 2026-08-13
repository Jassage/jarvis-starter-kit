"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { actualitesApi, agendaApi, mediaUrl } from "@/lib/api";

interface ArticleTraduction { locale: "FR" | "HT"; resume: string }
interface Media { url: string }
interface Article {
  id: string;
  titre: string;
  categorie: string;
  datePublication: string;
  imagePrincipale: Media | null;
  traductions: ArticleTraduction[];
}

interface Evenement {
  id: string;
  nom: string;
  date: string;
  lieu: string;
  heureAffichage: string | null;
}

const CATEGORIE_LABEL: Record<string, string> = {
  COMMUNIQUE: "Communiqué", INTERVIEW: "Interview", REPORTAGE: "Reportage", CULTURE: "Culture",
  SPORT: "Sport", SANTE: "Santé", AGRICULTURE: "Agriculture", EDUCATION: "Éducation",
  POLITIQUE: "Politique locale", DEVELOPPEMENT: "Développement", INFRASTRUCTURE: "Infrastructure", AUTRE: "Autre",
};

const MOIS_ABREGE = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export default function ActualitesAgendaSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);

  useEffect(() => {
    actualitesApi.list().then(({ data }) => setArticles(data.data.articles.slice(0, 3))).catch(() => setArticles([]));
    agendaApi.list().then(({ data }) => setEvenements(data.data.evenements.slice(0, 4))).catch(() => setEvenements([]));
  }, []);

  if (articles.length === 0 && evenements.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
          {/* Actualités */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-black text-gray-900">Actualités récentes</h2>
              <Link href="/actualites" className="flex items-center gap-1.5 text-green-700 text-sm font-semibold hover:gap-2.5 transition-all shrink-0">
                Voir toutes les actualités <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {articles.map((a) => {
                const resume = a.traductions.find((t) => t.locale === "FR")?.resume ?? "";
                const image = mediaUrl(a.imagePrincipale?.url);
                return (
                  <Link key={a.id} href={`/actualites/${a.id}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover flex flex-col">
                    <div className="h-28 bg-gradient-to-br from-green-700 to-green-900 relative">
                      {image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={a.titre} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-gray-700">
                        {CATEGORIE_LABEL[a.categorie]}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug flex-1">{a.titre}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{resume}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Agenda */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="text-2xl font-black text-gray-900">Événements à venir</h2>
              <Link href="/agenda" className="flex items-center gap-1.5 text-green-700 text-sm font-semibold hover:gap-2.5 transition-all shrink-0">
                Voir tous <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {evenements.length === 0 ? (
              <p className="text-sm text-gray-400 bg-white rounded-2xl p-6 border border-gray-100">Aucun événement publié pour le moment.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {evenements.map((e) => {
                  const d = new Date(e.date);
                  return (
                    <div key={e.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4">
                      <div className="w-12 h-12 rounded-xl bg-green-700 text-white flex flex-col items-center justify-center shrink-0">
                        <span className="font-black leading-none text-base">{String(d.getUTCDate()).padStart(2, "0")}</span>
                        <span className="uppercase tracking-wider text-[9px]">{MOIS_ABREGE[d.getUTCMonth()]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{e.nom}</h3>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.lieu}</span>
                          {e.heureAffichage && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {e.heureAffichage}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
