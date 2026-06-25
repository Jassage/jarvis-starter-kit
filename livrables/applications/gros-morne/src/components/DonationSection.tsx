"use client";

import { Heart, Target, Users, Zap, ShieldCheck, Globe } from "lucide-react";

const objectifs = [
  {
    icon: Globe,
    label: "Infrastructure numérique",
    desc: "Hébergement, domaine, maintenance du site",
    goal: 2000,
    raised: 430,
    color: "bg-blue-500",
  },
  {
    icon: Users,
    label: "Espace communautaire",
    desc: "Forum, galerie collaborative, annuaire local",
    goal: 3500,
    raised: 890,
    color: "bg-green-500",
  },
  {
    icon: Zap,
    label: "Médias & Contenu",
    desc: "Reportages locaux, photos, vidéos de la ville",
    goal: 1500,
    raised: 210,
    color: "bg-amber-500",
  },
];

const tiers = [
  {
    label: "Supporter",
    amount: 5,
    desc: "Un café pour l'équipe",
    icon: "☕",
    color: "border-slate-200 hover:border-green-300",
    badge: "bg-slate-100 text-slate-600",
  },
  {
    label: "Citoyen",
    amount: 20,
    desc: "Un mois de serveur",
    icon: "🏘️",
    color: "border-green-300 hover:border-green-500 ring-1 ring-green-200",
    badge: "bg-green-100 text-green-700",
    popular: true,
  },
  {
    label: "Bâtisseur",
    amount: 50,
    desc: "Développement d'une fonctionnalité",
    icon: "🏗️",
    color: "border-amber-300 hover:border-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    label: "Ambassadeur",
    amount: 100,
    desc: "Parrainez un mois entier",
    icon: "🌟",
    color: "border-purple-300 hover:border-purple-500",
    badge: "bg-purple-100 text-purple-700",
  },
];

export default function DonationSection() {
  return (
    <section id="don" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-sm font-medium mb-4">
            <Heart className="w-4 h-4 fill-red-500" />
            Soutenir Gros-Morne
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Investissez dans{" "}
            <span className="gradient-text">votre ville</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Cette plateforme est construite par et pour la communauté de Gros-Morne.
            Chaque don, petit ou grand, contribue directement au développement numérique de notre ville.
          </p>
        </div>

        {/* Objectifs de financement */}
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {objectifs.map(({ icon: Icon, label, desc, goal, raised, color }) => {
            const pct = Math.round((raised / goal) * 100);
            return (
              <div key={label} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 card-hover">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{label}</h3>
                <p className="text-sm text-gray-500 mb-4">{desc}</p>
                {/* Barre */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full progress-bar ${color}`}
                    style={{ "--progress": `${pct}%` } as React.CSSProperties}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-700">${raised} collectés</span>
                  <span>Objectif ${goal}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tiers de don */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {tiers.map(({ label, amount, desc, icon, color, badge, popular }) => (
            <div
              key={label}
              className={`relative bg-white rounded-2xl p-5 border-2 ${color} transition-all duration-200 cursor-pointer text-center group`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full">
                  Populaire
                </span>
              )}
              <div className="text-3xl mb-2">{icon}</div>
              <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${badge}`}>
                {label}
              </div>
              <div className="text-2xl font-black text-gray-900 mb-1">${amount}</div>
              <p className="text-xs text-gray-500 mb-4">{desc}</p>
              <button className="w-full py-2 rounded-xl bg-green-700 text-white text-sm font-bold group-hover:bg-green-600 transition-colors">
                Donner
              </button>
            </div>
          ))}
        </div>

        {/* Garantie + CTA libre */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="w-8 h-8 text-green-300" />
              <h3 className="text-xl font-black">Transparence totale</h3>
            </div>
            <p className="text-green-200 text-sm leading-relaxed">
              Chaque dollar collecté est utilisé exclusivement pour le développement
              de la plateforme et les projets communautaires de Gros-Morne.
              Les comptes sont publiés chaque trimestre.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0">
            <Target className="w-10 h-10 text-amber-400" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">$1 530</div>
              <div className="text-green-300 text-sm">collectés sur $7 000</div>
            </div>
            <a
              href="#don"
              className="px-6 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-400 hover:scale-105 transition-all duration-200 shadow-lg text-sm"
            >
              Faire un don libre
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
