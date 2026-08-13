<div class="chapitre-titre-num">CHAPITRE 53 · 🔴 PROFESSIONNEL</div>

# Projet final : pipeline CI/CD

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Automatiser entièrement le déploiement manuel du chapitre 52 : CI (tests, qualité) et CD (build, publication, déploiement) pour GestionTâches. Ce chapitre couvre les phases 12-13 du projet final, transformant la procédure manuelle en un pipeline complet, exactement la même progression que les chapitres 26 puis 27 pour le reste de ce manuel.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le chapitre 52 a démontré, une fois, que GestionTâches peut être déployée manuellement. Répéter cette procédure à chaque changement de code serait lent et source d'erreur — exactement le problème que ce manuel résout depuis le chapitre 19. Ce chapitre construit le pipeline complet qui rendra chaque `git push` sur `main` capable de mettre à jour automatiquement l'application en production, avec toute la rigueur déjà appliquée au chapitre 22.
</div>

## 53.1 Le workflow complet

```yaml
# .github/workflows/deploy.yml
name: CI/CD GestionTâches

on:
  push:
    branches: [main]

env:
  IMAGE_API: ghcr.io/${{ github.repository }}-api
  IMAGE_FRONTEND: ghcr.io/${{ github.repository }}-frontend

jobs:
  qualite-et-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: gestiontaches_test
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm", cache-dependency-path: api/package-lock.json }
      - working-directory: api
        run: npm ci
      - working-directory: api
        run: npx eslint .
      - working-directory: api
        run: npm test
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/gestiontaches_test

  build-and-push:
    needs: qualite-et-tests
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: docker/build-push-action@v6
        with:
          context: ./api
          push: true
          tags: "${{ env.IMAGE_API }}:${{ github.sha }}"
      - uses: docker/build-push-action@v6
        with:
          context: ./frontend
          push: true
          tags: "${{ env.IMAGE_FRONTEND }}:${{ github.sha }}"

  migrer-la-base:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: { name: production }
    steps:
      - uses: actions/checkout@v4
      - name: Appliquer les migrations en production
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVEUR_IP }}
          username: ${{ secrets.SERVEUR_UTILISATEUR }}
          key: ${{ secrets.SERVEUR_CLE_SSH }}
          script: |
            cd /home/deploiement/gestiontaches
            docker compose run --rm api node run-migrations.js

  deploy:
    needs: migrer-la-base
    runs-on: ubuntu-latest
    environment: { name: production, url: "https://gestiontaches.exemple.com" }
    steps:
      - name: Déployer sur le VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVEUR_IP }}
          username: ${{ secrets.SERVEUR_UTILISATEUR }}
          key: ${{ secrets.SERVEUR_CLE_SSH }}
          script: |
            cd /home/deploiement/gestiontaches
            docker pull ${{ env.IMAGE_API }}:${{ github.sha }}
            docker pull ${{ env.IMAGE_FRONTEND }}:${{ github.sha }}
            sed -i "s|image: .*api.*|image: ${{ env.IMAGE_API }}:${{ github.sha }}|" docker-compose.override.yml
            sed -i "s|image: .*frontend.*|image: ${{ env.IMAGE_FRONTEND }}:${{ github.sha }}|" docker-compose.override.yml
            docker compose up -d
            sleep 5
            curl -f http://localhost:8080/api/health

      - name: Vérifier la santé publique
        run: |
          sleep 10
          curl -f https://gestiontaches.exemple.com/api/health
```

**Explication des quatre jobs :** `qualite-et-tests` reprend exactement le chapitre 30 (section 30.5) — un vrai PostgreSQL de test via `services`, migrations et tests exécutés dans un environnement propre à chaque exécution (chapitre 19, section 19.2) ; `build-and-push` construit et publie **deux** images distinctes (API et frontend), chacune taguée avec le SHA du commit (chapitre 14, section 14.3) ; `migrer-la-base` (nouveau par rapport au chapitre 27, absent des projets précédents de ce manuel) applique explicitement les migrations en production, séparément du déploiement applicatif — une étape distincte volontaire, approfondie en section 53.2 ; `deploy` reprend exactement le chapitre 27 (section 27.2), avec une vérification finale sur le domaine public réel.

