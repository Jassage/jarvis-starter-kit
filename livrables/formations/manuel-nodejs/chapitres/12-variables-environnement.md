<div class="chapitre-titre-num">CHAPITRE 12</div>

# Variables d'environnement (.env)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre pourquoi la configuration ne doit jamais être codée en dur, utiliser `dotenv`, et valider la présence des variables attendues au démarrage. À la fin de ce chapitre, tu sauras structurer la configuration d'un projet pour qu'elle change proprement entre développement, test et production, sans jamais exposer de secret dans le code source.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un ancien stagiaire a poussé, il y a huit mois, un commit contenant le mot de passe réel de la base de données de production directement dans un fichier de configuration versionné. Le dépôt est hébergé sur un GitHub public. Même après avoir supprimé la ligne dans un commit ultérieur, ce mot de passe reste consultable dans l'historique Git par quiconque connaît la commande `git log -p`. Ton client te demande, un peu paniqué, si c'est vraiment grave. La réponse est oui, et ce chapitre t'explique exactement comment éviter que ça se reproduise — dès le premier jour d'un projet, pas après coup.
</div>

## 12.1 Le problème de la configuration codée en dur

```js
// ❌ Configuration en dur : change selon l'environnement, expose des secrets dans le code source
const connexion = new Client({
  host: "localhost",
  port: 5432,
  password: "motdepasse123", // 💥 visible dans le code, versionné dans Git !
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un secret codé en dur finit tôt ou tard dans l'historique Git</span>
Même supprimé plus tard, un secret commité une seule fois reste visible dans **l'historique** du dépôt Git (`git log`), sauf réécriture complète de l'historique (opération risquée et rarement effectuée). La règle absolue : **aucun** secret (mot de passe, clé API, token) ne doit jamais apparaître dans le code source versionné.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — que faire si un secret a déjà fuité (comme dans la mise en situation)</span>
Supprimer la ligne du code ne suffit **jamais** : le secret reste dans l'historique Git. La seule remédiation fiable est la **rotation complète** du secret exposé (changer le mot de passe réel côté base de données/service concerné), rendant l'ancienne valeur inutile même si elle reste visible dans l'historique. Envisager une réécriture d'historique (`git filter-repo` ou équivalent) seulement en complément, jamais comme unique mesure.
</div>

## 12.2 Le fichier .env

```
# .env (JAMAIS commité, listé dans .gitignore)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/mabase
JWT_SECRET=un-secret-tres-long-et-aleatoire
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## 12.3 dotenv : charger le fichier .env dans process.env

```
$ npm install dotenv
```

```js
// server.js — TOUJOURS en tout premier, avant tout autre import qui utiliserait une variable d'env
require("dotenv").config();

const app = require("./src/app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} (env: ${process.env.NODE_ENV})`);
});
```

`dotenv` lit le fichier `.env` à la racine du projet et injecte chacune de ses variables dans `process.env`, l'objet global où Node.js expose toutes les variables d'environnement (qu'elles viennent du système ou de `.env`).

<div class="encadre astuce">
<span class="encadre-titre">💡 Depuis Node.js 20.6+, --env-file est une alternative native sans dépendance</span>

```
$ node --env-file=.env server.js
```
Les versions récentes de Node.js supportent nativement le chargement d'un fichier `.env` via l'option `--env-file`, sans nécessiter le paquet `dotenv`. Ce manuel utilise `dotenv` car il reste, à ce jour, plus universellement compatible avec toutes les versions de Node.js encore en production.
</div>

## 12.4 Toutes les variables process.env sont des chaînes de caractères

```
# .env
PORT=3000
DEBUG=true
```

```js
console.log(typeof process.env.PORT);  // "string", PAS "number" !
console.log(process.env.PORT === 3000); // false : compare une string "3000" à un number 3000

