<div class="chapitre-titre-num">CHAPITRE 24 · 🟡 INTERMÉDIAIRE</div>

# Qualité du code

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre et mettre en place le linting, le formatting, l'analyse statique et la mesure de couverture de tests, et intégrer ces quatre contrôles dans le pipeline CI/CD construit au chapitre 22. Ce chapitre clôt la Partie VII : la CI vérifie désormais non seulement que le code fonctionne (chapitre 23), mais aussi qu'il respecte des standards de qualité objectifs.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un code qui passe tous ses tests peut malgré tout être difficile à lire, incohérent dans son style, ou contenir des erreurs qu'aucun test ne couvre encore (une variable jamais utilisée, une comparaison suspecte). Ce chapitre ajoute une seconde ligne de défense, complémentaire aux tests du chapitre 23 : des outils qui vérifient automatiquement la forme et certains risques du code, avant même qu'un humain ne le relise en pull request (chapitre 8).
</div>

## 24.1 Linting : détecter des erreurs et incohérences automatiquement

<div class="encadre retenir">
<span class="encadre-titre">📌 Linting vs tests</span>
Un test (chapitre 23) vérifie un <strong>comportement</strong> ("cette fonction retourne bien ce résultat"). Un <strong>linter</strong> analyse le code <strong>sans l'exécuter</strong>, à la recherche de motifs suspects ou d'incohérences de style ("cette variable est déclarée mais jamais utilisée", "ce `===` a été oublié au profit d'un `==` imprécis"). Les deux sont complémentaires, ni interchangeables ni redondants.
</div>

```bash
npm install --save-dev eslint
npx eslint --init
```

```json
// .eslintrc.json (exemple simplifié)
{
  "extends": "eslint:recommended",
  "env": { "node": true, "es2022": true },
  "rules": {
    "no-unused-vars": "error",
    "eqeqeq": "error",
    "no-console": "warn"
  }
}
```

**Explication :** `eslint:recommended` active un ensemble de règles éprouvées par défaut ; `no-unused-vars: error` transforme une variable inutilisée en erreur bloquante (pas juste un avertissement) ; `eqeqeq: error` impose `===` plutôt que `==`, évitant les conversions de type implicites source de bugs subtils ; `no-console: warn` signale (sans bloquer) l'utilisation de `console.log` oubliée, souvent un résidu de débogage.

```bash
npx eslint .
```

**Résultat attendu** : une liste des fichiers et lignes concernées par chaque règle violée, avec le niveau de sévérité (`error` bloque le build, `warning` signale sans bloquer).

## 24.2 Formatting : une mise en forme automatique et non négociable

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi automatiser le formatting plutôt que d'en discuter en revue</span>
Sans outil de formatage automatique, les discussions en pull request ("mets un espace ici", "cette indentation est incohérente") consomment un temps précieux sur des détails qui n'ont aucun impact fonctionnel. Un formateur automatique (comme Prettier) élimine complètement ce débat : le style est appliqué mécaniquement et identiquement pour toute l'équipe, laissant la revue de code (chapitre 8) se concentrer sur ce qui compte réellement — la logique, l'architecture, les risques.
</div>

```bash
npm install --save-dev prettier
npx prettier --write .
npx prettier --check .
```

**Explication :** `--write` reformate tous les fichiers automatiquement selon des règles cohérentes (indentation, guillemets, longueur de ligne) ; `--check` (utilisé en CI) vérifie que le code est **déjà** correctement formaté, sans le modifier, et échoue sinon — la différence entre corriger localement et vérifier en pipeline.

## 24.3 Analyse statique : au-delà du style

<div class="encadre retenir">
<span class="encadre-titre">📌 Ce que l'analyse statique détecte, que les tests ne détectent pas toujours</span>
Des outils d'analyse statique plus poussés (SonarQube, CodeQL de GitHub, ou des règles ESLint avancées orientées sécurité) détectent des motifs à risque même en l'absence de tout test qui les couvrirait explicitement : une variable potentiellement `null` utilisée sans vérification, une complexité cyclomatique excessive (une fonction avec trop de branches conditionnelles, difficile à tester et à maintenir), ou des vulnérabilités de sécurité connues dans le code lui-même (approfondi au chapitre 35).
</div>

