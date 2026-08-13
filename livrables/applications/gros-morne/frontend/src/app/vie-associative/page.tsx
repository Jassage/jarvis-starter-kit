import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import VieAssociativeSection from "@/components/VieAssociativeSection";

export const metadata = {
  title: "Vie associative — Gros-Morne Vil Mwen",
  description: "Les associations qui font vivre la commune de Gros-Morne.",
};

export default function VieAssociativePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="vie-associative"
          title="Vie associative"
          subtitle="Les associations locales qui animent et soutiennent la communauté de Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Vie associative" }]}
          gradient="from-purple-800 to-green-950"
          eyebrow="Engagement citoyen"
          accent="#a855f7"
        />
        <VieAssociativeSection />
      </main>
      <Footer />
    </>
  );
}
