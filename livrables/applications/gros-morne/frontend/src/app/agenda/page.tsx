import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import AgendaSection from "@/components/AgendaSection";

export const metadata = {
  title: "Agenda — Gros-Morne Vil Mwen",
  description: "Festivals, réunions, matchs, formations et conférences à Gros-Morne.",
};

export default function AgendaPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="agenda"
          title="Agenda"
          subtitle="Découvrez les événements à venir dans la commune de Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Agenda" }]}
          gradient="from-teal-800 to-green-950"
          eyebrow="Calendrier communal"
          accent="#22c55e"
        />
        <AgendaSection />
      </main>
      <Footer />
    </>
  );
}
