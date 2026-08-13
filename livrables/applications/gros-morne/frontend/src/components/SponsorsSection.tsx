"use client";

import { useEffect, useState } from "react";
import { Handshake, ExternalLink } from "lucide-react";
import { partenairesApi, mediaUrl } from "@/lib/api";

// Emplacements génériques d'invitation, toujours affichés à la suite des vrais partenaires
// (c'était déjà le principe du contenu hérité : 2 partenaires réels + 4 invitations "Votre
// commerce ici" côte à côte) — jamais remplacés par du contenu fabriqué, cf. décision du
// 2026-08-02 sur les logos d'institutions non vérifiées.
const PLACEHOLDERS = [
  { nom: "Votre commerce ici", type: "Partenaire", emoji: "🏪" },
  { nom: "Votre ONG ici", type: "ONG & Diaspora", emoji: "🌍" },
  { nom: "Votre école ici", type: "Éducation", emoji: "🎓" },
  { nom: "Votre marque ici", type: "Entreprise", emoji: "⭐" },
];

const LABELS_CATEGORIE: Record<string, string> = {
  INSTITUTIONNEL: "Institutionnel",
  ENTREPRISE: "Entreprise",
  SPONSOR: "Sponsor",
  ONG: "ONG & Diaspora",
  MECENE: "Mécène",
  MEDIA: "Médias",
};

interface Partenaire {
  id: string;
  nom: string;
  categorie: string;
  lienSiteWeb: string | null;
  logo: { url: string } | null;
}

export default function SponsorsSection() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partenairesApi
      .list("ACCUEIL")
      .then(({ data }) => setPartenaires(data.data.partenaires))
      .finally(() => setLoading(false));
  }, []);

  interface Carte {
    key: string;
    nom: string;
    type: string;
    emoji?: string;
    logoUrl?: string;
    lien?: string;
  }

  const cartes: Carte[] = [
    ...partenaires.map((p) => ({
      key: p.id,
      nom: p.nom,
      type: LABELS_CATEGORIE[p.categorie] ?? p.categorie,
      logoUrl: p.logo ? mediaUrl(p.logo.url) : undefined,
      lien: p.lienSiteWeb ?? undefined,
    })),
    ...PLACEHOLDERS.map((p) => ({ key: p.nom, nom: p.nom, type: p.type, emoji: p.emoji })),
  ];

  return (
    <section className="py-14 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Handshake className="w-4 h-4 text-green-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">Nos partenaires & sponsors</h2>
            </div>
          </div>
          <a
            href="/contact"
            className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-green-600 text-green-700 font-bold text-xs hover:bg-green-600 hover:text-white transition-all duration-200 shrink-0"
          >
            Devenir partenaire
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cartes.map((c) => {
            const contenu = (
              <>
                <div className="w-9 h-9 mx-auto mb-1.5 flex items-center justify-center">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt={c.nom} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl">{c.emoji || "🤝"}</span>
                  )}
                </div>
                <div className="font-bold text-gray-700 text-xs leading-tight group-hover:text-green-700 transition-colors">
                  {c.nom}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{c.type}</div>
              </>
            );
            const classes = "bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-md transition-all duration-200 group grayscale hover:grayscale-0";
            return c.lien ? (
              <a key={c.key} href={c.lien} target="_blank" rel="noopener noreferrer" className={`${classes} cursor-pointer`}>
                {contenu}
              </a>
            ) : (
              <div key={c.key} className={classes}>{contenu}</div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
