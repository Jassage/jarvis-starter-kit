"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Briefcase, Music2, Search, Send, X, User, ArrowRight } from "lucide-react";
import { personnalitesApi, mediaUrl } from "@/lib/api";

interface Traduction {
  locale: "FR" | "HT";
  domaine: string;
  biographie: string;
}

interface Personnalite {
  id: string;
  nom: string;
  periode: string | null;
  photoUrl: string | null;
  categorie: string;
  traductions: Traduction[];
}

const CATEGORIE_STYLE: Record<string, { label: string; icon: typeof Award; color: string }> = {
  POLITIQUE: { label: "Politique & Gouvernance", icon: Briefcase, color: "from-blue-500 to-indigo-600" },
  CULTURE: { label: "Culture & Arts", icon: Music2, color: "from-purple-500 to-violet-600" },
  EDUCATION: { label: "Éducation & Sciences", icon: Award, color: "from-teal-500 to-cyan-600" },
  SPORT: { label: "Sports", icon: Award, color: "from-lime-500 to-green-600" },
  ENTREPRENEURIAT: { label: "Entrepreneuriat", icon: Briefcase, color: "from-amber-500 to-orange-600" },
  AUTRE: { label: "Autres", icon: Award, color: "from-gray-500 to-gray-700" },
};

const FILTRES = [
  { value: "TOUTES", label: "Toutes les personnalités" },
  { value: "POLITIQUE", label: "Politique & Gouvernance" },
  { value: "CULTURE", label: "Culture & Arts" },
  { value: "EDUCATION", label: "Éducation & Sciences" },
  { value: "SPORT", label: "Sports" },
  { value: "ENTREPRENEURIAT", label: "Entrepreneuriat" },
  { value: "AUTRE", label: "Autres" },
];

function initialesDe(nom: string) {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]?.toUpperCase()).join("");
}

export default function PersonnalitesSection() {
  const [personnalites, setPersonnalites] = useState<Personnalite[]>([]);
  const [filtre, setFiltre] = useState("TOUTES");
  const [recherche, setRecherche] = useState("");
  const [visible, setVisible] = useState(6);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    personnalitesApi
      .list()
      .then(({ data }) => setPersonnalites(data.data.personnalites))
      .catch(() => setPersonnalites([]));
  }, []);

  const filtrees = useMemo(() => {
    return personnalites.filter((p) => {
      const matchCategorie = filtre === "TOUTES" || p.categorie === filtre;
      const matchRecherche = !recherche.trim() || p.nom.toLowerCase().includes(recherche.trim().toLowerCase());
      return matchCategorie && matchRecherche;
    });
  }, [personnalites, filtre, recherche]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); }, 2500);
  }

  if (personnalites.length === 0) return null;

  return (
    <section id="personnalites" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Fils & Filles de Gros-Morne
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Nos <span className="gradient-text">Personnalités</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Des hommes et des femmes de Gros-Morne qui ont marqué leur époque
            et porté fièrement le nom de leur ville au-delà des frontières.
          </p>
        </div>

        {/* Filtres + recherche */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-10">
          <div className="flex flex-wrap gap-2 flex-1">
            {FILTRES.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFiltre(f.value); setVisible(6); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filtre === f.value
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative shrink-0 w-full lg:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une personnalité..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Cards */}
        {filtrees.length === 0 ? (
          <p className="text-center text-gray-400 mb-12">Aucune personnalité ne correspond à ce filtre.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filtrees.slice(0, visible).map((p) => {
              const t = p.traductions.find((tr) => tr.locale === "FR");
              const style = CATEGORIE_STYLE[p.categorie] ?? CATEGORIE_STYLE.AUTRE;
              const Icon = style.icon;
              const photo = mediaUrl(p.photoUrl);
              return (
                <div key={p.id} className="group bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden card-hover flex flex-col">
                  <div className="relative h-44">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={p.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${style.color} flex items-center justify-center`}>
                        <span className="text-4xl font-black text-white">{initialesDe(p.nom)}</span>
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r ${style.color} text-white shadow`}>
                      <Icon className="w-3 h-3" />
                      {style.label}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-gray-900 mb-1">{p.nom}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1">{t?.domaine}</p>
                    <Link
                      href={`/personnalites/${p.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 group-hover:gap-2.5 transition-all"
                    >
                      Voir le profil <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {visible < filtrees.length && (
          <div className="text-center mb-12">
            <button
              onClick={() => setVisible((v) => v + 6)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-700 text-white font-bold hover:bg-green-800 transition-colors"
            >
              Voir plus de personnalités
            </button>
          </div>
        )}

        {/* Contribution CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-amber-400" />
                <h3 className="text-2xl font-black text-white">Vous connaissez une personnalité ?</h3>
              </div>
              <p className="text-gray-300 max-w-xl text-sm leading-relaxed">
                Cette section est collaborative. Si vous connaissez un fils ou une fille de
                Gros-Morne qui mérite d&apos;être mentionné(e), proposez-nous sa fiche.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-400 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Send className="w-4 h-4" />
              Proposer une personnalité
            </button>
          </div>
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-fade-in-up">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg">Proposer une personnalité</h3>
                  <p className="text-gray-500 text-sm">Votre suggestion sera examinée par l&apos;équipe</p>
                </div>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-black text-gray-900 text-xl mb-2">Merci !</h4>
                  <p className="text-gray-500 text-sm">Votre suggestion a été envoyée. Nous l&apos;examinerons bientôt.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet *</label>
                    <input required type="text" placeholder="Ex: Marie-Claire Joseph"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Domaine *</label>
                    <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm">
                      <option value="">Sélectionner...</option>
                      <option>Politique</option>
                      <option>Culture & Arts</option>
                      <option>Musique</option>
                      <option>Littérature</option>
                      <option>Médecine</option>
                      <option>Éducation</option>
                      <option>Sport</option>
                      <option>Entrepreneuriat</option>
                      <option>Religion</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Période / Années</label>
                    <input type="text" placeholder="Ex: 1960–2005 ou XXe siècle"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                    <textarea required rows={4} placeholder="Décrivez les accomplissements et l'importance de cette personnalité pour Gros-Morne..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Votre email (facultatif)</label>
                    <input type="email" placeholder="pour vous notifier quand la fiche est publiée"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm" />
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black hover:opacity-90 hover:scale-[1.01] transition-all duration-200 shadow-md flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer la suggestion
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
