import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import GeographieSection from "@/components/GeographieSection";

export const metadata = {
  title: "Géographie — Gros-Morne Vil Mwen",
  description: "Localisation, relief, hydrographie et climat de Gros-Morne, Haïti.",
};

export default function GeographiePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="geographie"
          title="Géographie"
          subtitle="Nichée dans les montagnes de l'Artibonite, Gros-Morne bénéficie d'un environnement naturel exceptionnel. Découvrez sa localisation, son relief et son climat."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Géographie" }]}
          gradient="from-blue-900 via-blue-950 to-black"
          eyebrow="Géographie & Localisation"
          accent="#3b82f6"
        />
        <GeographieSection />
      </main>
      <Footer />
    </>
  );
}