## 53.2 Pourquoi une migration séparée du déploiement

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Rappel direct du chapitre 30</span>
Le chapitre 30 (section 30.2, pattern expand/contract) a expliqué pourquoi une migration de schéma doit rester compatible avec l'ancienne <strong>et</strong> la nouvelle version du code pendant une transition. En séparant explicitement <code>migrer-la-base</code> de <code>deploy</code>, ce pipeline rend visible et auditable chaque étape — une migration peut être revue et éventuellement retardée indépendamment du déploiement du nouveau code, plutôt que les deux actions couplées silencieusement dans une seule étape opaque, comme c'était implicitement le cas avec le montage <code>/docker-entrypoint-initdb.d</code> du chapitre 51 (réservé au développement local, jamais à la production, rappel du chapitre 51 section "En entreprise").
</div>

```javascript
// api/run-migrations.js
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function appliquerMigrations() {
  const fichiers = fs.readdirSync(path.join(__dirname, 'migrations')).sort();
  for (const fichier of fichiers) {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', fichier), 'utf8');
    await pool.query(sql);
    console.log(`Migration appliquée : ${fichier}`);
  }
  process.exit(0);
}

appliquerMigrations().catch((erreur) => {
  console.error('Échec de migration :', erreur);
  process.exit(1);
});
```

**Cas pratique DevOps :** ce script minimal reprend le principe du chapitre 30 (section 30.1) — chaque migration exécutée une fois, dans l'ordre du nom de fichier ; en production réelle, un outil de migration dédié (comme `node-pg-migrate`, déjà mentionné au chapitre 30) suivrait aussi quelles migrations ont déjà été appliquées, pour ne jamais rejouer une migration déjà exécutée.

## Atelier — Le pipeline complet en conditions réelles

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 53.1 — Du push à la production, entièrement automatisé</span>

**Objectif** : automatiser complètement le déploiement manuel du chapitre 52.

**Étapes détaillées** :

