import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import HistoireSection from "@/components/HistoireSection";

export const metadata = {
  title: "Histoire — Gros-Morne Vil Mwen",
  description: "L'histoire de Gros-Morne, de la période coloniale à nos jours.",
};

export default function HistoirePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Notre Histoire"
          subtitle="De la période coloniale haïtienne à nos jours, Gros-Morne a forgé une identité unique, marquée par la résistance, la fierté et la richesse culturelle."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Histoire" }]}
          gradient="from-amber-900 via-amber-950 to-black"
          eyebrow="Histoire & Patrimoine"
          accent="#f59e0b"
        />
        <HistoireSection />
      </main>
      <Footer />
    </>
  );
}
