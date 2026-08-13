"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Calendar, ArrowRight, Search } from "lucide-react";
import { actualitesApi } from "@/lib/api";

interface Traduction {
  locale: "FR" | "HT";
  resume: string;
}

interface Article {
  id: string;
  titre: string;
  categorie: string;
  datePublication: string;
  traductions: Traduction[];
}

const CATEGORIE_COULEUR: Record<string, string> = {
  COMMUNIQUE: "bg-sky-100 text-sky-700",
  INTERVIEW: "bg-indigo-100 text-indigo-700",
  REPORTAGE: "bg-teal-100 text-teal-700",
  CULTURE: "bg-purple-100 text-purple-700",
  SPORT: "bg-lime-100 text-lime-700",
  SANTE: "bg-red-100 text-red-700",
  AGRICULTURE: "bg-orange-100 text-orange-700",
  EDUCATION: "bg-amber-100 text-amber-700",
  POLITIQUE: "bg-slate-100 text-slate-700",
  DEVELOPPEMENT: "bg-green-100 text-green-700",
  INFRASTRUCTURE: "bg-blue-100 text-blue-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

const CATEGORIE_LABEL: Record<string, string> = {
  COMMUNIQUE: "Communiqué", INTERVIEW: "Interview", REPORTAGE: "Reportage", CULTURE: "Culture",
  SPORT: "Sport", SANTE: "Santé", AGRICULTURE: "Agriculture", EDUCATION: "Éducation",
  POLITIQUE: "Politique locale", DEVELOPPEMENT: "Développement", INFRASTRUCTURE: "Infrastructure", AUTRE: "Autre",
};

function formaterDate(iso: string) {
  // timeZone: "UTC" évite le décalage d'un jour : les dates de publication sont stockées en
  // UTC minuit (date sans heure), un fuseau local négatif afficherait sinon la veille.
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function resumeDe(a: Article) {
  return a.traductions.find((t) => t.locale === "FR")?.resume ?? "";
}

export default function ActualitesSection() {
  const [actualites, setActualites] = useState<Article[]>([]);
  const [q, setQ] = useState("");
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      actualitesApi
        .list(q.trim() ? { q: q.trim() } : undefined)
        .then(({ data }) => setActualites(data.data.articles))
        .catch(() => setActualites([]))
        .finally(() => setCharge(true));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Tant qu'aucune recherche n'est en cours, une liste vide au premier chargement masque
  // toute la section (comportement d'origine) ; une fois qu'une recherche a été tapée, une
  // liste vide affiche "aucun résultat" plutôt que de faire disparaître la barre de recherche.
  if (!charge) return null;
  if (actualites.length === 0 && !q.trim()) return null;

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
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Restez connecté aux dernières nouvelles de votre ville. Événements,
            projets de développement, culture et communauté.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une actualité (titre, contenu)..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {actualites.length === 0 ? (
          <p className="text-center text-gray-400 mb-4">Aucune actualité ne correspond à cette recherche.</p>
        ) : (
        <>
        {/* Featured + grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Featured article */}
          <Link
            href={`/actualites/${actualites[0].id}`}
            className="lg:col-span-2 bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-8 text-white relative overflow-hidden card-hover block"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4">
              À la une
            </span>
            <h3 className="text-2xl font-black mb-3">{actualites[0].titre}</h3>
            <p className="text-green-200 leading-relaxed mb-6">{resumeDe(actualites[0])}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <Calendar className="w-4 h-4" />
                {formaterDate(actualites[0].datePublication)}
              </div>
              <span className="flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all">
                Lire <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Side article */}
          {actualites[1] && (
            <Link
              href={`/actualites/${actualites[1].id}`}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 card-hover flex flex-col"
            >
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 w-fit ${CATEGORIE_COULEUR[actualites[1].categorie]}`}>
                {CATEGORIE_LABEL[actualites[1].categorie]}
              </span>
              <h3 className="text-lg font-black text-gray-900 mb-3 flex-1">{actualites[1].titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{resumeDe(actualites[1])}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  {formaterDate(actualites[1].datePublication)}
                </div>
                <span className="text-green-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  Lire <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Articles list */}
        {actualites.length > 2 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {actualites.slice(2).map((actu) => (
              <Link
                key={actu.id}
                href={`/actualites/${actu.id}`}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover flex flex-col"
              >
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 w-fit ${CATEGORIE_COULEUR[actu.categorie]}`}>
                  {CATEGORIE_LABEL[actu.categorie]}
                </span>
                <h3 className="font-bold text-gray-900 text-sm mb-2 flex-1 leading-snug">{actu.titre}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-xs mt-3">
                  <Calendar className="w-3 h-3" />
                  {formaterDate(actu.datePublication)}
                </div>
              </Link>
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </section>
  );
}
