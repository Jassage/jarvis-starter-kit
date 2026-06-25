import Navbar from "@/components/Navbar";
import TickerBanner from "@/components/TickerBanner";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import FeaturedSection from "@/components/FeaturedSection";
import HomeOverview from "@/components/HomeOverview";
import GalleryPreview from "@/components/GalleryPreview";
import SectionsCommunes from "@/components/SectionsCommunes";
import DonationSection from "@/components/DonationSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Gros-Morne — Vil Mwen | Histoire, Tourisme & Communauté",
  description:
    "Découvrez Gros-Morne, ville du département de l'Artibonite en Haïti. Histoire, géographie, tourisme, culture et communauté.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <TickerBanner />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturedSection />
        <HomeOverview />
        <GalleryPreview />
        <SectionsCommunes />
        <DonationSection />
        <SponsorsSection />
      </main>
      <Footer />
    </>
  );
}
