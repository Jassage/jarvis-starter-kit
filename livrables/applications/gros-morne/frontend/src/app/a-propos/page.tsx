import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import AProposSection from "@/components/AProposSection";

export const metadata = {
  title: "À propos — Smart Gros-Morne",
  description: "Vision, objectifs, équipe et historique du portail officiel de Gros-Morne.",
};

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="a-propos"
          title="À propos de Smart Gros-Morne"
          subtitle="Un projet au service de la commune, pour connecter ses habitants et sa diaspora."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "À propos" }]}
          gradient="from-green-800 to-green-950"
          eyebrow="Le projet"
          accent="#22c55e"
        />
        <AProposSection />
      </main>
      <Footer />
    </>
  );
}
