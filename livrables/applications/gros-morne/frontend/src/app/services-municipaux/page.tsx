import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import ServicesMunicipauxSection from "@/components/ServicesMunicipauxSection";

export const metadata = {
  title: "Services Municipaux — Gros-Morne Vil Mwen",
  description: "Mairie, protection civile, police, santé, eau, électricité et justice à Gros-Morne.",
};

export default function ServicesMunicipauxPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="services-municipaux"
          title="Services municipaux"
          subtitle="Découvrez les services mis à votre disposition par la commune de Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Services municipaux" }]}
          gradient="from-green-800 to-green-950"
          eyebrow="Vie communale"
          accent="#22c55e"
        />
        <ServicesMunicipauxSection />
      </main>
      <Footer />
    </>
  );
}
