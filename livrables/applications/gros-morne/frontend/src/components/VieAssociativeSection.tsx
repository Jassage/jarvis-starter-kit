"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { associationsApi } from "@/lib/api";
import FicheCardGrid, { type Fiche } from "@/components/FicheCardGrid";

interface Traduction { locale: "FR" | "HT"; mission: string }
interface Association {
  id: string; nom: string; president: string | null; domainesAction: string[]; traductions: Traduction[];
}

export default function VieAssociativeSection() {
  const [associations, setAssociations] = useState<Association[]>([]);

  useEffect(() => {
    associationsApi.list().then(({ data }) => setAssociations(data.data.associations)).catch(() => setAssociations([]));
  }, []);

  if (associations.length === 0) return null;

  const fiches: Fiche[] = associations.map((a) => {
    const mission = a.traductions.find((t) => t.locale === "FR")?.mission ?? "";
    return {
      icon: Users,
      titre: a.nom,
      sousTitre: a.domainesAction[0],
      description: a.president ? `Président(e) : ${a.president}. ${mission}` : mission,
    };
  });

  return <FicheCardGrid fiches={fiches} accent="green" />;
}
