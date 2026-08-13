import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import SanteSection from "@/components/SanteSection";

export const metadata = {
  title: "Santé — Gros-Morne Vil Mwen",
  description: "Hôpitaux, centres de santé, pharmacies et médecins de Gros-Morne.",
};

export default function SantePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="sante"
          title="Santé"
          subtitle="Les structures de santé disponibles pour les habitants de Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Santé" }]}
          gradient="from-rose-800 to-green-950"
          eyebrow="Établissements de santé"
          accent="#e11d48"
        />
        <SanteSection />
      </main>
      <Footer />
    </>
  );
}
