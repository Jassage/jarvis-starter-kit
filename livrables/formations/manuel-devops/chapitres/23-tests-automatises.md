<div class="chapitre-titre-num">CHAPITRE 23 · 🟡 INTERMÉDIAIRE</div>

# Tests automatisés

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre les quatre grandes familles de tests automatisés (unitaires, intégration, API, end-to-end), leurs rôles distincts et complémentaires, et savoir les intégrer efficacement dans le job `test` du pipeline construit au chapitre 22. Ce chapitre donne un vrai contenu à l'étape `npm test` restée volontairement simple jusqu'ici.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le pipeline du chapitre 22 exécute `npm test`, mais ce test unique (vérifier que `/health` répond 200) ne couvre presque rien de la logique réelle d'une application. Sans une suite de tests plus complète, la CI (chapitre 19) donne une **fausse confiance** — un statut vert qui ne garantit en réalité presque rien. Ce chapitre construit une vraie stratégie de test, condition de base pour envisager un jour Continuous Deployment (chapitre 20, section 20.3) ou trunk-based development (chapitre 9, section 9.3).
</div>

## 23.1 Quatre familles de tests, quatre objectifs différents

```mermaid
flowchart TB
    E2E["End-to-end\n(peu nombreux, lents,\nvue utilisateur complète)"]
    API["Tests API\n(quelques-uns,\nvérifient les endpoints)"]
    INT["Intégration\n(plus nombreux,\nplusieurs composants ensemble)"]
    UNIT["Unitaires\n(très nombreux, rapides,\nune fonction isolée)"]
    UNIT --> INT --> API --> E2E
```

<div class="encadre retenir">
<span class="encadre-titre">📌 La "pyramide des tests"</span>
Cette représentation classique illustre une règle de proportion : beaucoup de tests unitaires (rapides, peu coûteux à écrire et exécuter), moins de tests d'intégration, encore moins de tests API, et très peu de tests end-to-end (lents, coûteux à maintenir, mais couvrant le parcours utilisateur réel). Une suite de tests <strong>inversée</strong> (beaucoup de end-to-end lents, peu d'unitaires) est un signe classique de dette technique de test, lente à exécuter et pénible à maintenir.
</div>

## 23.2 Tests unitaires

Un test unitaire vérifie **une seule fonction ou un seul composant**, isolé de ses dépendances (base de données, réseau, autres fonctions).

```javascript
// calculatrice.js
function calculerTotal(prix, quantite, remise = 0) {
  if (prix < 0 || quantite < 0) throw new Error('Valeurs négatives interdites');
  return prix * quantite * (1 - remise);
}
module.exports = { calculerTotal };
```

```javascript
// calculatrice.test.js
const { calculerTotal } = require('./calculatrice');

test('calcule le total sans remise', () => {
  expect(calculerTotal(10, 3)).toBe(30);
});

test('applique correctement une remise de 20%', () => {
  expect(calculerTotal(10, 3, 0.2)).toBe(24);
});

test('rejette un prix négatif', () => {
  expect(() => calculerTotal(-5, 2)).toThrow('Valeurs négatives interdites');
});
```

**Explication :** chaque `test(...)` vérifie un seul comportement précis, sans base de données ni réseau — ces tests s'exécutent en quelques millisecondes, ce qui permet d'en avoir des centaines, voire des milliers, sans ralentir significativement le pipeline (chapitre 22).

## 23.3 Tests d'intégration

Un test d'intégration vérifie que **plusieurs composants fonctionnent correctement ensemble** — typiquement, du code applicatif avec une vraie base de données (souvent une instance de test, chapitre 11).

```javascript
// utilisateur.integration.test.js
const { creerUtilisateur, trouverParEmail } = require('./utilisateur.service');
const { connecterBaseDeTest, fermerBaseDeTest, viderBaseDeTest } = require('./test-helpers');

beforeAll(async () => await connecterBaseDeTest());
afterEach(async () => await viderBaseDeTest());
afterAll(async () => await fermerBaseDeTest());

test('crée un utilisateur et le retrouve par email', async () => {
  await creerUtilisateur({ email: 'test@exemple.com', nom: 'Test' });
  const utilisateur = await trouverParEmail('test@exemple.com');
  expect(utilisateur.nom).toBe('Test');
});
```

**Explication :** `beforeAll`/`afterAll` connectent et ferment une vraie base de données de test une seule fois pour tout le fichier ; `afterEach` la vide après chaque test, garantissant que chaque test démarre dans un état propre et indépendant des autres — la même exigence de reproductibilité que le chapitre 19 (section 19.2) exige de l'environnement de CI dans son ensemble.

