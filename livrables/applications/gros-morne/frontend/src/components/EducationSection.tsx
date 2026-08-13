"use client";

import { useEffect, useState } from "react";
import { School, GraduationCap, BookOpen, Library, type LucideIcon } from "lucide-react";
import { ecolesApi } from "@/lib/api";
import FicheCardGrid, { type Fiche } from "@/components/FicheCardGrid";

interface Traduction { locale: "FR" | "HT"; description: string }
interface Ecole {
  id: string; nom: string; type: string; directeur: string | null;
  adresse: string | null; telephone: string | null; traductions: Traduction[];
}

const TYPE_ICON: Record<string, LucideIcon> = {
  LYCEE: School, COLLEGE: School, UNIVERSITE: GraduationCap, CENTRE_FORMATION: BookOpen, BIBLIOTHEQUE: Library, AUTRE: School,
};
const TYPE_LABEL: Record<string, string> = {
  LYCEE: "École secondaire", COLLEGE: "Collège", UNIVERSITE: "Enseignement supérieur",
  CENTRE_FORMATION: "Formation", BIBLIOTHEQUE: "Bibliothèque", AUTRE: "Établissement",
};

export default function EducationSection() {
  const [ecoles, setEcoles] = useState<Ecole[]>([]);

  useEffect(() => {
    ecolesApi.list().then(({ data }) => setEcoles(data.data.ecoles)).catch(() => setEcoles([]));
  }, []);

  if (ecoles.length === 0) return null;

  const fiches: Fiche[] = ecoles.map((e) => {
    const description = e.traductions.find((t) => t.locale === "FR")?.description ?? "";
    return {
      icon: TYPE_ICON[e.type] ?? School,
      titre: e.nom,
      sousTitre: TYPE_LABEL[e.type],
      description: e.directeur ? `Directeur : ${e.directeur}. ${description}` : description,
      adresse: e.adresse ?? undefined,
      telephone: e.telephone ?? undefined,
    };
  });

  return <FicheCardGrid fiches={fiches} accent="sky" />;
}