console.log(typeof process.env.DEBUG); // "string"
if (process.env.DEBUG) {
  // ⚠️ Ce bloc s'exécute même si DEBUG="false", car "false" est une CHAÎNE NON VIDE, donc "truthy" !
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Piège très fréquent : DEBUG="false" reste "truthy"</span>

```js
// ❌ Toujours vrai, quelle que soit la valeur textuelle de DEBUG (tant qu'elle n'est pas vide)
if (process.env.DEBUG) { ... }

// ✅ Comparaison explicite à la chaîne attendue
if (process.env.DEBUG === "true") { ... }
```
Toute variable d'environnement est une **chaîne de caractères**, jamais un booléen ou un nombre natif — il faut toujours convertir explicitement (`Number(process.env.PORT)`, comparaison stricte à `"true"`/`"false"`) avant de l'utiliser comme tel.
</div>

## 12.5 Valider les variables d'environnement au démarrage

```js
// src/config/env.js
const variablesRequises = ["PORT", "DATABASE_URL", "JWT_SECRET"];

function validerVariablesEnvironnement() {
  const manquantes = variablesRequises.filter((nom) => !process.env[nom]);
  if (manquantes.length > 0) {
    console.error("Variables d'environnement manquantes :", manquantes.join(", "));
    process.exit(1); // arrête l'application IMMÉDIATEMENT, plutôt qu'un plantage confus plus tard
  }
}

module.exports = { validerVariablesEnvironnement };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Échouer vite et clairement (fail fast) plutôt que plus tard, confusément</span>
Sans cette validation, une variable manquante (par exemple `JWT_SECRET` oubliée) ne provoquerait une erreur que bien plus tard, au moment précis où le code tenterait de l'utiliser (souvent lors de la toute première tentative de connexion d'un utilisateur) — un message d'erreur confus et tardif. Valider **toutes** les variables requises dès le démarrage échoue immédiatement, avec un message clair, avant même d'accepter la première requête.
</div>

## 12.6 Variables d'environnement par environnement (.env.development, .env.production)

```
.env.development
.env.test
.env.production
.env.example       (commité, documente les variables SANS valeurs réelles — rappel du chapitre 5)
```

```js
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
```

```mermaid
flowchart TD
    A["NODE_ENV defini ?"] -->|"development (defaut)"| B[".env.development"]
    A -->|"test"| C[".env.test"]
    A -->|"production"| D[".env.production"]
    B --> E["Charge dans process.env"]
    C --> E
    D --> E
    E --> F["validerVariablesEnvironnement()"]
    F -->|"Toutes presentes"| G["Serveur demarre normalement"]
    F -->|"Une ou plusieurs manquantes"| H["process.exit(1)\nmessage clair, AVANT d'accepter\nla premiere requete"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication du schéma</span>
Ce flux garantit deux choses : la bonne configuration est chargée selon l'environnement d'exécution (jamais la configuration de développement en production par erreur), et l'application ne démarre **jamais** dans un état de configuration incomplète — la validation intervient avant que la moindre requête ne soit acceptée.
</div>

## 12.7 Gestion des secrets en production : au-delà du fichier .env

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — .env reste un fichier, avec les limites d'un fichier</span>
En développement, `.env` est pratique et suffisant. En production, de nombreuses équipes vont plus loin : la plateforme d'hébergement (Railway, Render, Vercel, un cluster Kubernetes) injecte directement les variables d'environnement au démarrage du conteneur, **sans jamais qu'un fichier `.env` n'existe physiquement sur le serveur**. Pour des secrets particulièrement sensibles à grande échelle (plusieurs services partageant les mêmes identifiants, rotation automatique requise), un **gestionnaire de secrets dédié** (HashiCorp Vault, AWS Secrets Manager, Google Secret Manager) centralise le stockage, l'audit d'accès et la rotation, bien au-delà de ce qu'un fichier `.env` peut offrir.
</div>

| Approche | Où vivent les secrets | Rotation | Audit d'accès | Complexité |
|---|---|---|---|---|
| `.env` local | Fichier sur disque, par développeur | Manuelle | Aucun | Minimale |
| Variables injectées par la plateforme (Railway, Render...) | Configurée dans l'interface de la plateforme, jamais sur disque | Manuelle | Selon la plateforme | Faible |
| Gestionnaire de secrets dédié (Vault, AWS Secrets Manager) | Service centralisé, chiffré | Automatisable | Détaillé, journalisé | Élevée |

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Pour la quasi-totalité des projets de ce manuel (petites et moyennes équipes, projets clients indépendants), variables injectées par la plateforme d'hébergement suffisent largement. Un gestionnaire de secrets dédié se justifie à partir d'une taille d'organisation et d'une sensibilité de données qui dépassent largement le cadre d'un projet freelance typique — le mentionner ici sert à connaître l'existence de l'option, pas à la recommander par défaut.
</div>

## Atelier — Configuration multi-environnement complète

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 12 — Empêcher le secret de fuiter, comme dans la mise en situation</span>

**Objectif** : mettre en place, de zéro, une configuration qui rend la fuite de la mise en situation d'ouverture structurellement impossible.

**Préparation** : un projet Node.js avec `dotenv` installé.

**Étapes détaillées** :
1. Crée `.env.example` documentant `PORT`, `DATABASE_URL`, `JWT_SECRET`, sans valeurs réelles.
2. Crée `.env.development` avec de vraies valeurs de développement (une base de données locale).
3. Vérifie que `.gitignore` contient `.env`, `.env.*` mais **pas** `.env.example` (qui doit rester commité).
4. Écris `src/config/env.js` avec la fonction `validerVariablesEnvironnement()` de la section 12.5.
5. Appelle cette fonction en tout début de `server.js`, avant tout autre code.
6. Teste : supprime temporairement `JWT_SECRET` de ton `.env.development`, relance le serveur, observe l'échec immédiat et clair.

**Validation** : le serveur doit refuser de démarrer avec un message explicite listant la variable manquante, jamais un plantage confus plus tard dans l'exécution.

**Résultat attendu** : une configuration qui protège structurellement contre l'oubli d'un secret, et qui ne permet jamais qu'un secret réel se retrouve dans un fichier commité.

**Dépannage** : si `git status` montre `.env` comme prêt à être commité, vérifie immédiatement `.gitignore` avant de continuer.

**Nettoyage** : remets `JWT_SECRET` dans `.env.development` après le test.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier .env dans .gitignore</span>

```
# .gitignore
node_modules/
.env
.env.*.local
```
Une simple omission dans `.gitignore` suffit à exposer publiquement tous les secrets d'un projet si le dépôt est poussé sur une plateforme publique (GitHub, GitLab) — toujours vérifier ce fichier dès la création du projet, avant le tout premier commit.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Charger dotenv APRÈS avoir importé des modules qui en dépendent</span>

```js
// ❌ ConfigDB lit process.env.DATABASE_URL AVANT que dotenv ne l'ait chargé !
const ConfigDB = require("./config/db");
require("dotenv").config();
```
```js
// ✅ dotenv.config() doit être la TOUTE PREMIÈRE ligne exécutée du programme
require("dotenv").config();
const ConfigDB = require("./config/db");
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Continuer après un secret ayant fuité, sans le faire tourner</span>
Exactement la mise en situation d'ouverture : supprimer la ligne d'un futur commit ne rend pas le secret inutilisable, il reste lisible dans l'historique. Seule la rotation réelle du secret côté service concerné neutralise le risque.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : process.env.MA_VARIABLE est undefined alors que .env la définit</span>

- **Cause la plus fréquente** : `dotenv.config()` appelé après l'import d'un module qui lit déjà `process.env` (erreur n°2), ou fichier `.env` absent du dossier attendu.
- **Diagnostic** : ajouter un `console.log(process.env)` juste après `dotenv.config()` pour vérifier ce qui a réellement été chargé.
- **Solution** : déplacer `require("dotenv").config()` en toute première ligne du point d'entrée.
</div>

## En entreprise

- **Aucun secret de production sur la machine d'un développeur** : de nombreuses équipes interdisent même l'accès direct aux vraies valeurs de production, les développeurs travaillant uniquement avec des valeurs de développement/test.
- **Scan automatique de secrets en CI** : des outils comme GitGuardian ou le secret scanning natif de GitHub détectent automatiquement un secret accidentellement commité, avant même qu'un humain ne le remarque.
- **Erreur classique observée** : exactement la mise en situation d'ouverture — un secret de production commité par erreur, découvert des mois plus tard, nécessitant une rotation en urgence.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi toutes les valeurs de process.env sont-elles des chaînes de caractères ?"**
Réponse attendue : les variables d'environnement sont un mécanisme du système d'exploitation, qui ne connaît que du texte — Node.js les expose donc telles quelles, sans conversion automatique de type.

**Q2. "Que faire si un secret a été commité par erreur dans Git ?"**
Réponse attendue : faire tourner (roter) immédiatement le secret concerné côté service réel, la suppression de la ligne dans un commit ultérieur ne suffisant pas puisque l'historique Git conserve la valeur.

**Q3. "Pourquoi valider les variables d'environnement au démarrage plutôt que de laisser l'application planter plus tard ?"**
Réponse attendue : pour échouer vite et clairement (fail fast), avec un message explicite listant les variables manquantes, plutôt qu'un plantage confus au moment imprévisible où le code tenterait d'utiliser une variable absente.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un secret de production ne devrait jamais transiter par un canal non chiffré (message Slack en clair, email) — un gestionnaire de mots de passe partagé ou un coffre-fort de secrets reste préférable, même pour une petite équipe.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Maintenir `.env.example` systématiquement à jour à chaque nouvelle variable ajoutée — un `.env.example` obsolète oblige un nouveau développeur à deviner des variables manquantes, exactement le problème que ce fichier est censé éviter.
</div>

## Résumé du chapitre

- Aucun secret ne doit jamais être codé en dur dans le code source ; `.env` (jamais commité) centralise la configuration sensible.
- `dotenv` charge `.env` dans `process.env` — doit être appelé en tout premier, avant tout autre import en dépendant.
- Toute variable de `process.env` est une **chaîne de caractères** : conversion et comparaison explicites nécessaires.
- Valider la présence des variables requises au démarrage échoue vite et clairement, plutôt que plus tard de façon confuse.
- En production, les plateformes d'hébergement injectent souvent les variables directement, sans fichier `.env` physique ; un gestionnaire de secrets dédié (Vault...) répond à des besoins plus avancés.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Quel type a toujours process.env.PORT ?
   - a) number
   - b) string
   - c) boolean
   - d) Dépend de la valeur

2. Que faire si un secret a été commité par erreur, même s'il a été supprimé depuis ?
   - a) Rien, la suppression suffit
   - b) Faire tourner (roter) le secret réel côté service concerné
   - c) Attendre que Git l'oublie automatiquement
   - d) Renommer la variable

3. Où dotenv.config() doit-il être appelé ?
   - a) N'importe où dans le fichier
   - b) En tout dernier, après tous les imports
   - c) En tout premier, avant tout import qui dépend de process.env
   - d) Uniquement en production

**Corrigé** : 1-b, 2-b, 3-c.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. `if (process.env.DEBUG)` est vrai même si `DEBUG="false"`. — **Vrai** (chaîne non vide = truthy).
2. `.env.example` doit être commité dans Git. — **Vrai** (contrairement à `.env`).
3. Un secret supprimé d'un commit ultérieur disparaît entièrement de l'historique Git. — **Faux** (reste consultable sauf réécriture d'historique).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Pourquoi la validation des variables d'environnement au démarrage (section 12.5) est-elle considérée comme une mesure de sécurité, et pas seulement de confort ?

**Corrigé** : sans cette validation, une variable de sécurité critique manquante (par exemple `JWT_SECRET`) pourrait passer inaperçue jusqu'à ce que le code l'utilise réellement — dans le pire des cas, avec une valeur `undefined` silencieusement acceptée par une bibliothèque peu stricte, générant des tokens signés avec une clé prévisible ou vide. Échouer immédiatement au démarrage élimine ce risque en le rendant impossible à ignorer.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Écris une fonction `obtenirPort()` qui lit `process.env.PORT`, le convertit en nombre, et retourne `3000` par défaut si la variable est absente ou invalide (pas un nombre).
</div>

**Corrigé :**
```js
function obtenirPort() {
  const port = Number(process.env.PORT);
  return Number.isInteger(port) && port > 0 ? port : 3000;
}
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je ne code jamais un secret en dur dans le code source.</li>
<li>☐ Je sais utiliser dotenv correctement (chargé en tout premier).</li>
<li>☐ Je sais que process.env ne contient que des chaînes de caractères.</li>
<li>☐ Je sais valider les variables requises au démarrage (fail fast).</li>
<li>☐ Je sais organiser .env.development/.env.test/.env.production.</li>
<li>☐ Je connais l'existence des gestionnaires de secrets dédiés pour des besoins avancés.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Puis-je utiliser un seul fichier .env pour tous les environnements ?</dt>
<dd>Techniquement oui, mais c'est risqué : une seule erreur de configuration pourrait faire pointer un environnement de développement vers une vraie base de données de production. Séparer les fichiers par environnement (section 12.6) réduit ce risque.</dd>

<dt>Faut-il un gestionnaire de secrets dès le premier projet ?</dt>
<dd>Non, ce serait disproportionné pour la majorité des projets freelance ou de petite équipe. Les variables injectées par la plateforme d'hébergement suffisent largement ; réserver un gestionnaire dédié à des besoins avancés (rotation automatisée, audit fin, plusieurs équipes).</dd>

<dt>Que faire si .env.example devient trop long ?</dt>
<dd>C'est souvent le signe qu'un projet gagnerait à regrouper sa configuration en sections commentées (base de données, authentification, emails...) plutôt qu'une liste plate — un simple problème d'organisation, pas une raison d'abandonner la pratique.</dd>
</dl>

## Références et pour aller plus loin

- Documentation dotenv : [https://github.com/motdotla/dotenv](https://github.com/motdotla/dotenv)
- Documentation Node.js `--env-file` : [https://nodejs.org/api/cli.html#--env-fileconfig](https://nodejs.org/api/cli.html#--env-fileconfig)
- GitHub Secret Scanning : [https://docs.github.com/en/code-security/secret-scanning](https://docs.github.com/en/code-security/secret-scanning)

*Ceci clôt la Partie 2 (JavaScript moderne et asynchrone). Chapitre suivant : Express.js, le framework central de ce manuel.*
