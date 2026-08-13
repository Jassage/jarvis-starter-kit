"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Stethoscope, Pill, Ambulance, type LucideIcon } from "lucide-react";
import { santeApi } from "@/lib/api";
import FicheCardGrid, { type Fiche } from "@/components/FicheCardGrid";

interface Traduction { locale: "FR" | "HT"; description: string }
interface HealthFacility {
  id: string; nom: string; type: string; adresse: string | null; telephone: string | null;
  horaires: string | null; traductions: Traduction[];
}

const TYPE_ICON: Record<string, LucideIcon> = {
  HOPITAL: HeartPulse, CENTRE_SANTE: Stethoscope, PHARMACIE: Pill, CLINIQUE: Ambulance, AUTRE: HeartPulse,
};
const TYPE_LABEL: Record<string, string> = {
  HOPITAL: "Hôpital", CENTRE_SANTE: "Centre de santé", PHARMACIE: "Pharmacie", CLINIQUE: "Clinique privée", AUTRE: "Structure de santé",
};

export default function SanteSection() {
  const [structures, setStructures] = useState<HealthFacility[]>([]);

  useEffect(() => {
    santeApi.list().then(({ data }) => setStructures(data.data.structures)).catch(() => setStructures([]));
  }, []);

  if (structures.length === 0) return null;

  const fiches: Fiche[] = structures.map((s) => ({
    icon: TYPE_ICON[s.type] ?? HeartPulse,
    titre: s.nom,
    sousTitre: TYPE_LABEL[s.type],
    description: s.traductions.find((t) => t.locale === "FR")?.description ?? "",
    adresse: s.adresse ?? undefined,
    telephone: s.telephone ?? undefined,
    horaires: s.horaires ?? undefined,
  }));

  return <FicheCardGrid fiches={fiches} accent="rose" />;
}
