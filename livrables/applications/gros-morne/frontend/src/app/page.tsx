import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DecouvrirSection from "@/components/DecouvrirSection";
import StatsBarSection from "@/components/StatsBarSection";
import LieuxIncontournablesSection from "@/components/LieuxIncontournablesSection";
import ActualitesAgendaSection from "@/components/ActualitesAgendaSection";
import InvestirBanner from "@/components/InvestirBanner";
import SponsorsSection from "@/components/SponsorsSection";
import TemoignagesSection from "@/components/TemoignagesSection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { SITE_URL, COMMUNE_GEO } from "@/lib/seo";

export const metadata = {
  title: "Gros-Morne — Vil Mwen | Histoire, Tourisme & Communauté",
  description:
    "Découvrez Gros-Morne, ville du département de l'Artibonite en Haïti. Histoire, géographie, tourisme, culture et communauté.",
};

// Données structurées (schema.org) : décrit la commune elle-même, pas une entreprise privée
// — GovernmentOrganization est le type le plus proche du site officiel d'une mairie. Valeurs
// factuelles déjà publiées ailleurs sur le site (coordonnées GPS des en-têtes de page,
// adresse déjà utilisée par défaut dans Footer/Contact), rien d'inventé pour l'occasion.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Mairie de Gros-Morne",
  url: SITE_URL,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Gros-Morne, Artibonite, Haïti",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gros-Morne",
    addressRegion: "Artibonite",
    addressCountry: "HT",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: COMMUNE_GEO.latitude,
    longitude: COMMUNE_GEO.longitude,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <DecouvrirSection />
        <StatsBarSection />
        <LieuxIncontournablesSection />
        <ActualitesAgendaSection />
        <InvestirBanner />
        <SponsorsSection />
        <TemoignagesSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
