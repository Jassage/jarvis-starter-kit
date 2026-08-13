import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import DocumentsSection from "@/components/DocumentsSection";

export const metadata = {
  title: "Documents — Gros-Morne Vil Mwen",
  description: "Formulaires administratifs, comptes-rendus et documents officiels de la commune de Gros-Morne.",
};

export default function DocumentsPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="documents"
          title="Documents"
          subtitle="Formulaires, comptes-rendus et documents officiels à télécharger."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Documents" }]}
          gradient="from-slate-800 to-green-950"
          eyebrow="Bibliothèque"
          accent="#22c55e"
        />
        <DocumentsSection />
      </main>
      <Footer />
    </>
  );
}
