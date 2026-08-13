import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleDetailSection from "@/components/ArticleDetailSection";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api";
// Les médias sont servis par le backend, une origine distincte du frontend (cf. lib/api.ts
// `mediaUrl()`) — une image Open Graph doit être une URL absolue vers cette origine, jamais
// résolue contre `metadataBase` (qui pointe le frontend).
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Chaque article partageait jusqu'ici exactement le même titre/description générique
// ("Actualité — Gros-Morne Vil Mwen") — un lien partagé vers n'importe quel article était
// donc indiscernable d'un autre sur les réseaux sociaux. `generateMetadata` fait le fetch
// server-side (pas d'auth requise, endpoint public) pour produire un vrai titre/description
// par article, avec repli générique si l'article est introuvable ou en cas de panne API.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/actualites/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("introuvable");
    const { data } = await res.json();
    const article = data.article;
    const resume = article.traductions.find((t: { locale: string }) => t.locale === "FR")?.resume ?? "";
    return {
      title: `${article.titre} — Gros-Morne Vil Mwen`,
      description: resume.slice(0, 200),
      openGraph: {
        title: article.titre,
        description: resume.slice(0, 200),
        type: "article",
        ...(article.imagePrincipale && { images: [{ url: `${API_ORIGIN}${article.imagePrincipale.url}` }] }),
      },
    };
  } catch {
    return {
      title: "Actualité — Gros-Morne Vil Mwen",
      description: "Une actualité de la commune de Gros-Morne.",
    };
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main>
        <Breadcrumb items={[{ label: "Actualités", href: "/actualites" }, { label: "Article" }]} />
        <ArticleDetailSection id={id} />
      </main>
      <Footer />
    </>
  );
}
