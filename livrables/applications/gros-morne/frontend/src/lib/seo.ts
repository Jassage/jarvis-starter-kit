// URL publique du site — aucun domaine réel n'est encore configuré (site jamais déployé au
// moment de l'écriture, cf. context/HISTORY.md), le repli localhost est explicite plutôt que
// d'inventer un nom de domaine. Jaslin doit définir NEXT_PUBLIC_SITE_URL une fois le vrai
// domaine connu (variable d'environnement de production, jamais un domaine deviné).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010";

// Coordonnées réelles de Gros-Morne, déjà affichées telles quelles dans les en-têtes de page
// (DynamicPageHeader/GeographieSection : "19°40′N · 72°41′O") — conversion DMS → décimal pour
// les données structurées, aucune nouvelle valeur inventée.
export const COMMUNE_GEO = { latitude: 19.667, longitude: -72.683 };
