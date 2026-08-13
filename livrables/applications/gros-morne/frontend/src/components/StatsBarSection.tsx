"use client";

import { useEffect, useState } from "react";
import { Users, LayoutGrid, School, Building2, MapPinned, Landmark } from "lucide-react";
import { sectionsCommunalesApi, ecolesApi, entreprisesApi, tourismeApi } from "@/lib/api";

interface Compteurs {
  sections: number | null;
  ecoles: number | null;
  entreprises: number | null;
  sites: number | null;
}

export default function StatsBarSection() {
  const [c, setC] = useState<Compteurs>({ sections: null, ecoles: null, entreprises: null, sites: null });

  useEffect(() => {
    Promise.all([
      sectionsCommunalesApi.list().then(({ data }) => data.data.sections?.length ?? null).catch(() => null),
      ecolesApi.list().then(({ data }) => data.data.ecoles?.length ?? null).catch(() => null),
      entreprisesApi.list().then(({ data }) => data.data.entreprises?.length ?? null).catch(() => null),
      tourismeApi.list().then(({ data }) => data.data.lieux?.length ?? null).catch(() => null),
    ]).then(([sections, ecoles, entreprises, sites]) => setC({ sections, ecoles, entreprises, sites }));
  }, []);

  const stats = [
    { icon: Users, val: "155 692", label: "Population" },
    { icon: LayoutGrid, val: c.sections !== null ? String(c.sections) : "—", label: "Sections communales" },
    { icon: School, val: c.ecoles !== null ? String(c.ecoles) : "—", label: "Écoles" },
    { icon: Building2, val: c.entreprises !== null ? `${c.entreprises}+` : "—", label: "Entreprises" },
    { icon: MapPinned, val: c.sites !== null ? String(c.sites) : "—", label: "Sites touristiques" },
    { icon: Landmark, val: "397 km²", label: "Superficie" },
  ];

  return (
    <section className="py-14 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-center text-2xl font-black text-gray-900 mb-10">
          Gros-Morne <span className="text-green-700">en chiffres</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(({ icon: Icon, val, label }) => (
            <div key={label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-xl font-black text-gray-900">{val}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
