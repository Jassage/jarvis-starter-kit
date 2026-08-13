import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import AnnuaireSection from "@/components/AnnuaireSection";

export const metadata = {
  title: "Annuaire — Gros-Morne Vil Mwen",
  description: "Écoles, pharmacies, hôtels, restaurants, entreprises et services de Gros-Morne.",
};

export default function AnnuairePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="annuaire"
          title="Annuaire"
          subtitle="Trouvez facilement les services et entreprises de Gros-Morne, tous secteurs confondus."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Annuaire" }]}
          gradient="from-emerald-800 to-green-950"
          eyebrow="Services & entreprises"
          accent="#22c55e"
        />
        <AnnuaireSection />
      </main>
      <Footer />
    </>
  );
}