```yaml
# Extrait de workflow GitHub Actions, analyse CodeQL
- name: Analyse CodeQL
  uses: github/codeql-action/analyze@v3
```

**Cas pratique DevOps :** CodeQL, intégré nativement à GitHub, analyse automatiquement le code à chaque pull request à la recherche de vulnérabilités connues (injections, désérialisation non sécurisée) — une première ligne de défense automatisée avant la revue humaine, approfondie dans une perspective plus large au chapitre 35 (DevSecOps).

## 24.4 Couverture de tests

```bash
npx jest --coverage
```

```text
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   78.4  |   65.2   |   82.1  |   79.0  |
 calculatrice.js      |   100   |   100    |   100   |   100   |
 utilisateur.service  |   62.5  |   45.0   |   70.0  |   63.1  |
----------------------|---------|----------|---------|---------|
```

**Explication du rapport :** "% Stmts" (statements) mesure le pourcentage de lignes de code réellement exécutées par au moins un test ; "% Branch" mesure le pourcentage de chemins conditionnels (if/else) couverts — souvent le chiffre le plus révélateur, une ligne peut être "exécutée" sans que toutes ses branches logiques ne l'aient été.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un seuil de couverture élevé n'est pas une fin en soi</span>
Comme signalé au chapitre 23 (section "En entreprise"), un pourcentage de couverture élevé ne garantit pas que les tests vérifient quelque chose de significatif — un test qui appelle une fonction sans jamais vérifier son résultat (<code>expect(true).toBe(true)</code>) compte comme "couverture" tout en n'apportant aucune vraie garantie. Utiliser la couverture comme un indicateur parmi d'autres, jamais comme objectif unique et suffisant.
</div>

```yaml
- run: npx jest --coverage --coverageThreshold='{"global":{"lines":70}}'
```

**Explication :** cette commande fait **échouer** le pipeline si la couverture globale descend sous 70% des lignes — un garde-fou minimal contre une régression de couverture, pas une garantie de qualité absolue.

## 24.5 Tout intégrer dans le pipeline

```yaml
jobs:
  qualite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Linting
        run: npx eslint .
      - name: Formatage
        run: npx prettier --check .
      - name: Tests avec couverture
        run: npx jest --coverage --coverageThreshold='{"global":{"lines":70}}'
```

**Explication :** ce job `qualite` s'ajoute (généralement en parallèle, chapitre 21) au job `test` du chapitre 22 — l'un vérifie le comportement (chapitre 23), l'autre la forme et les risques du code (ce chapitre), les deux devant réussir avant toute fusion (branche protégée, chapitre 8) ou déploiement (chapitre 20).

## Atelier — Durcir le pipeline avec les quatre contrôles

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 24.1 — Un job "qualité" complet sur ton projet</span>

**Objectif** : ajouter les quatre contrôles de ce chapitre au projet du chapitre 22.

**Étapes détaillées** :

1. Installe et configure ESLint (section 24.1), corrige les erreurs détectées sur le code existant.
2. Installe Prettier (section 24.2), formate le code existant, vérifie avec `--check`.
3. Ajoute la mesure de couverture (section 24.4) sur les tests déjà écrits au chapitre 23.
4. Ajoute le job `qualite` complet (section 24.5) au workflow existant.
5. Provoque volontairement une violation de chaque type (une variable inutilisée, un mauvais formatage, une baisse de couverture), observe le pipeline échouer précisément sur l'étape concernée.

