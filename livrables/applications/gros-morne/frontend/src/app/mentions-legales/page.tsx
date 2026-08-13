import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import LegalContent from "@/components/LegalContent";

export const metadata = {
  title: "Mentions légales — Gros-Morne Vil Mwen",
};

const blocs = [
  { titre: "Éditeur du site", texte: "Ce portail est édité par la Mairie de Gros-Morne, Département de l'Artibonite, Haïti." },
  { titre: "Hébergement", texte: "Le site est hébergé par un prestataire tiers spécialisé dans l'hébergement web." },
  { titre: "Droits d'auteur", texte: "L'ensemble des contenus (textes, images, vidéos) publiés sur ce site est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite." },
  { titre: "Responsabilités", texte: "La Mairie de Gros-Morne s'efforce d'assurer l'exactitude des informations publiées, sans garantir l'absence totale d'erreurs ou d'omissions." },
];

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="mentions-legales"
          title="Mentions légales"
          subtitle="Informations légales relatives à l'édition et à l'hébergement du portail."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]}
          gradient="from-gray-800 to-green-950"
          accent="#22c55e"
        />
        <LegalContent blocs={blocs} />
      </main>
      <Footer />
    </>
  );
}
