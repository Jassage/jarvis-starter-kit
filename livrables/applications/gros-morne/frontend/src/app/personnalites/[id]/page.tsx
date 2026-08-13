import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import PersonnaliteDetailSection from "@/components/PersonnaliteDetailSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Même correctif que /actualites/[id] : chaque profil partageait le même titre générique,
// remplacé par un vrai titre/description par personnalité (fetch server-side, public).
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/personnalites/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("introuvable");
    const { data } = await res.json();
    const personnalite = data.personnalite;
    const traduction = personnalite.traductions.find((t: { locale: string }) => t.locale === "FR");
    const description = (traduction?.biographie ?? "").slice(0, 200);
    return {
      title: `${personnalite.nom} — Gros-Morne Vil Mwen`,
      description: description || `Portrait de ${personnalite.nom}, personnalité de Gros-Morne.`,
      openGraph: {
        title: personnalite.nom,
        description,
        type: "profile",
        ...(personnalite.photoUrl && { images: [{ url: `${API_ORIGIN}${personnalite.photoUrl}` }] }),
      },
    };
  } catch {
    return {
      title: "Personnalité — Gros-Morne Vil Mwen",
      description: "Portrait d'une personnalité de Gros-Morne.",
    };
  }
}

export default async function PersonnaliteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main>
        <Breadcrumb items={[{ label: "Personnalités", href: "/personnalites" }, { label: "Profil" }]} />
        <PersonnaliteDetailSection id={id} />
      </main>
      <Footer />
    </>
  );
}
