"use client";

import { useEffect, useState } from "react";
import { Target, Eye, Users, History } from "lucide-react";
import { partenairesApi } from "@/lib/api";

const blocs = [
  {
    icon: Eye,
    titre: "Notre vision",
    texte: "Faire de Gros-Morne une commune connectée, où chaque habitant, chaque visiteur et chaque membre de la diaspora peut accéder facilement à l'information et aux opportunités locales.",
  },
  {
    icon: Target,
    titre: "Nos objectifs",
    texte: "Centraliser l'information communale, valoriser le patrimoine et le tourisme, faciliter les démarches administratives et renforcer le lien avec la diaspora.",
  },
  {
    icon: Users,
    titre: "L'équipe",
    texte: "Ce portail est porté par la mairie de Gros-Morne, en collaboration avec des membres de la communauté locale et de la diaspora.",
  },
  {
    icon: History,
    titre: "Historique du portail",
    texte: "Smart Gros-Morne est une initiative lancée pour moderniser la présence numérique de la commune et centraliser ses services en ligne.",
  },
];

interface Partenaire {
  id: string;
  nom: string;
}

export default function AProposSection() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);

  useEffect(() => {
    partenairesApi.list("A_PROPOS").then(({ data }) => setPartenaires(data.data.partenaires));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {blocs.map(({ icon: Icon, titre, texte }) => (
            <div key={titre} className="bg-gray-50 rounded-3xl p-8 card-hover">
              <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{texte}</p>
            </div>
          ))}
        </div>

        {/* Aucun partenaire fictif : bloc affiché uniquement si de vrais partenaires publiés
            existent pour cet emplacement (décision du 2026-08-02, cf. plan). */}
        {partenaires.length > 0 && (
          <>
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Partenaires & soutiens</h3>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-gray-300 font-black text-lg">
              {partenaires.map((p, i) => (
                <span key={p.id} className="contents">
                  <span>{p.nom}</span>
                  {i < partenaires.length - 1 && <span>·</span>}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
