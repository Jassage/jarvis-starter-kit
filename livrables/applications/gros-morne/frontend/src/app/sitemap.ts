import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api";

const PAGES_STATIQUES = [
  { url: "/", priorite: 1 },
  { url: "/histoire", priorite: 0.8 },
  { url: "/geographie", priorite: 0.7 },
  { url: "/culture", priorite: 0.7 },
  { url: "/personnalites", priorite: 0.7 },
  { url: "/tourisme", priorite: 0.9 },
  { url: "/communaute", priorite: 0.6 },
  { url: "/galerie", priorite: 0.6 },
  { url: "/documents", priorite: 0.5 },
  { url: "/actualites", priorite: 0.8 },
  { url: "/agenda", priorite: 0.7 },
  { url: "/annuaire", priorite: 0.8 },
  { url: "/investir", priorite: 0.6 },
  { url: "/diaspora", priorite: 0.6 },
  { url: "/contact", priorite: 0.5 },
  { url: "/a-propos", priorite: 0.4 },
  { url: "/faq", priorite: 0.4 },
  { url: "/services-municipaux", priorite: 0.6 },
  { url: "/vie-associative", priorite: 0.6 },
  { url: "/education", priorite: 0.6 },
  { url: "/sante", priorite: 0.6 },
  { url: "/economie", priorite: 0.5 },
  { url: "/mentions-legales", priorite: 0.2 },
  { url: "/confidentialite", priorite: 0.2 },
  { url: "/conditions-utilisation", priorite: 0.2 },
] as const;

interface ArticlePublic { id: string; updatedAt?: string }
interface PersonnalitePublic { id: string; updatedAt?: string }

// Best-effort : une panne du backend au moment de la génération du sitemap ne doit jamais
// empêcher les 24 pages statiques d'être indexées — seules les entrées dynamiques manquent
// pour ce cycle, le prochain crawl les rattrapera.
async function recupererSansEchouer<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.articles ?? json?.data?.personnalites ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, personnalites] = await Promise.all([
    recupererSansEchouer<ArticlePublic>(`${API_URL}/actualites`),
    recupererSansEchouer<PersonnalitePublic>(`${API_URL}/personnalites`),
  ]);

  const entreesStatiques: MetadataRoute.Sitemap = PAGES_STATIQUES.map(({ url, priorite }) => ({
    url: `${SITE_URL}${url}`,
    priority: priorite,
    changeFrequency: priorite >= 0.8 ? "weekly" : "monthly",
  }));

  const entreesArticles: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/actualites/${a.id}`,
    lastModified: a.updatedAt,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  const entreesPersonnalites: MetadataRoute.Sitemap = personnalites.map((p) => ({
    url: `${SITE_URL}/personnalites/${p.id}`,
    lastModified: p.updatedAt,
    priority: 0.5,
    changeFrequency: "yearly",
  }));

  return [...entreesStatiques, ...entreesArticles, ...entreesPersonnalites];
}
