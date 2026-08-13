import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import DiasporaSection from "@/components/DiasporaSection";

export const metadata = {
  title: "Diaspora — Gros-Morne Vil Mwen",
  description: "Actualités, investissements, associations et projets communautaires pour la diaspora de Gros-Morne.",
};

export default function DiasporaPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="diaspora"
          title="Diaspora"
          subtitle="Un lien permanent entre Gros-Morne et ses fils et filles établis à l'étranger."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Diaspora" }]}
          gradient="from-sky-800 to-green-950"
          eyebrow="Vil Mwen, partout dans le monde"
          accent="#0ea5e9"
        />
        <DiasporaSection />
      </main>
      <Footer />
    </>
  );
}
