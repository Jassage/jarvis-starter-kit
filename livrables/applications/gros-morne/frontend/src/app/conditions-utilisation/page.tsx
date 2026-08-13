import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import LegalContent from "@/components/LegalContent";

export const metadata = {
  title: "Conditions d'utilisation — Gros-Morne Vil Mwen",
};

const blocs = [
  { titre: "Règles d'utilisation", texte: "L'utilisation de ce site implique l'acceptation pleine et entière des présentes conditions." },
  { titre: "Responsabilités", texte: "L'utilisateur s'engage à ne pas utiliser le site à des fins illégales ou contraires à l'ordre public." },
  { titre: "Propriété intellectuelle", texte: "Les marques, logos et contenus présents sur le site sont la propriété de la Mairie de Gros-Morne ou de leurs auteurs respectifs." },
  { titre: "Modifications", texte: "Ces conditions peuvent être modifiées à tout moment ; la version en vigueur est celle publiée sur cette page." },
  { titre: "Contact", texte: "Pour toute question relative à ces conditions, contactez-nous via la page Contact." },
];

export default function ConditionsUtilisationPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="conditions-utilisation"
          title="Conditions d'utilisation"
          subtitle="Les règles applicables à l'utilisation du portail Smart Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Conditions d'utilisation" }]}
          gradient="from-gray-800 to-green-950"
          accent="#22c55e"
        />
        <LegalContent blocs={blocs} />
      </main>
      <Footer />
    </>
  );
}