<div class="encadre astuce">
<span class="encadre-titre">💡 Une base de données de test, jamais la base de développement ou de production</span>
Le pipeline CI (chapitre 22) peut inclure un conteneur PostgreSQL de test (via un <code>service</code> GitHub Actions, une fonctionnalité proche de <code>docker compose</code> appliquée directement dans un job) — jamais une connexion à une vraie base de développement ou, pire, de production, dont l'état ne serait ni reproductible ni sûr à modifier automatiquement.
</div>

## 23.4 Tests API

Un test API vérifie le comportement d'un endpoint HTTP complet, en simulant une vraie requête.

```javascript
// api.test.js
const request = require('supertest');
const app = require('./app');

describe('POST /utilisateurs', () => {
  test('crée un utilisateur avec des données valides', async () => {
    const reponse = await request(app)
      .post('/utilisateurs')
      .send({ email: 'nouveau@exemple.com', nom: 'Nouveau' });
    expect(reponse.statusCode).toBe(201);
    expect(reponse.body.email).toBe('nouveau@exemple.com');
  });

  test('rejette une création sans email', async () => {
    const reponse = await request(app)
      .post('/utilisateurs')
      .send({ nom: 'Sans email' });
    expect(reponse.statusCode).toBe(400);
  });
});
```

**Explication :** `supertest` (déjà utilisé au chapitre 22) envoie de vraies requêtes HTTP à l'application, sans avoir besoin de la démarrer sur un vrai port réseau — vérifiant le comportement observable de l'API (codes de statut, structure de la réponse) plutôt que les détails internes de son implémentation.

## 23.5 Tests end-to-end (E2E)

Un test end-to-end simule un parcours utilisateur complet, à travers une vraie interface (souvent un navigateur automatisé).

```javascript
// e2e/connexion.spec.js (avec Playwright)
const { test, expect } = require('@playwright/test');

test('un utilisateur peut se connecter et voir son tableau de bord', async ({ page }) => {
  await page.goto('https://staging.monsite.exemple.com/connexion');
  await page.fill('#email', 'test@exemple.com');
  await page.fill('#mot-de-passe', 'MotDePasseTest123');
  await page.click('button[type="submit"]');
  await expect(page.locator('h1')).toContainText('Tableau de bord');
});
```

**Explication :** ce test contrôle un vrai navigateur (Playwright ou son équivalent Cypress), naviguant sur une vraie page, remplissant un vrai formulaire — le test le plus proche de l'expérience réelle d'un utilisateur, mais aussi le plus lent et le plus fragile (un simple changement visuel non fonctionnel peut le faire échouer).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Pourquoi peu de tests end-to-end, jamais beaucoup</span>
Un test E2E prend souvent plusieurs secondes à s'exécuter (contre quelques millisecondes pour un test unitaire), et dépend de nombreux facteurs externes (disponibilité d'un environnement de staging, chapitre 18, stabilité du réseau) — une suite de centaines de tests E2E deviendrait extrêmement lente et fragile. Réserver les tests E2E aux parcours <strong>critiques</strong> de l'application (connexion, achat, action principale), laissant la couverture de détail aux tests unitaires et d'intégration, plus nombreux et plus rapides.
</div>

## 23.6 Intégrer les quatre familles dans le pipeline

