"use client";

import { Handshake, ExternalLink } from "lucide-react";

const sponsors = [
  { nom: "Francisque FM 98.9", type: "Médias", emoji: "📻", since: "Partenaire média" },
  { nom: "Mairie de Gros-Morne", type: "Institutionnel", emoji: "🏛️", since: "Partenaire officiel" },
  { nom: "Votre commerce ici", type: "Partenaire", emoji: "🏪", since: "Devenez sponsor" },
  { nom: "Votre ONG ici", type: "ONG & Diaspora", emoji: "🌍", since: "Rejoignez-nous" },
  { nom: "Votre école ici", type: "Éducation", emoji: "🎓", since: "Partenaire académique" },
  { nom: "Votre marque ici", type: "Entreprise", emoji: "⭐", since: "Sponsorisez" },
];

export default function SponsorsSection() {
  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-black text-gray-900">Partenaires & Sponsors</h2>
            </div>
            <p className="text-sm text-gray-500">
              Ils soutiennent le développement numérique de Gros-Morne
            </p>
          </div>
          <a
            href="/communaute"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-green-600 text-green-700 font-bold text-sm hover:bg-green-600 hover:text-white transition-all duration-200"
          >
            Devenir partenaire
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map(({ nom, type, emoji, since }) => (
            <div
              key={nom}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="font-bold text-gray-800 text-sm leading-tight mb-1 group-hover:text-green-700 transition-colors">
                {nom}
              </div>
              <div className="text-xs text-gray-400">{type}</div>
              <div className="mt-2 text-xs font-medium text-green-600">{since}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
