"use client";

import { useState } from "react";
import { Award, Briefcase, Music2, Send, X, User } from "lucide-react";

const personnalites = [
  {
    nom: "Paul Prompt",
    domaine: "Militaire & Indépendance",
    icon: Award,
    initiales: "PP",
    color: "from-red-500 to-rose-600",
    avatarBg: "bg-gradient-to-br from-red-500 to-rose-600",
    description:
      "Figure historique de la guerre d'indépendance haïtienne. Paul Prompt fut l'un des chefs insurgés qui combattirent pour la liberté d'Haïti, aux côtés d'Étienne Magny. Son engagement dans la lutte pour l'indépendance reste un symbole de fierté pour Gros-Morne.",
    periode: "XVIIIe–XIXe siècle",
    photo: null,
  },
  {
    nom: "Étienne Magny",
    domaine: "Militaire & Indépendance",
    icon: Award,
    initiales: "EM",
    color: "from-green-500 to-emerald-600",
    avatarBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    description:
      "Chef insurgé de la guerre d'indépendance haïtienne, originaire de Gros-Morne. Étienne Magny combattit aux côtés de Paul Prompt pour l'affranchissement d'Haïti, contribuant à l'épopée fondatrice de la première République noire du monde.",
    periode: "XVIIIe–XIXe siècle",
    photo: null,
  },
  {
    nom: "Gerandale Thelusma",
    domaine: "Politique",
    icon: Briefcase,
    initiales: "GT",
    color: "from-blue-500 to-indigo-600",
    avatarBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    description:
      "Député de la 48e législature haïtienne, représentant la circonscription de Gros-Morne. Gerandale Thelusma a porté la voix de sa ville au Parlement national. Il a tragiquement disparu en décembre 2011 dans un accident sur la Route Nationale 1.",
    periode: "XXIe siècle",
    photo: null,
  },
  {
    nom: "Francisque FM — Les Voix de GM",
    domaine: "Culture & Médias",
    icon: Music2,
    initiales: "FM",
    color: "from-purple-500 to-violet-600",
    avatarBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    description:
      "Gros-Morne compte 11 stations radio et 2 chaînes TV locales. Francisque FM (98,9 MHz), fondée le 10 septembre 1994, est la doyenne des médias locaux. Une communauté créative qui fait rayonner la ville au-delà de ses frontières.",
    periode: "XXe–XXIe siècle",
    photo: null,
  },
];

function Avatar({ nom, initiales, avatarBg, photo, size = "lg" }: {
  nom: string; initiales: string; avatarBg: string; photo: string | null; size?: "lg" | "sm";
}) {
  const dim = size === "lg" ? "w-20 h-20" : "w-12 h-12";
  const text = size === "lg" ? "text-2xl" : "text-sm";
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt={nom} className={`${dim} rounded-2xl object-cover shadow-lg`} />
    );
  }
  return (
    <div className={`${dim} rounded-2xl ${avatarBg} flex items-center justify-center shadow-lg shrink-0`}>
      <span className={`${text} font-black text-white tracking-tight`}>{initiales}</span>
    </div>
  );
}

export default function PersonnalitesSection() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); }, 2500);
  }

  return (
    <section id="personnalites" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
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

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {personnalites.map(({ nom, domaine, icon: Icon, initiales, avatarBg, color, description, periode, photo }) => (
            <div
              key={nom}
              className="group flex gap-5 bg-white rounded-3xl p-6 shadow-md border border-gray-100 card-hover"
            >
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar nom={nom} initiales={initiales} avatarBg={avatarBg} photo={photo} size="lg" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-900 mb-1 text-lg leading-tight">{nom}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${color} text-white`}>
                  <Icon className="w-3 h-3" />
                  {domaine}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{description}</p>
                <p className="text-xs text-gray-400 font-medium">{periode}</p>
              </div>
            </div>
          ))}
        </div>

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
