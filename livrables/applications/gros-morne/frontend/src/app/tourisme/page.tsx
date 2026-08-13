import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import TourismeSection from "@/components/TourismeSection";

export const metadata = {
  title: "Tourisme — Gros-Morne Vil Mwen",
  description: "Les lieux touristiques à visiter à Gros-Morne : mornes, rivières, patrimoine et culture.",
};

export default function TourismePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="tourisme"
          title="Tourisme"
          subtitle="Entre nature sauvage, patrimoine historique et culture vivante, Gros-Morne réserve bien des surprises. Voici les incontournables à visiter."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Tourisme" }]}
          gradient="from-teal-800 to-green-950"
          eyebrow="Lieux à visiter"
          accent="#22c55e"
        />
        <TourismeSection />
      </main>
      <Footer />
    </>
  );
}
