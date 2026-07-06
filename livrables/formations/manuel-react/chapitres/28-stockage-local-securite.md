<div class="chapitre-titre-num">CHAPITRE 28</div>

# Stockage local et sécurité

## 28.1 LocalStorage vs SessionStorage vs Cookies

| | localStorage | sessionStorage | Cookie |
|---|---|---|---|
| Persistance | Jusqu'à suppression manuelle | Effacé à la fermeture de l'onglet | Selon la date d'expiration définie |
| Accessible en JavaScript | Oui | Oui | Oui, sauf si `httpOnly` |
| Envoyé automatiquement au serveur | Non | Non | Oui, à chaque requête vers le domaine concerné |
| Taille limite | ~5-10 Mo | ~5-10 Mo | ~4 Ko |
| Cas d'usage typique | Préférences UI (thème, langue), cache de données non sensibles | Données temporaires d'une session d'onglet (étape d'un formulaire multi-pages) | Authentification (refresh token, chapitre 26), session serveur |

## 28.2 API de base

```jsx
// localStorage
localStorage.setItem("theme", "sombre");
const theme = localStorage.getItem("theme"); // "sombre"
localStorage.removeItem("theme");
localStorage.clear(); // efface TOUT le localStorage du domaine

// sessionStorage : API strictement identique, juste une durée de vie différente
sessionStorage.setItem("etapeFormulaire", "2");
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ localStorage ne stocke que des chaînes</span>
```jsx
// ❌ [object Object] est stocké littéralement comme texte, pas l'objet lui-même
localStorage.setItem("utilisateur", { nom: "Jaslin" });

// ✅ Toujours sérialiser/désérialiser explicitement
localStorage.setItem("utilisateur", JSON.stringify({ nom: "Jaslin" }));
const utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
```
</div>

## 28.3 Ce qu'il ne faut JAMAIS stocker en localStorage/sessionStorage

<div class="encadre attention">
<span class="encadre-titre">⚠️ Liste noire à connaître par cœur</span>
- Un **token d'authentification longue durée** (refresh token) — voir chapitre 26, préférer un cookie httpOnly.
- Un **mot de passe**, même temporairement.
- Un **numéro de carte bancaire** ou toute donnée financière sensible.
- Toute donnée dont la fuite (via une faille XSS) aurait un impact grave pour l'utilisateur.

**Pourquoi :** localStorage et sessionStorage sont accessibles par **n'importe quel** script JavaScript exécuté sur la page, y compris un script malveillant injecté via une dépendance compromise ou une faille XSS. Un cookie `httpOnly`, à l'inverse, n'est **jamais** accessible via `document.cookie` ni via aucune API JavaScript — seul le navigateur peut le lire pour l'envoyer au serveur.
</div>

## 28.4 Ce qui est acceptable à y stocker

```jsx
// Préférences d'affichage, non sensibles
localStorage.setItem("theme", "sombre");
localStorage.setItem("langue", "fr");

// Cache de données publiques, pour améliorer la vitesse perçue au chargement suivant
localStorage.setItem("dernieresCategoriesConsultees", JSON.stringify(["electronique", "mode"]));

// État d'un formulaire multi-étapes NON sensible, pour survivre à un rechargement accidentel
sessionStorage.setItem("brouillonAnnonce", JSON.stringify({ titre: "...", description: "..." }));
```

## 28.5 Se protéger contre le XSS en amont

Puisque le vrai risque de localStorage vient du XSS (Cross-Site Scripting), la meilleure défense reste d'**empêcher l'injection de scripts malveillants** en premier lieu :

- React **échappe automatiquement** tout contenu inséré via `{variable}` dans le JSX — c'est l'une des raisons pour lesquelles React est intrinsèquement plus sûr que manipuler le DOM à la main.

```jsx
// ✅ Sûr par défaut : React échappe automatiquement le contenu, même si commentaireUtilisateur contient du HTML/script
function Commentaire({ commentaireUtilisateur }) {
  return <p>{commentaireUtilisateur}</p>;
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ dangerouslySetInnerHTML porte bien son nom</span>
```jsx
// ❌ DANGEREUX si commentaireUtilisateur vient d'une source non fiable (saisie utilisateur)
function Commentaire({ commentaireUtilisateur }) {
  return <p dangerouslySetInnerHTML={{ __html: commentaireUtilisateur }} />;
}
```
`dangerouslySetInnerHTML` désactive volontairement l'échappement automatique de React et insère du HTML brut — exactement la porte d'entrée d'une attaque XSS si le contenu vient, même indirectement, d'un utilisateur. À n'utiliser que pour du contenu **garanti sûr** (ex : HTML généré par un éditeur WYSIWYG de confiance, après avoir été nettoyé côté serveur avec une librairie comme DOMPurify).
</div>

## 28.6 Vérifier les dépendances npm : le risque de la supply chain

<div class="encadre astuce">
<span class="encadre-titre">💡 Le XSS ne vient pas toujours de ton propre code</span>
Une dépendance npm compromise (package piraté, mis à jour avec du code malveillant) peut injecter du code qui lit `localStorage` sur tous les sites l'utilisant. `npm audit` (intégré à npm) signale les vulnérabilités connues dans tes dépendances ; garder ses dépendances à jour et limiter leur nombre réduit cette surface d'attaque, en complément direct des bonnes pratiques de stockage de ce chapitre.
</div>

## 28.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 28.1</span>

Pour chacune de ces données, indique où la stocker (localStorage, sessionStorage, cookie httpOnly, ou aucun stockage persistant) : (a) le thème clair/sombre choisi, (b) un refresh token d'authentification, (c) le brouillon d'un message en cours de rédaction, (d) le mot de passe saisi à la connexion.
</div>

**Corrigé :**
(a) **localStorage** — préférence non sensible, doit survivre à la fermeture du navigateur.
(b) **Cookie httpOnly** — jamais accessible en JavaScript, seul moyen de le protéger contre le XSS.
(c) **sessionStorage** (ou state React simple si la survie à un rechargement n'est pas nécessaire) — donnée temporaire, non sensible.
(d) **Aucun stockage persistant** — un mot de passe ne doit jamais être conservé après l'envoi de la requête de connexion, ni en mémoire au-delà du strict nécessaire.

## 28.8 Résumé du chapitre

- localStorage/sessionStorage sont accessibles par tout script JS de la page ; les cookies `httpOnly` ne le sont jamais.
- Ne jamais y stocker de token longue durée, mot de passe, ou donnée financière sensible.
- React échappe automatiquement le contenu du JSX ; `dangerouslySetInnerHTML` désactive cette protection et ne doit être utilisé que sur du contenu garanti sûr.
- Le risque XSS peut aussi venir d'une dépendance npm compromise, pas seulement de son propre code.

*Ceci clôt la Partie 4 (communication avec le backend). Chapitre suivant : le Responsive Design, première étape de la Partie 5 (style et UI).*
