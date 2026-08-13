"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, User, Tag, Share2, MessageCircle, Link2, ArrowLeft } from "lucide-react";
import { actualitesApi, mediaUrl } from "@/lib/api";

interface Traduction {
  locale: "FR" | "HT";
  resume: string;
  contenu: string | null;
}

interface Media { url: string }

interface Article {
  id: string;
  titre: string;
  auteur: string | null;
  categorie: string;
  tags: string[];
  datePublication: string;
  imagePrincipale: Media | null;
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
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function ArticleDetailSection({ id }: { id: string }) {
  const [article, setArticle] = useState<Article | null | undefined>(undefined);

  useEffect(() => {
    actualitesApi
      .get(id)
      .then(({ data }) => setArticle(data.data.article))
      .catch(() => setArticle(null));
  }, [id]);

  if (article === undefined) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center text-gray-400">Chargement…</div>;
  }

  if (article === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-gray-500 mb-4">Cet article est introuvable ou n&apos;est plus publié.</p>
        <Link href="/actualites" className="inline-flex items-center gap-2 text-green-700 font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour aux actualités
        </Link>
      </div>
    );
  }

  const t = article.traductions.find((tr) => tr.locale === "FR") ?? article.traductions[0];
  const image = mediaUrl(article.imagePrincipale?.url);

  return (
    <article className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${CATEGORIE_COULEUR[article.categorie]}`}>
          {CATEGORIE_LABEL[article.categorie]}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 leading-tight">{article.titre}</h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {formaterDate(article.datePublication)}
          </span>
          {article.auteur && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {article.auteur}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {[Share2, MessageCircle, Link2].map((S, i) => (
              <button key={i} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-green-300 hover:text-green-700 transition-colors" aria-label="Partager">
                <S className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={article.titre} className="w-full h-auto rounded-2xl mb-8 shadow-md" />
        )}

        <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">{t?.resume}</p>

        {t?.contenu && (
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">{t.contenu}</div>
        )}

        {article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-100">
            <Tag className="w-4 h-4 text-gray-300" />
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link href="/actualites" className="inline-flex items-center gap-2 text-green-700 font-semibold text-sm hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> Retour aux actualités
          </Link>
        </div>
      </div>
    </article>
  );
}
