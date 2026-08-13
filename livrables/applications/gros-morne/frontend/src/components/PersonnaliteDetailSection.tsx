"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award, Briefcase, Music2, Share2, MessageCircle, Link2,
  Calendar, MapPin, Flag, Sparkles, CheckCircle2, Quote, ArrowLeft, ArrowRight,
  ImageOff, Newspaper,
} from "lucide-react";
import { personnalitesApi, actualitesApi, mediaUrl } from "@/lib/api";

interface Traduction {
  locale: "FR" | "HT";
  domaine: string;
  biographie: string;
  realisations: string[];
  citation: string | null;
}

interface EtapeTraduction { locale: "FR" | "HT"; titre: string; description: string }
interface Etape { id: string; annee: string; traductions: EtapeTraduction[] }
interface Photo { id: string; media: { url: string; alt: string | null } }

interface Personnalite {
  id: string;
  nom: string;
  periode: string | null;
  photoUrl: string | null;
  categorie: string;
  dateNaissance: string | null;
  lieuNaissance: string | null;
  nationalite: string | null;
  profession: string | null;
  periodeActivite: string | null;
  traductions: Traduction[];
  etapes: Etape[];
  photos: Photo[];
}

interface ArticleTraduction { locale: "FR" | "HT"; resume: string }
interface ArticleLie { id: string; titre: string; tags: string[]; datePublication: string; traductions: ArticleTraduction[] }

const CATEGORIE_STYLE: Record<string, { label: string; icon: typeof Award; color: string }> = {
  POLITIQUE: { label: "Politique & Gouvernance", icon: Briefcase, color: "from-blue-500 to-indigo-600" },
  CULTURE: { label: "Culture & Arts", icon: Music2, color: "from-purple-500 to-violet-600" },
  EDUCATION: { label: "Éducation & Sciences", icon: Award, color: "from-teal-500 to-cyan-600" },
  SPORT: { label: "Sports", icon: Award, color: "from-lime-500 to-green-600" },
  ENTREPRENEURIAT: { label: "Entrepreneuriat", icon: Briefcase, color: "from-amber-500 to-orange-600" },
  AUTRE: { label: "Autres", icon: Award, color: "from-gray-500 to-gray-700" },
};

const TABS = ["Biographie", "Parcours", "Réalisations", "Galerie", "Actualités"] as const;
type Tab = (typeof TABS)[number];

function initialesDe(nom: string) {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]?.toUpperCase()).join("");
}

