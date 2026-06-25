import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
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
        <PageHeader
          title="Tourisme"
          subtitle="Entre nature sauvage, patrimoine historique et culture vivante, Gros-Morne réserve bien des surprises. Voici les incontournables à visiter."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Tourisme" }]}
          gradient="from-teal-800 to-green-950"
          bgImage="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Haiti_Saut-d%27Eau.JPG/1200px-Haiti_Saut-d%27Eau.JPG"
          eyebrow="Lieux à visiter"
          accent="#22c55e"
        />
        <TourismeSection />
      </main>
      <Footer />
    </>
  );
}
