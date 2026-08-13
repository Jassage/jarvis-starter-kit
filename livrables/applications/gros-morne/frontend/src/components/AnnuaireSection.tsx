"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Phone, School, Building2, HeartPulse, Hotel, UtensilsCrossed, Landmark, Users, Grid3x3 } from "lucide-react";
import { annuaireApi, mediaUrl } from "@/lib/api";

const CarteInteractive = dynamic(() => import("./CarteInteractive"), { ssr: false });

const categories = [
  { id: "toutes", label: "Toutes", icon: Grid3x3 },
  { id: "entreprises", label: "Entreprises", icon: Building2 },
  { id: "ecoles", label: "Écoles", icon: School },
  { id: "sante", label: "Santé", icon: HeartPulse },
  { id: "hotels", label: "Hôtels", icon: Hotel },
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { id: "banques", label: "Banques", icon: Landmark },
  { id: "associations", label: "Associations", icon: Users },
];

interface FicheAnnuaire {
  id: string;
  nom: string;
  secteur: string;
  categorieLabel: string;
  adresse: string | null;
  telephone: string | null;
  latitude: number | null;
  longitude: number | null;
  photo: { url: string } | null;
}

export default function AnnuaireSection() {
  const [fiches, setFiches] = useState<FicheAnnuaire[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("toutes");
  const [charge, setCharge] = useState(false);

  // Phase 3 : recherche + filtre secteur réels, poussés côté serveur (`GET /annuaire/toutes`)
  // — plus de chargement intégral des 7 verticaux pour filtrer en mémoire dans le navigateur.
  useEffect(() => {
    const t = setTimeout(() => {
      annuaireApi
        .toutes({ secteur: active, ...(query.trim() && { q: query.trim() }) })
        .then(({ data }) => setFiches(data.data.fiches))
        .catch(() => setFiches([]))
        .finally(() => setCharge(true));
    }, 300);
    return () => clearTimeout(t);
  }, [active, query]);

  const pointsCarte = fiches
    .filter((f): f is FicheAnnuaire & { latitude: number; longitude: number } => f.latitude != null && f.longitude != null)
    .map((f) => ({ id: f.id, nom: f.nom, categorie: f.categorieLabel, latitude: f.latitude, longitude: f.longitude }));

  if (!charge) return null;
  if (fiches.length === 0 && active === "toutes" && !query.trim()) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (entreprise, service...)"
              className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                active === id ? "bg-green-700 text-white" : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Carte interactive */}
        <div className="mb-12">
          <CarteInteractive points={pointsCarte} />
        </div>

        {/* Results */}
        <h2 className="text-xl font-black text-gray-900 mb-6">
          {active === "toutes" ? "Toutes les fiches" : categories.find((c) => c.id === active)?.label} ({fiches.length})
        </h2>
        {fiches.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun résultat pour cette recherche.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {fiches.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden card-hover">
                <div className="h-28 bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center relative">
                  {f.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(f.photo.url)} alt={f.nom} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Landmark className="w-10 h-10 text-white/70" strokeWidth={1} />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-600">{f.categorieLabel}</span>
                  <h3 className="font-bold text-gray-900 text-sm mt-1 mb-3">{f.nom}</h3>
                  {f.adresse && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                      <MapPin className="w-3 h-3" /> {f.adresse}
                    </div>
                  )}
                  {f.telephone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone className="w-3 h-3" /> {f.telephone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
