import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import FaqSection from "@/components/FaqSection";

export const metadata = {
  title: "FAQ — Gros-Morne Vil Mwen",
  description: "Questions fréquentes sur le tourisme, les services, les investissements et le fonctionnement du site.",
};

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="faq"
          title="Questions fréquentes"
          subtitle="Trouvez rapidement des réponses à vos questions sur Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "FAQ" }]}
          gradient="from-green-800 to-green-950"
          eyebrow="Aide"
          accent="#22c55e"
        />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