1. Ajoute `docker-compose.override.yml` minimal (juste les tags d'image à surcharger) au serveur de production, configuré au chapitre 52.
2. Configure les secrets GitHub nécessaires (`SERVEUR_IP`, `SERVEUR_UTILISATEUR`, `SERVEUR_CLE_SSH`, chapitre 22 section 22.4).
3. Ajoute le workflow complet de la section 53.1 au dépôt.
4. Pousse un changement de code sur `main` (par exemple, une nouvelle route ou un ajustement mineur du frontend), observe les quatre jobs s'exécuter dans l'ordre.
5. Vérifie sur `https://gestiontaches.exemple.com` que le changement est bien visible, sans avoir touché le serveur manuellement.

**Résultat attendu** : la boucle complète, entièrement automatisée — du `git push` initial jusqu'à la vérification sur le domaine public réel, exactement l'objectif de l'atelier 27.1, appliqué cette fois au projet fil rouge construit depuis le chapitre 50.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Migrations et déploiement couplés dans une seule étape opaque</span>
Rappel de la section 53.2 : séparer explicitement ces deux étapes rend le pipeline plus auditable et permet de retarder une migration risquée indépendamment du reste du déploiement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier `cache-dependency-path` avec plusieurs `package.json`</span>
Ce projet a deux `package.json` distincts (api et frontend) — sans préciser explicitement le chemin du fichier de verrouillage concerné (`cache-dependency-path`, section 53.1), le cache npm de GitHub Actions (chapitre 21, section 21.2) pourrait ne pas fonctionner correctement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Vérifier la santé uniquement sur `localhost`, jamais sur le domaine public</span>
Rappel direct du chapitre 27 (section "Erreurs fréquentes", erreur n°2) — la vérification finale de ce pipeline (section 53.1, dernière étape) porte volontairement sur `https://gestiontaches.exemple.com`, pas seulement `localhost:8080`.
</div>

## En entreprise

**Réalité répandue** : les projets avec plusieurs composants distincts (API et frontend séparés, comme GestionTâches) construisent presque toujours des jobs de build distincts pour chacun, comme dans ce chapitre — permettant, par exemple, de ne reconstruire que le composant réellement modifié, une optimisation possible mais non implémentée ici par souci de simplicité pédagogique.

**Bonne pratique répandue** : les migrations de production, même automatisées, restent souvent accompagnées d'une étape d'approbation manuelle (chapitre 21, section 21.5) sur les projets les plus critiques — un compromis entre l'automatisation complète et la prudence face aux changements de schéma, cohérent avec le chapitre 30 (section "En entreprise").

**Erreur classique observée** : des pipelines qui fonctionnent parfaitement pendant des mois puis échouent au premier changement de schéma un peu plus complexe, faute d'avoir jamais testé le chemin de migration en conditions automatisées avant ce moment précis — un rappel direct du chapitre 46 (scénario 37).

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi séparer l'étape de migration de base de données de l'étape de déploiement applicatif dans un pipeline CI/CD ?"**
Réponse attendue : rendre chaque étape auditable indépendamment, et permettre de retarder ou d'examiner une migration risquée sans bloquer ou coupler artificiellement le déploiement du code (section 53.2).

**Q2. "Comment gérerais-tu le cache npm dans un pipeline avec plusieurs `package.json` (par exemple, une API et un frontend séparés) ?"**
Réponse attendue : préciser explicitement `cache-dependency-path` pour chaque job concerné, afin que GitHub Actions sache quel fichier de verrouillage surveiller pour l'invalidation du cache (section 53.1, erreur fréquente n°2).

**Q3. "Comment ce pipeline garantit-il qu'un déploiement est réellement réussi, pas seulement que les commandes se sont exécutées sans erreur ?"**
Réponse attendue : une vérification de santé finale sur le domaine public réel, après le redémarrage des conteneurs, reprenant le principe déjà établi au chapitre 22 et au chapitre 27 (section 53.1, dernière étape).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les mêmes secrets (`SERVEUR_IP`, `SERVEUR_UTILISATEUR`, `SERVEUR_CLE_SSH`) déjà établis au chapitre 22 s'appliquent ici avec la même rigueur — une clé SSH dédiée à ce pipeline, jamais la clé personnelle (chapitre 22, section "Sécurité").
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
`run-migrations.js` (section 53.2), bien que minimal, est lui-même testé (chapitre 23) avant d'être utilisé en production — un script d'infrastructure mérite la même rigueur que le reste du code applicatif.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Deux images construites en parallèle (implicitement, via deux étapes `build-push-action` dans le même job, section 53.1) plutôt qu'en jobs séparés reste un compromis simple pour ce projet à deux composants — une optimisation par parallélisation de jobs distincts (chapitre 21, section 21.4) serait pertinente pour un projet avec davantage de composants indépendants.
</div>

## Résumé du chapitre

- Le pipeline complet de GestionTâches assemble quatre jobs : qualité/tests, build-and-push (deux images), migration de base de données, déploiement.
- La migration de production est explicitement séparée du déploiement applicatif, pour rester auditable et retardable indépendamment.
- Le cache npm nécessite une configuration explicite du chemin de verrouillage avec plusieurs `package.json` dans un même projet.
- La vérification finale porte toujours sur le domaine public réel, jamais seulement sur `localhost`.
- Ce chapitre transforme entièrement en automatisation la procédure manuelle du chapitre 52, exactement la progression déjà vécue aux chapitres 26-27.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pourquoi séparer l'étape de migration de celle de déploiement dans ce pipeline ?
   - a) Pour ralentir le pipeline sans raison
   - b) Pour rendre chaque étape auditable et pouvoir retarder une migration risquée indépendamment
   - c) Ce n'est jamais recommandé de les séparer
   - d) Parce que Docker l'exige techniquement

