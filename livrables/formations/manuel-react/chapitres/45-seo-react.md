<div class="chapitre-titre-num">CHAPITRE 45</div>

# SEO en React

## 45.1 Le défi fondamental : le rendu côté client

Rappel du chapitre 3 : une application Vite + React classique génère un `index.html` **quasiment vide** au départ — tout le contenu réel est injecté par JavaScript, **après** le chargement de la page.

```html
<!-- Ce que voit un simple "curl" ou un robot très basique, AVANT exécution du JavaScript -->
<div id="root"></div>
<!-- Le contenu réel (titres, textes, produits...) n'existe pas encore ici -->
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Les moteurs de recherche modernes exécutent-ils le JavaScript ?</span>
Google exécute effectivement le JavaScript de la plupart des pages avant de les indexer (contrairement à une idée reçue datant d'il y a plusieurs années). Mais ce n'est ni instantané, ni garanti pour tous les moteurs (Bing, ou des robots de prévisualisation de réseaux sociaux comme Facebook/WhatsApp, exécutent le JavaScript de façon plus limitée, voire pas du tout). Pour un SEO fiable et un aperçu de partage de lien correct, ne jamais compter uniquement sur l'exécution JavaScript côté robot.
</div>

## 45.2 Les meta tags : essentiels, mais insuffisants seuls en SPA

```jsx
// index.html (statique, chapitre 3) : identique pour TOUTES les pages d'une SPA classique
<head>
  <title>Mon Application</title>
  <meta name="description" content="Description générique de mon application" />
</head>
```

Le problème : dans une SPA classique, ce `<title>` et cette `<meta description>` restent **identiques** pour toutes les routes (`/`, `/produits/42`, `/blog/mon-article`), alors qu'un bon SEO exige un titre et une description **uniques par page**.

## 45.3 react-helmet-async : des meta tags dynamiques par page

```
$ npm install react-helmet-async
```

```jsx
// main.jsx
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
```

```jsx
// pages/DetailProduit.jsx
import { Helmet } from "react-helmet-async";

function DetailProduit({ produit }) {
  return (
    <>
      <Helmet>
        <title>{produit.nom} — Ma Boutique</title>
        <meta name="description" content={produit.description.slice(0, 155)} />
        <meta property="og:title" content={produit.nom} />
        <meta property="og:image" content={produit.imagePrincipale} />
      </Helmet>
      <h1>{produit.nom}</h1>
      {/* ... reste de la page ... */}
    </>
  );
}
```

`<Helmet>` injecte dynamiquement son contenu dans le `<head>` réel du document au moment du rendu de ce composant précis — chaque page définit ainsi ses propres balises, écrasant celles définies par défaut dans `index.html`.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les balises Open Graph (og:) restent invisibles pour les robots qui n'exécutent pas le JavaScript</span>
Le problème du rendu côté client (section 45.1) touche particulièrement les balises `og:title`/`og:image`, utilisées par les aperçus de liens WhatsApp, Facebook, LinkedIn — ces robots de prévisualisation exécutent rarement le JavaScript. Une SPA pure affichera souvent un aperçu de lien vide ou générique lors du partage, quel que soit le soin apporté à `<Helmet>` côté client.
</div>

## 45.4 La vraie solution pour un SEO fiable : le rendu côté serveur (SSR/SSG)

<div class="encadre astuce">
<span class="encadre-titre">💡 Next.js : la solution la plus utilisée dans l'écosystème React pour ce problème</span>
Pour un SEO réellement fiable (contenu visible dans le HTML **avant** toute exécution JavaScript), la solution standard est d'utiliser un framework construit sur React qui effectue le rendu **côté serveur** : **Next.js** est le plus utilisé (déjà mentionné pour EduSpher, dont la migration Vercel a été repoussée sciemment). Deux stratégies principales :
- **SSR (Server-Side Rendering)** : le HTML est généré à chaque requête, côté serveur, avant d'être envoyé au navigateur.
- **SSG (Static Site Generation)** : le HTML est généré **à l'avance**, au moment du build, pour les pages dont le contenu ne change pas à chaque visite (articles de blog, pages produit peu volatiles).
</div>

Ce manuel se concentre sur React seul (Vite), sans couvrir Next.js en détail (sujet d'un manuel à part entière), mais il est important de savoir **quand** cette bascule devient nécessaire :

| Besoin | Vite + React (rendu client) | Next.js (SSR/SSG) |
|---|---|---|
| Application interne, non indexée (ERP, back-office) | Suffisant, plus simple | Overkill |
| Site public devant apparaître dans Google | Insuffisant seul | Nécessaire |
| Aperçu de lien correct sur réseaux sociaux | Insuffisant seul | Nécessaire |
| Simplicité de déploiement (fichiers statiques) | Très simple (chapitre 46) | Nécessite un environnement serveur Node.js |

## 45.5 En attendant une migration SSR : le pré-rendu statique partiel

Pour un besoin ponctuel (une landing page publique dans une application majoritairement privée), une alternative plus légère qu'une migration complète vers Next.js existe : des outils de **pré-rendu** (comme `vite-plugin-ssr` en configuration simplifiée, ou un service tiers de pré-rendu) qui ne génèrent statiquement que les quelques pages publiques nécessaires, en gardant le reste de l'application en SPA classique.

## 45.6 Sitemap et robots.txt : la base, indépendante du rendu

```
<!-- public/robots.txt (chapitre 3 : servi tel quel, sans transformation) -->
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard

