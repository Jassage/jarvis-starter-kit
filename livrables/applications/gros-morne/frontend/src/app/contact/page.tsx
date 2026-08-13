import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicPageHeader from "@/components/DynamicPageHeader";
import ContactSection from "@/components/ContactSection";

export const metadata = {
  title: "Contact — Gros-Morne Vil Mwen",
  description: "Contactez le portail officiel de Gros-Morne : formulaire, téléphone, email, carte.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <DynamicPageHeader page="contact"
          title="Contact"
          subtitle="Une question, une suggestion ? Écrivez-nous, notre équipe vous répond rapidement."
          breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Contact" }]}
          gradient="from-green-800 to-green-950"
          eyebrow="Nous écrire"
          accent="#22c55e"
        />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