function formaterDateNaissance(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function PersonnaliteDetailSection({ id }: { id: string }) {
  const [personnalite, setPersonnalite] = useState<Personnalite | null | undefined>(undefined);
  const [articlesLies, setArticlesLies] = useState<ArticleLie[]>([]);
  const [tab, setTab] = useState<Tab>("Biographie");

  useEffect(() => {
    personnalitesApi
      .get(id)
      .then(({ data }) => setPersonnalite(data.data.personnalite))
      .catch(() => setPersonnalite(null));
  }, [id]);

  useEffect(() => {
    if (!personnalite) return;
    // Convention admin : un article est lié à une personnalité si son tag reprend son nom exact.
    actualitesApi
      .list()
      .then(({ data }) => setArticlesLies(data.data.articles.filter((a: ArticleLie) => a.tags.includes(personnalite.nom))))
      .catch(() => setArticlesLies([]));
  }, [personnalite]);

  if (personnalite === undefined) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center text-gray-400">Chargement…</div>;
  }

  if (personnalite === null) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-gray-500 mb-4">Cette personnalité est introuvable.</p>
        <Link href="/personnalites" className="inline-flex items-center gap-2 text-green-700 font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Retour aux personnalités
        </Link>
      </div>
    );
  }

  const t = personnalite.traductions.find((tr) => tr.locale === "FR") ?? personnalite.traductions[0];
  const style = CATEGORIE_STYLE[personnalite.categorie] ?? CATEGORIE_STYLE.AUTRE;
  const Icon = style.icon;
  const photo = mediaUrl(personnalite.photoUrl);
  const infos = [
    { label: "Date de naissance", value: formaterDateNaissance(personnalite.dateNaissance), icon: Calendar },
    { label: "Lieu de naissance", value: personnalite.lieuNaissance, icon: MapPin },
    { label: "Nationalité", value: personnalite.nationalite, icon: Flag },
    { label: "Profession", value: personnalite.profession, icon: Briefcase },
    { label: "Période d'activité", value: personnalite.periodeActivite ?? personnalite.periode, icon: Sparkles },
  ].filter((i) => i.value);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          {/* Main column */}
          <div>
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <div className="shrink-0">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={personnalite.nom} className="w-full sm:w-48 h-48 rounded-2xl object-cover shadow-lg" />
                ) : (
                  <div className={`w-full sm:w-48 h-48 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-5xl font-black text-white">{initialesDe(personnalite.nom)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-gray-900 mb-1">{personnalite.nom}</h1>
                {t && <p className="text-gray-500 mb-3">{t.domaine}</p>}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 bg-gradient-to-r ${style.color} text-white`}>
                  <Icon className="w-3.5 h-3.5" />
                  {style.label}
                </span>
                <div className="flex items-center gap-2">
                  {[Share2, MessageCircle, Link2].map((S, i) => (
                    <button key={i} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-green-300 hover:text-green-700 transition-colors" aria-label="Partager">
                      <S className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-gray-100 mb-8">
              {TABS.map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === tb ? "border-green-700 text-green-700" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tb}
                </button>
              ))}
            </div>

            {tab === "Biographie" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Biographie</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{t?.biographie}</p>
              </div>
            )}

            {tab === "Réalisations" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Réalisations majeures</h2>
                {t && t.realisations.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {t.realisations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">Aucune réalisation renseignée pour le moment.</p>
                )}
              </div>
            )}

            {tab === "Parcours" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Parcours</h2>
                {personnalite.etapes.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucune étape de parcours renseignée pour le moment.</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-gray-100 flex flex-col gap-6">
                    {personnalite.etapes.map((e) => {
                      const et = e.traductions.find((tr) => tr.locale === "FR") ?? e.traductions[0];
                      return (
                        <div key={e.id} className="relative">
                          <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-green-600 border-2 border-white" />
                          <span className="text-xs font-bold text-green-700">{e.annee}</span>
                          <h3 className="font-bold text-gray-900">{et?.titre}</h3>
                          <p className="text-sm text-gray-500 leading-relaxed mt-1">{et?.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "Galerie" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Galerie</h2>
                {personnalite.photos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                    <ImageOff className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Aucune photo dans la galerie pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {personnalite.photos.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p.id} src={mediaUrl(p.media.url)} alt={p.media.alt ?? personnalite.nom} className="w-full h-32 object-cover rounded-xl" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "Actualités" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Actualités liées</h2>
                {articlesLies.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                    <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Aucune actualité ne mentionne cette personnalité pour le moment.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {articlesLies.map((a) => {
                      const resume = a.traductions.find((tr) => tr.locale === "FR")?.resume ?? "";
                      return (
                        <Link key={a.id} href={`/actualites/${a.id}`} className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm truncate">{a.titre}</h3>
                            <p className="text-xs text-gray-400 truncate">{resume}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            {infos.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Informations clés</h3>
                <div className="grid grid-cols-1 gap-4">
                  {infos.map(({ label, value, icon: InfoIcon }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <InfoIcon className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {t && t.realisations.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Réalisations majeures</h3>
                <ul className="flex flex-col gap-2.5">
                  {t.realisations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {t?.citation && (
              <div className="bg-amber-50 rounded-2xl p-5 relative">
                <Quote className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-sm text-amber-900 italic leading-relaxed">&ldquo;{t.citation}&rdquo;</p>
                <p className="text-xs text-amber-600 font-semibold mt-2">— {personnalite.nom}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
