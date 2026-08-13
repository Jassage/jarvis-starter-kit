import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import FicheCardGrid from "@/components/FicheCardGrid";
import { Sprout, Beef, Store, Hammer, Factory, Handshake, Building2, ShoppingBasket } from "lucide-react";

export const metadata = {
  title: "Économie — Gros-Morne Vil Mwen",
  description: "Agriculture, élevage, commerce, artisanat et industrie à Gros-Morne.",
};

const secteurs = [
  { icon: Sprout, titre: "Agriculture", sousTitre: "Secteur clé — 45% de l'activité", description: "Café, canne à sucre, mangue francisque et cultures vivrières. Fort potentiel d'exportation encore sous-exploité." },
  { icon: Beef, titre: "Élevage", sousTitre: "Activité traditionnelle", description: "Bovins, caprins et volaille, principalement destinés au marché local et régional." },
  { icon: Store, titre: "Commerce", sousTitre: "560+ entreprises enregistrées", description: "Un tissu commercial actif autour du marché public et du centre-ville." },
  { icon: Hammer, titre: "Artisanat", sousTitre: "Savoir-faire local", description: "Vannerie, sculpture sur bois et broderie, transmis de génération en génération." },
  { icon: Factory, titre: "Industrie", sousTitre: "En développement", description: "Transformation agroalimentaire, en particulier autour de la mangue francisque." },
  { icon: Handshake, titre: "Coopératives", sousTitre: "Économie solidaire", description: "Plusieurs coopératives agricoles et de crédit soutiennent les producteurs locaux." },
  { icon: Building2, titre: "Entreprises locales", sousTitre: "560+ inscrites à l'annuaire", description: "De la petite boutique à l'entreprise de construction, un écosystème économique diversifié." },
  { icon: ShoppingBasket, titre: "Marchés publics", sousTitre: "2 marchés hebdomadaires", description: "Lieux d'échange central pour les produits agricoles et l'artisanat de la région." },
];

export default function EconomiePage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="economie"
          title="Économie"
          subtitle="Les activités économiques qui font vivre Gros-Morne."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Économie" }]}
          gradient="from-amber-800 to-green-950"
          eyebrow="Secteurs d'activité"
          accent="#d97706"
        />
        <FicheCardGrid fiches={secteurs} accent="amber" />
      </main>
      <Footer />
    </>
  );
}
