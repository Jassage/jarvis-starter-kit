"use client";

import { useEffect, useState } from "react";
import { Landmark, ShieldAlert, Siren, HeartPulse, Droplet, Zap, Scale, type LucideIcon } from "lucide-react";
import { servicesMunicipauxApi } from "@/lib/api";
import FicheCardGrid, { type Fiche } from "@/components/FicheCardGrid";

interface Traduction { locale: "FR" | "HT"; presentation: string }
interface MunicipalService {
  id: string; nom: string; type: string; adresse: string | null; telephone: string | null;
  horaires: string | null; traductions: Traduction[];
}

const TYPE_ICON: Record<string, LucideIcon> = {
  MAIRIE: Landmark, PROTECTION_CIVILE: ShieldAlert, POLICE: Siren, SANTE: HeartPulse,
  EAU: Droplet, ELECTRICITE: Zap, JUSTICE: Scale, AUTRE: Landmark,
};
const TYPE_LABEL: Record<string, string> = {
  MAIRIE: "Administration", PROTECTION_CIVILE: "Sécurité", POLICE: "Sécurité", SANTE: "Santé",
  EAU: "Infrastructure", ELECTRICITE: "Infrastructure", JUSTICE: "Justice", AUTRE: "Service",
};

export default function ServicesMunicipauxSection() {
  const [services, setServices] = useState<MunicipalService[]>([]);

  useEffect(() => {
    servicesMunicipauxApi.list().then(({ data }) => setServices(data.data.services)).catch(() => setServices([]));
  }, []);

  if (services.length === 0) return null;

  const fiches: Fiche[] = services.map((s) => ({
    icon: TYPE_ICON[s.type] ?? Landmark,
    titre: s.nom,
    sousTitre: TYPE_LABEL[s.type],
    description: s.traductions.find((t) => t.locale === "FR")?.presentation ?? "",
    adresse: s.adresse ?? undefined,
    telephone: s.telephone ?? undefined,
    horaires: s.horaires ?? undefined,
  }));

  return <FicheCardGrid fiches={fiches} />;
}