**Résultat attendu** : un pipeline qui distingue clairement, dans ses logs, un échec de test (chapitre 23) d'un échec de qualité (ce chapitre) — deux lignes de défense complémentaires et bien identifiées.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Trop de règles de linting activées d'un coup sur un projet existant</span>
Activer d'un coup un jeu de règles très strict sur un gros projet existant peut générer des centaines d'erreurs immédiates, décourageant toute adoption réelle — introduire les règles progressivement, ou les limiter au nouveau code, est souvent plus réaliste qu'une bascule brutale.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre couverture de tests et qualité des tests</span>
Rappel de la section 24.4 : viser un pourcentage sans vérifier la pertinence réelle des assertions produit une fausse sécurité, potentiellement pire qu'une couverture plus faible mais honnête sur ce qu'elle vérifie réellement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Désactiver une règle gênante plutôt que corriger le code</span>
Ajouter un commentaire `// eslint-disable-next-line` pour faire taire un avertissement légitime, sans comprendre ni corriger la cause réelle, accumule une dette technique invisible — à réserver aux cas réellement justifiés et documentés, jamais par simple facilité.
</div>

## En entreprise

**Réalité répandue** : la configuration de linting et de formatage est souvent partagée à l'échelle d'une organisation entière (un fichier de configuration commun, réutilisé sur tous les projets) plutôt que réinventée à chaque nouveau dépôt — garantissant une cohérence de style même entre projets et équipes différentes.

**Bonne pratique répandue** : des outils comme Husky exécutent linting et formatage **avant même** qu'un commit ne soit créé (via un "pre-commit hook") — un retour encore plus rapide que la CI elle-même, appliquant concrètement le principe du "shift-left" (chapitre 2) au niveau le plus précoce possible.

**Erreur classique observée** : des règles de qualité de code strictement appliquées en CI, mais totalement absentes de l'environnement de développement local — chaque développeur découvre les violations seulement après avoir poussé son code, un retour bien plus lent que nécessaire.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre un linter et un formateur de code ?"**
Réponse attendue : un linter détecte des erreurs potentielles et des incohérences (parfois bloquantes) ; un formateur reformate mécaniquement le style du code (espaces, guillemets), éliminant les débats de style en revue de code (sections 24.1 et 24.2).

**Q2. "Pourquoi un taux de couverture de tests élevé ne garantit-il pas une bonne qualité de test ?"**
Réponse attendue : la couverture mesure le code exécuté par les tests, pas la pertinence des assertions qu'ils contiennent — un test peut "couvrir" du code sans vérifier de comportement significatif (section 24.4).

**Q3. "Comment intégrerais-tu ces contrôles de qualité dans un pipeline CI/CD ?"**
Réponse attendue : un job dédié (ou des étapes dans le job existant) exécutant linting, vérification de formatage et mesure de couverture, généralement en parallèle des tests fonctionnels, tous deux requis avant fusion via une branche protégée (section 24.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Une analyse statique orientée sécurité (comme CodeQL, section 24.3) détecte des classes entières de vulnérabilités avant même qu'un humain ne les repère en revue — une pièce importante, bien qu'insuffisante à elle seule, du dispositif DevSecOps approfondi au chapitre 35.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente les règles de linting volontairement désactivées, avec la raison précise (section "Erreurs fréquentes", erreur n°3) — une règle silencieusement contournée sans explication devient un piège pour la prochaine personne qui tente de la réactiver sans en comprendre l'historique.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Linting et formatage s'exécutent généralement en quelques secondes, bien plus vite que la suite de tests complète (chapitre 23) — les placer en première étape d'un job permet d'échouer vite sur les problèmes les plus simples, sans attendre l'exécution complète des tests.
</div>

## Résumé du chapitre

- Linting détecte des erreurs et incohérences sans exécuter le code ; formatage impose un style cohérent et automatique, éliminant les débats de style en revue.
- L'analyse statique (comme CodeQL) détecte des vulnérabilités potentielles même sans test dédié qui les couvrirait.
- La couverture de tests est un indicateur utile mais insuffisant seul — elle ne garantit pas la pertinence des assertions.
- Ces quatre contrôles s'intègrent naturellement dans le pipeline CI/CD, généralement en parallèle des tests fonctionnels du chapitre 23.
- Des outils comme Husky permettent d'appliquer ces contrôles dès le commit local, avant même la CI.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un linter, contrairement à un test :
   - a) Exécute le code pour vérifier son comportement
   - b) Analyse le code sans l'exécuter, à la recherche de motifs suspects
   - c) Ne sert à rien en pratique
   - d) Remplace entièrement les tests