2. Avec deux `package.json` distincts dans un projet, le cache npm nécessite :
   - a) Aucune configuration particulière
   - b) `cache-dependency-path` précisé explicitement pour chaque job
   - c) La suppression de l'un des deux fichiers
   - d) Un compte GitHub différent

3. La vérification finale du pipeline de ce chapitre porte sur :
   - a) Uniquement `localhost` sur le serveur
   - b) Le domaine public réel, `https://gestiontaches.exemple.com`
   - c) Aucune vérification n'est effectuée
   - d) Le registre d'images uniquement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une migration de production automatisée peut, sur des projets critiques, rester accompagnée d'une approbation manuelle. — **Vrai** (section "En entreprise").
2. `run-migrations.js`, même minimal, devrait être testé comme n'importe quel autre code du projet. — **Vrai** (section "Maintenabilité").
3. Le montage `/docker-entrypoint-initdb.d` du chapitre 51 est la méthode utilisée pour appliquer les migrations en production dans ce chapitre. — **Faux** (section 53.2, une méthode explicite et distincte est utilisée en production).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 53.1</span>

Un déploiement échoue à l'étape `migrer-la-base`, avant même d'atteindre l'étape `deploy`. Explique pourquoi cette séparation en jobs distincts (`needs`) est précieuse dans ce scénario précis.
</div>

**Corrigé :** grâce à `needs: migrer-la-base` sur le job `deploy` (section 53.1), l'échec de la migration empêche automatiquement le déploiement du nouveau code applicatif de se produire — évitant qu'une nouvelle version de l'API, potentiellement incompatible avec l'ancien schéma de base de données (chapitre 30, section 30.2), ne soit déployée sur une base dont la migration attendue n'a jamais réellement réussi. Sans cette séparation explicite en jobs dépendants, un pipeline qui continuerait malgré l'échec de la migration risquerait de déployer une version de code qui suppose un schéma qui n'existe pas encore — exactement le type d'incident catalogué au chapitre 46 (scénario 38, connexion refusée après un déploiement).

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai construit un pipeline avec quatre jobs distincts : qualité/tests, build-and-push, migration, déploiement.</li>
<li>☐ Mon pipeline construit et publie deux images distinctes (API et frontend), chacune taguée avec le SHA du commit.</li>
<li>☐ La migration de base de données est explicitement séparée du déploiement applicatif.</li>
<li>☐ Le cache npm fonctionne correctement malgré les deux `package.json` distincts du projet.</li>
<li>☐ La vérification finale du pipeline porte sur le domaine public réel.</li>
<li>☐ J'ai vérifié, en conditions réelles, qu'un push sur `main` déploie automatiquement GestionTâches sans intervention manuelle.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours une base de données de test distincte de la base de production dans le pipeline ?</dt>
<dd>Oui, systématiquement — le `service: postgres` du job `qualite-et-tests` (section 53.1) est entièrement séparé et jetable, jamais la vraie base de production, exactement le principe déjà établi au chapitre 23 (section 23.3).</dd>

<dt>Ce pipeline gère-t-il un rollback en cas d'échec de déploiement ?</dt>
<dd>Pas encore explicitement dans ce chapitre — le chapitre 56 (panne, rollback et documentation) ajoutera précisément ce mécanisme au projet final, reprenant le principe déjà construit au chapitre 29.</dd>

<dt>Pourquoi ne pas simplement remonter à `docker compose build` directement sur le serveur, comme au chapitre 52 ?</dt>
<dd>Construire l'image directement sur le serveur de production consommerait ses ressources pour la construction (chapitre 12) plutôt que pour servir de vraies requêtes, et rendrait chaque déploiement plus lent et moins reproductible qu'une image déjà construite et testée en CI, puis simplement récupérée en production (chapitre 14).</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 14, 19, 20, 21, 22, 23, 27, 30.

*Chapitre suivant : projet final, monitoring et sauvegardes — donner à GestionTâches une vraie observabilité et une stratégie de sauvegarde complète, phases 14 et 15 du projet.*
