import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import CommunauteSection from "@/components/CommunauteSection";

export const metadata = {
  title: "Communauté — Gros-Morne Vil Mwen",
  description: "Rejoignez la communauté en ligne de Gros-Morne.",
};

export default function CommunautePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Rejoindre la Communauté"
          subtitle="Que vous viviez à Gros-Morne ou dans la diaspora, créez votre compte gratuitement et participez à la vie de votre ville."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Communauté" }]}
          gradient="from-green-900 via-green-950 to-black"
          eyebrow="Espace communautaire"
          accent="#22c55e"
        />
        <CommunauteSection />
      </main>
      <Footer />
    </>
  );
}
