import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import InvestirSection from "@/components/InvestirSection";

export const metadata = {
  title: "Investir — Gros-Morne Vil Mwen",
  description: "Opportunités d'investissement à Gros-Morne : agriculture, immobilier, tourisme, commerce, industrie.",
};

export default function InvestirPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="investir"
          title="Investir à Gros-Morne"
          subtitle="Des opportunités uniques et un accompagnement dédié pour tout investisseur souhaitant s'implanter durablement."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Investir" }]}
          gradient="from-amber-800 to-green-950"
          eyebrow="Opportunités"
          accent="#d97706"
        />
        <InvestirSection />
      </main>
      <Footer />
    </>
  );
}
