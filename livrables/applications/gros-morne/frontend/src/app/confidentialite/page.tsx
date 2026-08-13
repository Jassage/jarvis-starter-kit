import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import LegalContent from "@/components/LegalContent";

export const metadata = {
  title: "Politique de confidentialité — Gros-Morne Vil Mwen",
};

const blocs = [
  { titre: "Données collectées", texte: "Nous collectons uniquement les données que vous nous transmettez volontairement (formulaire de contact, inscription à la newsletter)." },
  { titre: "Cookies", texte: "Ce site utilise des cookies techniques nécessaires à son bon fonctionnement." },
  { titre: "Conservation", texte: "Les données collectées sont conservées pour la durée nécessaire au traitement de votre demande." },
  { titre: "Sécurité", texte: "Des mesures raisonnables sont mises en œuvre pour protéger vos données contre tout accès non autorisé." },
  { titre: "Droits des utilisateurs", texte: "Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données en nous contactant." },
];

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="confidentialite"
          title="Politique de confidentialité"
          subtitle="Comment nous collectons, utilisons et protégeons vos données personnelles."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Confidentialité" }]}
          gradient="from-gray-800 to-green-950"
          accent="#22c55e"
        />
        <LegalContent blocs={blocs} />
      </main>
      <Footer />
    </>
  );
}