```yaml
jobs:
  test-unitaires-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/postgres

  test-e2e:
    needs: test-unitaires-integration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

**Explication :** le bloc `services` (chapitre 21, une fonctionnalité non couverte au chapitre précédent) démarre un vrai conteneur PostgreSQL **le temps du job**, avec son propre healthcheck (chapitre 12, section 12.6) — le job attend que la base soit prête avant d'exécuter les tests d'intégration ; les tests E2E, plus lents, s'exécutent dans un job séparé, après les tests plus rapides (`needs`), pour échouer vite sur les problèmes les plus simples avant d'investir du temps dans les tests les plus coûteux.

## Atelier — Construire les quatre niveaux sur un petit projet

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 23.1 — La pyramide des tests appliquée</span>

**Objectif** : écrire au moins un test de chaque famille sur l'application du chapitre 22.

**Étapes détaillées** :

1. Ajoute une fonction pure (comme `calculerTotal`, section 23.2) à l'application, avec trois tests unitaires.
2. Ajoute un endpoint qui interagit avec un stockage simple (même une simple structure en mémoire, à défaut d'une vraie base pour cet atelier), avec un test d'intégration.
3. Ajoute un test API avec `supertest` sur cet endpoint (section 23.4).
4. Si tu as un environnement de staging (chapitre 18) accessible, ajoute un test E2E simple avec Playwright.
5. Mets à jour le workflow du chapitre 22 pour exécuter ces différents niveaux, avec le bloc `services` si un test d'intégration nécessite une vraie base de données.

**Résultat attendu** : une suite de tests à plusieurs niveaux, chacun avec un rôle distinct, intégrée dans un pipeline qui échoue vite sur les tests rapides avant d'investir dans les plus lents.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Une pyramide inversée</span>
Beaucoup de tests E2E lents et peu de tests unitaires rapides (section 23.1) ralentit considérablement le pipeline et rend chaque échec plus difficile à diagnostiquer précisément — privilégier systématiquement le niveau de test le plus bas capable de vérifier un comportement donné.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Tests d'intégration contre une vraie base de production ou de développement</span>
Comme signalé en section 23.3, un test qui modifie des données réelles (même de développement) plutôt qu'une base de test isolée et vidée à chaque exécution peut corrompre des données ou produire des résultats de test non reproductibles.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Des tests fragiles qui échouent sans rapport avec un vrai bug</span>
Un test E2E qui dépend d'un délai fixe (`sleep(2000)`) plutôt que d'attendre un état précis (un élément réellement affiché) échoue de façon aléatoire selon la charge du serveur d'exécution — un piège classique qui érode la confiance dans la suite de tests, un écho direct de l'erreur n°3 du chapitre 19 (ignorer des échecs de CI).
</div>

## En entreprise

**Réalité répandue** : très peu d'équipes atteignent une pyramide de test parfaitement équilibrée — l'objectif réaliste est une amélioration continue (chapitre 2, section 2.6) plutôt qu'une suite de tests jugée "complète" dès le départ.

**Bonne pratique répandue** : la couverture de test (pourcentage du code exécuté par au moins un test) est un indicateur utile mais **ne garantit pas** la qualité des tests eux-mêmes — un code entièrement "couvert" par des tests qui ne vérifient rien de significatif (`expect(true).toBe(true)`) donne une fausse impression de sécurité, approfondi au chapitre 24.

**Erreur classique observée** : une suite de tests E2E si fragile et lente qu'elle finit par être désactivée entièrement ("on la réactivera plus tard"), perdant toute la couverture qu'elle apportait sur les parcours critiques de l'application.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Explique la pyramide des tests et pourquoi elle a cette forme."**
Réponse attendue : beaucoup de tests unitaires rapides et peu coûteux, de moins en moins de tests à mesure que leur portée grandit et leur coût d'exécution augmente, jusqu'à un nombre restreint de tests E2E réservés aux parcours critiques (section 23.1).

**Q2. "Comment testerais-tu un endpoint qui interagit avec une base de données, sans risquer de corrompre de vraies données ?"**
Réponse attendue : une base de données de test isolée, réinitialisée entre chaque test (`afterEach`), jamais une connexion à une base de développement ou de production réelle (section 23.3).

**Q3. "Pourquoi éviter d'attendre un délai fixe (`sleep`) dans un test end-to-end ?"**
Réponse attendue : un délai fixe rend le test fragile et dépendant de la charge du système d'exécution — attendre un état précis (un élément visible, une réponse reçue) est plus fiable et plus rapide en moyenne (section "Erreurs fréquentes", erreur n°3).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les données utilisées dans les tests (y compris E2E, section 23.5) doivent être entièrement factices — jamais de vraies données personnelles, même anonymisées partiellement, dans un environnement de test moins protégé que la production (rappel direct du chapitre 18, section 18.5).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Nomme chaque test de façon descriptive (`test('rejette un prix négatif', ...)`) plutôt que vaguement (`test('test 1', ...)`) — un test qui échoue avec un nom clair permet de comprendre immédiatement ce qui a cassé, sans devoir lire tout le code du test.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Exécuter les tests unitaires et d'intégration (rapides) avant les tests E2E (lents), via `needs` (section 23.6), permet d'échouer rapidement sur les problèmes les plus simples avant d'investir du temps de calcul sur les tests les plus coûteux.
</div>

## Résumé du chapitre

- Quatre familles de tests (unitaires, intégration, API, end-to-end) ont des rôles complémentaires, organisés en pyramide : beaucoup d'unitaires rapides, peu d'E2E lents.
- Les tests unitaires isolent une fonction ; les tests d'intégration vérifient plusieurs composants ensemble (souvent avec une vraie base de test) ; les tests API vérifient le comportement HTTP observable ; les tests E2E simulent un parcours utilisateur complet.
- Une base de données de test isolée, jamais une base de développement ou de production, protège l'intégrité des données réelles.
- Une pyramide inversée (beaucoup d'E2E, peu d'unitaires) ralentit le pipeline et fragilise la confiance dans la suite de tests.
- Le pipeline CI/CD du chapitre 22 s'enrichit en séparant les niveaux de test, les plus rapides en premier.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un test unitaire vérifie :
   - a) Un parcours utilisateur complet dans un navigateur
   - b) Une seule fonction ou un seul composant, isolé de ses dépendances
   - c) Uniquement la base de données
   - d) La configuration du serveur de production

2. Selon la pyramide des tests, on devrait avoir :
   - a) Beaucoup de tests E2E et peu de tests unitaires
   - b) Beaucoup de tests unitaires et peu de tests E2E
   - c) Exactement le même nombre de chaque type
   - d) Uniquement des tests E2E

3. Un test qui utilise `sleep(2000)` pour attendre qu'une page se charge est :
   - a) La meilleure pratique recommandée
   - b) Potentiellement fragile, une attente d'état précis étant préférable
   - c) Obligatoire dans tous les tests E2E
   - d) Sans aucun inconvénient

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Les tests d'intégration devraient utiliser la vraie base de données de développement pour être réalistes. — **Faux** (section 23.3).
2. Un taux de couverture de code élevé garantit automatiquement des tests de bonne qualité. — **Faux** (section "En entreprise").
3. Les tests E2E sont généralement les plus lents et les plus fragiles des quatre familles. — **Vrai** (section 23.5).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 23.1</span>

Une équipe a 500 tests E2E et seulement 20 tests unitaires. Le pipeline CI prend 45 minutes. Propose, en 3-4 phrases, une stratégie pour rééquilibrer cette suite de tests.
</div>

**Corrigé (exemple de réponse) :** identifier, parmi les 500 tests E2E, lesquels vérifient réellement un parcours critique nécessitant un vrai navigateur, et lesquels pourraient être remplacés par des tests unitaires ou d'intégration bien plus rapides sur la même logique (section 23.1). Réécrire progressivement ces tests redondants en tests de niveau inférieur, en conservant seulement un noyau réduit de tests E2E sur les parcours vraiment critiques (connexion, achat, action principale). Cette transition progressive, plutôt qu'une réécriture complète d'un coup, réduira le temps du pipeline (section "Performance") tout en conservant une couverture équivalente voire meilleure, alignée avec le principe des petits changements fréquents du chapitre 2.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais distinguer les quatre familles de tests et leur rôle respectif.</li>
<li>☐ Je comprends la pyramide des tests et pourquoi une pyramide inversée pose problème.</li>
<li>☐ Je sais écrire un test unitaire, un test d'intégration avec base de test isolée, et un test API.</li>
<li>☐ Je sais pourquoi limiter le nombre de tests end-to-end aux parcours critiques.</li>
<li>☐ J'ai intégré plusieurs niveaux de test dans le pipeline CI/CD du chapitre 22.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il viser 100% de couverture de code ?</dt>
<dd>Non, ce n'est généralement ni réaliste ni le plus utile. Une couverture élevée sur la logique métier critique vaut mieux qu'une couverture totale qui inclut du code trivial ou peu risqué (section "En entreprise").</dd>

<dt>Jest, Playwright, Cypress : comment choisir ?</dt>
<dd>Jest (utilisé dans ce chapitre) est très répandu pour les tests unitaires et d'intégration JavaScript/TypeScript ; Playwright et Cypress sont deux options solides pour les tests E2E, avec des approches légèrement différentes — un choix qui dépend souvent des préférences d'équipe plus que d'une supériorité technique tranchée.</dd>

<dt>Les tests automatisés remplacent-ils les tests manuels ?</dt>
<dd>Non, ils les réduisent considérablement pour les vérifications répétitives, mais un test exploratoire manuel garde de la valeur pour détecter des problèmes que personne n'a anticipés au moment d'écrire un test automatisé.</dd>
</dl>

## Références et pour aller plus loin

- Martin Fowler — "TestPyramid" (article de référence sur la pyramide des tests) : [https://martinfowler.com/bliki/TestPyramid.html](https://martinfowler.com/bliki/TestPyramid.html)
- Documentation officielle Jest : [https://jestjs.io](https://jestjs.io)
- Documentation officielle Playwright : [https://playwright.dev](https://playwright.dev)

*Chapitre suivant : qualité du code — linting, formatting, analyse statique, couverture de tests, et comment intégrer ces contrôles dans le pipeline pour compléter la suite de tests de ce chapitre.*