2. `prettier --check .` (par rapport à `prettier --write .`) :
   - a) Modifie automatiquement les fichiers
   - b) Vérifie le formatage sans modifier les fichiers, adapté à un usage en CI
   - c) Supprime tous les fichiers mal formatés
   - d) N'a aucun effet

3. Un taux de couverture de tests élevé garantit :
   - a) Que tous les tests vérifient un comportement significatif
   - b) Uniquement que le code a été exécuté par au moins un test, pas la pertinence des assertions
   - c) L'absence totale de bugs
   - d) Une exécution plus rapide du pipeline

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Le formatage automatique élimine les débats de style en revue de code. — **Vrai** (section 24.2).
2. Désactiver une règle de linting gênante sans comprendre sa cause est une bonne pratique recommandée. — **Faux** (section "Erreurs fréquentes", erreur n°3).
3. L'analyse statique de sécurité peut détecter des vulnérabilités même sans test dédié qui les couvrirait. — **Vrai** (section 24.3).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.1</span>

Une pull request est bloquée car la couverture de tests est passée de 75% à 68% (sous le seuil de 70% configuré en CI). Le développeur propose simplement d'abaisser le seuil à 65% pour débloquer la fusion. Explique pourquoi ce n'est probablement pas la bonne réponse.
</div>

**Corrigé :** abaisser le seuil sans comprendre pourquoi la couverture a baissé traite le symptôme plutôt que la cause — cela pourrait masquer un nouveau code non testé qui introduit un vrai risque, ou tout simplement contourner l'intention même du garde-fou (section 24.4). La bonne réponse est d'investiguer quelles lignes de code récemment ajoutées ne sont pas couvertes, et d'ajouter les tests manquants correspondants avant de fusionner — le seuil ne devrait être ajusté qu'après une décision consciente et documentée, jamais comme réflexe automatique pour débloquer une pull request.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais configurer et exécuter un linter (ESLint ou équivalent).</li>
<li>☐ Je sais configurer et vérifier un formateur automatique (Prettier ou équivalent).</li>
<li>☐ Je comprends ce que l'analyse statique de sécurité détecte, au-delà du linting classique.</li>
<li>☐ Je sais mesurer et interpréter un rapport de couverture de tests, sans le confondre avec la qualité des tests.</li>
<li>☐ J'ai intégré ces quatre contrôles dans le pipeline CI/CD du chapitre 22.</li>
</ul>

## FAQ

<dl class="faq">
<dt>ESLint et Prettier peuvent-ils entrer en conflit ?</dt>
<dd>Oui, certaines règles de style d'ESLint peuvent contredire le formatage de Prettier. La pratique courante est de désactiver les règles de style d'ESLint qui chevauchent Prettier (via `eslint-config-prettier`), laissant chaque outil à son rôle propre : ESLint pour la détection d'erreurs, Prettier pour le style pur.</dd>

<dt>Quel seuil de couverture de tests viser ?</dt>
<dd>Il n'existe pas de seuil universel — 70-80% est une fourchette courante et raisonnable pour beaucoup de projets, mais la pertinence des tests (section 24.4) compte davantage que le chiffre exact atteint.</dd>

<dt>Ces outils existent-ils pour des langages autres que JavaScript ?</dt>
<dd>Oui, chaque écosystème a ses équivalents : `flake8`/`black` pour Python, `checkstyle`/`spotless` pour Java, `golangci-lint`/`gofmt` pour Go — les mêmes principes de ce chapitre s'appliquent, seuls les noms d'outils changent.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle ESLint : [https://eslint.org](https://eslint.org)
- Documentation officielle Prettier : [https://prettier.io](https://prettier.io)
- GitHub CodeQL — documentation officielle : [https://codeql.github.com](https://codeql.github.com)
- Husky — hooks Git pour exécuter des contrôles avant chaque commit : [https://typicode.github.io/husky/](https://typicode.github.io/husky/)

*Chapitre suivant : gestion des secrets — la Partie VIII s'ouvre. Ce qu'il ne faut jamais faire avec un mot de passe ou une clé API, et les solutions adaptées (GitHub Secrets, variables d'environnement, Docker secrets, secret managers).*
