"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Search } from "lucide-react";
import { agendaApi, mediaUrl } from "@/lib/api";

interface Traduction {
  locale: "FR" | "HT";
  description: string;
}

interface Media { url: string }
interface Evenement {
  id: string;
  nom: string;
  categorie: string;
  date: string;
  heureAffichage: string | null;
  lieu: string;
  imagePrincipale: Media | null;
  traductions: Traduction[];
}

const CATEGORIE_LABEL: Record<string, string> = {
  FESTIVAL: "Festival", CARNAVAL: "Carnaval", REUNION: "Réunion", MATCH: "Match", FORMATION: "Formation",
  CONFERENCE: "Conférence", CULTUREL: "Culturel", SPORT: "Sport", ECONOMIE: "Économie", FETE: "Fête", AUTRE: "Autre",
};

const MOIS_ABREGE = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AgendaSection() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [q, setQ] = useState("");
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      agendaApi
        .list(q.trim() ? { q: q.trim() } : undefined)
        .then(({ data }) => setEvenements(data.data.evenements))
        .catch(() => setEvenements([]))
        .finally(() => setCharge(true));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  if (!charge) return null;
  if (evenements.length === 0 && !q.trim()) return null;

  const aujourdhui = new Date();
  const anneeCourante = aujourdhui.getFullYear();
  const moisCourant = aujourdhui.getMonth();
  const nomMois = aujourdhui.toLocaleDateString("fr-FR", { month: "long" });
  const premierJourSemaine = (new Date(anneeCourante, moisCourant, 1).getDay() + 6) % 7; // lundi = 0
  const joursDansLeMois = new Date(anneeCourante, moisCourant + 1, 0).getDate();
  const joursNumeros = [...Array(premierJourSemaine).fill(null), ...Array.from({ length: joursDansLeMois }, (_, i) => i + 1)];
  // Dates stockées en UTC minuit : méthodes getUTC* pour éviter le décalage d'un jour
  // qu'introduirait un fuseau local négatif avec getDate()/getMonth().
  const joursMarques = evenements
    .map((e) => new Date(e.date))
    .filter((d) => d.getUTCFullYear() === anneeCourante && d.getUTCMonth() === moisCourant)
    .map((d) => d.getUTCDate());

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative max-w-md mb-8">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un événement (nom, lieu)..."
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Mini calendar */}
          <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-green-700" />
              <h3 className="font-black text-gray-900 capitalize">{nomMois} {anneeCourante}</h3>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {JOURS_SEMAINE.map((d) => (
                <span key={d} className="text-[10px] font-bold text-gray-400 pb-2">{d}</span>
              ))}
              {joursNumeros.map((j, i) => (
                <div
                  key={i}
                  className={`h-9 flex items-center justify-center rounded-xl text-xs font-semibold ${
                    j && joursMarques.includes(j)
                      ? "bg-green-700 text-white"
                      : j
                      ? "text-gray-600 hover:bg-gray-100"
                      : ""
                  }`}
                >
                  {j || ""}
                </div>
              ))}
            </div>
          </div>

          {/* Event list */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Événements à venir</h2>
            {evenements.length === 0 && (
              <p className="text-gray-400 text-sm">Aucun événement ne correspond à cette recherche.</p>
            )}
            <div className="flex flex-col gap-4">
              {evenements.map((e) => {
                const d = new Date(e.date);
                return (
                  <div key={e.id} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-green-100 transition-all">
                    <div className="relative shrink-0">
                      {e.imagePrincipale && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(e.imagePrincipale.url)} alt={e.nom} className="w-14 h-14 rounded-xl object-cover" />
                      )}
                      <div
                        className={`w-14 h-14 rounded-xl bg-green-700 text-white flex flex-col items-center justify-center ${
                          e.imagePrincipale ? "absolute -bottom-2 -right-2 w-9 h-9 shadow-md border-2 border-white" : ""
                        }`}
                      >
                        <span className={`font-black leading-none ${e.imagePrincipale ? "text-xs" : "text-lg"}`}>{String(d.getUTCDate()).padStart(2, "0")}</span>
                        <span className={`uppercase tracking-wider ${e.imagePrincipale ? "text-[7px]" : "text-[10px]"}`}>{MOIS_ABREGE[d.getUTCMonth()]}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-green-600">{CATEGORIE_LABEL[e.categorie]}</span>
                      <h3 className="font-bold text-gray-900 text-sm mt-0.5 mb-2">{e.nom}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.lieu}</span>
                        {e.heureAffichage && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {e.heureAffichage}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
