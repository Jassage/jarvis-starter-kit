import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import ActualitesSection from "@/components/ActualitesSection";

export const metadata = {
  title: "Actualités — Gros-Morne Vil Mwen",
  description: "Les dernières nouvelles de Gros-Morne : événements, projets, culture.",
};

export default function ActualitesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Actualités"
          subtitle="Restez connecté aux dernières nouvelles de Gros-Morne. Événements, projets de développement, culture et communauté."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Actualités" }]}
          gradient="from-sky-900 via-slate-950 to-black"
          eyebrow="Actualités locales"
          accent="#0ea5e9"
        />
        <ActualitesSection />
      </main>
      <Footer />
    </>
  );
}
