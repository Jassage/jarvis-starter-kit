import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import EducationSection from "@/components/EducationSection";

export const metadata = {
  title: "Éducation — Gros-Morne Vil Mwen",
  description: "Écoles, universités, centres de formation et bibliothèques de Gros-Morne.",
};

export default function EducationPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="education"
          title="Éducation"
          subtitle="Écoles, universités, centres de formation et bibliothèques de la commune."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Éducation" }]}
          gradient="from-blue-800 to-green-950"
          eyebrow="Établissements"
          accent="#3b82f6"
        />
        <EducationSection />
      </main>
      <Footer />
    </>
  );
}
