import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import GalerieSection from "@/components/GalerieSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Galerie — Gros-Morne Vil Mwen",
  description: "Photos de Gros-Morne partagées par la communauté.",
};

export default function GaleriePage() {
  return (
    <>
      <Navbar />
      <PageHeader
        title="Galerie"
        subtitle="Gros-Morne en images — photos partagées par la communauté locale et la diaspora."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Galerie" }]}
        gradient="from-purple-900 via-violet-950 to-black"
        eyebrow="Galerie collaborative"
        accent="#a855f7"
      />
      <main>
        <GalerieSection />
      </main>
      <Footer />
    </>
  );
}
