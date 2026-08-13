import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import PersonnalitesSection from "@/components/PersonnalitesSection";

export const metadata = {
  title: "Personnalités — Gros-Morne Vil Mwen",
  description: "Les fils et filles de Gros-Morne qui ont marqué leur époque.",
};

export default function PersonnalitesPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="personnalites"
          title="Personnalités"
          subtitle="Des hommes et des femmes de Gros-Morne qui ont marqué leur époque et porté fièrement le nom de leur ville au-delà des frontières."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Personnalités" }]}
          gradient="from-slate-800 via-slate-950 to-black"
          eyebrow="Fils & Filles de Gros-Morne"
          accent="#f43f5e"
        />
        <PersonnalitesSection />
      </main>
      <Footer />
    </>
  );
}
