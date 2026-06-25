import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import CultureSection from "@/components/CultureSection";

export const metadata = {
  title: "Culture — Gros-Morne Vil Mwen",
  description: "Musique, gastronomie, traditions et artisanat : la culture vivante de Gros-Morne.",
};

export default function CulturePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Culture & Traditions"
          subtitle="La culture de Gros-Morne est un mélange riche d'influences africaines, françaises et indigènes. Elle s'exprime dans la musique, la gastronomie, les fêtes et l'artisanat."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Culture" }]}
          gradient="from-purple-900 via-purple-950 to-black"
          eyebrow="Culture & Traditions"
          accent="#a855f7"
        />
        <CultureSection />
      </main>
      <Footer />
    </>
  );
}