Sitemap: https://monsite.com/sitemap.xml
```

```xml
<!-- public/sitemap.xml (généré manuellement, ou dynamiquement côté serveur pour un catalogue produit) -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://monsite.com/</loc></url>
  <url><loc>https://monsite.com/produits</loc></url>
</urlset>
```

Ces deux fichiers restent utiles **indépendamment** de la stratégie de rendu (SPA ou SSR) : ils indiquent aux robots quelles pages explorer/indexer, et lesquelles ignorer (zones privées comme `/admin`, `/dashboard`).

## 45.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Croire qu'une SPA React "ne peut jamais" être indexée par Google</span>
C'est une idée reçue exagérée : Google indexe effectivement de nombreuses SPA React aujourd'hui. Mais le référencement reste souvent plus **lent** à se mettre à jour et moins fiable qu'avec du SSR, et d'autres canaux importants (partage sur réseaux sociaux, Bing) restent nettement moins bien couverts. Pour un site où le SEO est un objectif commercial important, ne pas se reposer uniquement sur cette tolérance de Google.
</div>

## 45.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 45.1</span>

Pour chacun des projets suivants, indique si Vite + React (rendu client) suffit, ou si une migration vers Next.js (SSR/SSG) serait justifiée : (a) BANKA (système bancaire interne), (b) LAKAY (plateforme d'annonces immobilières publique), (c) un tableau de bord d'administration EduSpher.
</div>

**Corrigé :**
(a) **Vite + React suffit** — application interne, non destinée à être indexée par un moteur de recherche.
(b) **Next.js justifié** — chaque annonce immobilière devrait idéalement être indexable individuellement par Google et bien prévisualisable en partage sur réseaux sociaux, un besoin SEO commercial réel.
(c) **Vite + React suffit** — panneau d'administration réservé aux formateurs/admins connectés, jamais destiné à être indexé.

## 45.9 Résumé du chapitre

- Une SPA React classique génère un HTML quasi vide au départ ; tout le contenu réel n'existe qu'après exécution du JavaScript.
- `react-helmet-async` permet des meta tags dynamiques par page, mais reste limité face aux robots qui n'exécutent pas (ou peu) le JavaScript.
- Pour un SEO et des aperçus de partage réellement fiables, Next.js (SSR/SSG) est la solution standard de l'écosystème React.
- `robots.txt`/`sitemap.xml` restent utiles indépendamment de la stratégie de rendu choisie.
- Le SEO n'est un enjeu que pour les pages **publiques** destinées à être trouvées via un moteur de recherche — inutile sur une application interne ou un back-office.

*Chapitre suivant : le déploiement, pour mettre une application React en production sur Vercel ou Netlify.*
