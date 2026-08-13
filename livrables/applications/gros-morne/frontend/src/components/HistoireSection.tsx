"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Landmark, ArrowRight, PlayCircle,
  Sprout, Flag, Wheat, Building2, Rocket, Users, ExternalLink,
} from "lucide-react";

const periodes = [
  {
    id: "periode-1",
    annee: "Avant 1804",
    titre: "Période coloniale",
    icon: Sprout,
    color: "from-amber-500 to-orange-600",
    desc: "Durant la période coloniale française, la région de Gros-Morne était habitée par des esclaves africains travaillant les terres fertiles. La géographie montagneuse de la zone offrait des refuges naturels aux résistants.",
  },
  {
    id: "periode-2",
    annee: "1804",
    titre: "Indépendance d'Haïti",
    icon: Flag,
    color: "from-green-600 to-green-700",
    desc: "Après la Révolution haïtienne, Gros-Morne devient une commune officielle. Les habitants, anciens esclaves libérés, s'établissent sur ces terres montagneuses et fondent une communauté forte.",
  },
  {
    id: "periode-3",
    annee: "XIXe siècle",
    titre: "Développement agricole",
    icon: Wheat,
    color: "from-blue-600 to-blue-700",
    desc: "Gros-Morne se distingue comme une zone agricole importante. Le café, la canne à sucre et les cultures vivrières font la prospérité de la région. La ville devient un centre commercial régional.",
  },
  {
    id: "periode-4",
    annee: "XXe siècle",
    titre: "Croissance urbaine",
    icon: Building2,
    color: "from-purple-600 to-purple-700",
    desc: "La ville connaît une croissance démographique et urbaine significative. Des infrastructures scolaires, religieuses et administratives se développent. La culture locale s'affirme.",
  },
  {
    id: "periode-5",
    annee: "Aujourd'hui",
    titre: "Gros-Morne aujourd'hui",
    icon: Rocket,
    color: "from-green-500 to-teal-600",
    desc: "Gros-Morne est aujourd'hui une commune dynamique répartie sur plusieurs sections communales. Elle conserve son identité culturelle profonde tout en se modernisant pour ses enfants.",
  },
];

const sommaire = [
  { id: "apercu", label: "Aperçu historique" },
  ...periodes.map((p) => ({ id: p.id, label: p.titre })),
  { id: "chronologie", label: "Chronologie" },
];

const liensExternes = [
  { label: "Patrimoine culturel", href: "/culture", icon: Landmark },
  { label: "Figures historiques", href: "/personnalites", icon: Users },
];

export default function HistoireSection() {
  const [actif, setActif] = useState("apercu");

  function allerA(id: string) {
    setActif(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar sommaire */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-1">
              {sommaire.map((s) => (
                <button
                  key={s.id}
                  onClick={() => allerA(s.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                    actif === s.id ? "bg-green-700 text-white font-bold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {actif === s.id && <Landmark className="w-3.5 h-3.5" />}
                  {s.label}
                </button>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              {liensExternes.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-green-700 flex items-center justify-between gap-2 transition-colors"
                >
                  <span className="flex items-center gap-2"><l.icon className="w-3.5 h-3.5" /> {l.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </aside>

          {/* Contenu principal */}
          <div>
            <div id="apercu" className="scroll-mt-24 mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Aperçu historique</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gros-Morne, commune du département de l&apos;Artibonite, possède une histoire
                profondément ancrée dans l&apos;évolution socio-économique et politique d&apos;Haïti.
                Des premiers habitants à l&apos;essor agricole, en passant par les luttes pour la
                liberté et le développement local, chaque période a laissé une empreinte
                indélébile sur l&apos;identité de notre commune.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Berceau de traditions, de courage et de travail, Gros-Morne continue d&apos;écrire
                son histoire à travers ses habitants, ses institutions et ses initiatives.
              </p>

              {/* Emplacement vidéo — aucune vidéo publiée pour le moment */}
              <div className="rounded-2xl border-2 border-dashed border-gray-200 h-56 sm:h-72 flex flex-col items-center justify-center gap-2 bg-gray-50">
                <PlayCircle className="w-10 h-10 text-gray-300" />
                <p className="text-gray-400 text-sm font-medium">Documentaire historique à venir</p>
              </div>
            </div>

            {/* Grandes périodes */}
            <div className="mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Les grandes périodes de notre histoire</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {periodes.map((p) => (
                  <div key={p.id} id={p.id} className="scroll-mt-24 bg-white rounded-2xl p-5 shadow-md border border-gray-100 card-hover">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-3`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5">{p.titre}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">{p.desc}</p>
                    <span className="text-xs font-bold text-green-700">{p.annee}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Faits marquants */}
            <div id="chronologie" className="scroll-mt-24 mb-16">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Faits marquants</h2>
              <div className="relative">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 hidden sm:block" />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                  {periodes.map((p) => (
                    <div key={p.id} className="relative flex flex-col items-center text-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${p.color} z-10`} />
                      <span className="text-sm font-black text-gray-900">{p.annee}</span>
                      <span className="text-xs text-gray-400">{p.titre}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA final */}
            <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-2">Notre histoire, notre fierté</p>
                <h3 className="text-xl sm:text-2xl font-black mb-2">
                  Connaître notre passé, c&apos;est construire ensemble un avenir meilleur
                </h3>
                <p className="text-green-200 text-sm max-w-lg">
                  pour Gros-Morne et pour les générations futures.
                </p>
              </div>
              <Link
                href="/culture"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-400 hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Découvrir notre culture <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
