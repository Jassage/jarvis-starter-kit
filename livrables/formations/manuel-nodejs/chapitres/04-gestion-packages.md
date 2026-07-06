<div class="chapitre-titre-num">CHAPITRE 4</div>

# Gestion des packages

## Objectifs pédagogiques

Approfondir la gestion des dépendances au-delà de l'installation de base : audit de sécurité, mise à jour maîtrisée, dépendances peer, et organisation dans un monorepo.

## 4.1 Auditer les vulnérabilités connues

```
$ npm audit

# npm audit report

json5  <2.2.2
Severity: moderate
Prototype Pollution in JSON5 - GHSA-9c47-m6qq-7p4h
fix available via `npm audit fix`

2 vulnerabilities (1 moderate, 1 high)
```

```
$ npm audit fix          # applique automatiquement les correctifs compatibles (mise à jour mineure/patch)
$ npm audit fix --force  # applique MÊME les correctifs nécessitant une montée de version majeure (risqué)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ npm audit fix --force peut casser l'application</span>
`--force` accepte de faire monter une dépendance vers une version majeure potentiellement **incompatible** avec le reste du code (rappel du semver, chapitre 3). Toujours tester l'application après un `npm audit fix --force`, jamais l'exécuter en confiance aveugle juste avant un déploiement.
</div>

## 4.2 Mettre à jour ses dépendances de façon maîtrisée

```
$ npm outdated

Package   Current  Wanted  Latest
express     4.18.2  4.19.2   5.0.0

$ npm update          # met à jour vers la version la plus récente AUTORISÉE par package.json (^4.x.x)
$ npm install express@latest  # force la dernière version, MÊME majeure (à faire consciemment)
```

`npm outdated` distingue trois colonnes : **Current** (version actuellement installée), **Wanted** (la plus récente respectant la plage semver de `package.json`), **Latest** (la toute dernière publiée, même si elle nécessiterait une modification de `package.json`).

## 4.3 Dépendances peerDependencies

```json
{
  "name": "mon-plugin-express",
  "peerDependencies": {
    "express": "^4.0.0"
  }
}
```

Une **peerDependency** signale qu'un paquet **attend** qu'une certaine version d'un autre paquet soit déjà installée par le projet **hôte**, sans l'installer lui-même — utile pour les plugins/extensions (par exemple, un middleware Express qui suppose que le projet installe déjà Express lui-même, évitant d'avoir deux copies différentes d'Express installées en parallèle).

## 4.4 Organisation d'un fichier .env et des scripts (aperçu, détaillé au chapitre 12)

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon --env-file=.env src/index.js",
  "test": "NODE_ENV=test jest",
  "migrate": "npx prisma migrate dev",
  "seed": "node prisma/seed.js"
}
```

## 4.5 Dépendances optionnelles et dépendances transitives

<div class="encadre astuce">
<span class="encadre-titre">💡 Le "arbre de dépendances" : pourquoi node_modules devient si volumineux</span>
Chaque paquet installé peut lui-même dépendre d'autres paquets (ses propres dépendances, dites "transitives"). `express`, par exemple, dépend d'une dizaine d'autres petits paquets. C'est pourquoi `node_modules/` grandit rapidement même avec peu de dépendances directes — npm résout et installe automatiquement tout cet arbre complet.
</div>

```
$ npm ls express        # affiche express ET la chaîne de dépendances qui y mènent
$ npm ls --depth=0       # n'affiche que les dépendances DIRECTES du projet (le plus lisible au quotidien)
```

## 4.6 Nettoyer un projet

```
$ rm -rf node_modules package-lock.json
$ npm install
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Quand faire un nettoyage complet</span>
Face à des erreurs d'installation étranges ou incohérentes (souvent après un changement de branche Git avec des dépendances différentes), supprimer entièrement `node_modules/` et `package-lock.json` puis relancer `npm install` "à froid" résout la majorité des problèmes de dépendances corrompues ou mal résolues.
</div>

## 4.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ignorer les avertissements npm audit pendant des mois</span>
Une vulnérabilité connue non corrigée reste une porte ouverte, particulièrement si le paquet concerné traite des entrées utilisateur ou de l'authentification. Intégrer `npm audit` dans le pipeline CI/CD (chapitre 39) permet de détecter ces vulnérabilités **avant** qu'elles ne s'accumulent silencieusement.
</div>

## 4.8 Résumé du chapitre

- `npm audit`/`npm audit fix` détectent et corrigent les vulnérabilités connues des dépendances ; `--force` doit rester une décision consciente, jamais automatique.
- `npm outdated` distingue version installée, souhaitable (selon semver) et la toute dernière disponible.
- Les `peerDependencies` signalent une attente de version côté projet hôte, sans installation automatique.
- Un nettoyage complet (`node_modules` + `package-lock.json` supprimés, puis `npm install`) résout la majorité des incohérences de dépendances.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Sur un projet existant, exécute `npm audit`, `npm outdated` et `npm ls --depth=0`. Pour chaque vulnérabilité modérée ou faible détectée, applique `npm audit fix` (sans `--force`) et vérifie que le projet démarre toujours normalement ensuite.
</div>

**Corrigé (démarche attendue) :** `npm audit` liste les vulnérabilités avec leur sévérité ; `npm audit fix` applique les correctifs compatibles avec le semver actuel de `package.json` ; relancer les tests (chapitre 29) ou démarrer l'application confirme l'absence de régression avant de commiter le `package-lock.json` mis à jour.

*Chapitre suivant : l'architecture d'un projet Node.js professionnel, dossier par dossier.*
