<div class="chapitre-titre-num">CHAPITRE 22 · 🟠 AVANCÉ</div>

# Premier pipeline CI/CD complet

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Construire, avec tous les fichiers fournis intégralement, un pipeline CI/CD complet pour une vraie application Node.js : Push → Tests → Build → Docker Build → Docker Push → Deploy. Ce chapitre assemble tout ce qui a été appris depuis le chapitre 11 (Docker) en une seule chaîne automatisée fonctionnelle, le premier jalon complet de ce manuel.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Les chapitres 19 à 21 ont posé la théorie et l'outil (GitHub Actions). Ce chapitre les assemble en un pipeline qui fait exactement ce que le chapitre 20 (section 20.4) a schématisé : GitHub → Tests → Build → Docker image → Registry → Serveur → Deployment. C'est la première fois dans ce manuel qu'un `git push` déclenche, sans aucune intervention manuelle supplémentaire, un déploiement réel sur un serveur.
</div>

## 22.1 L'application de démonstration

```javascript
// index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.json({ message: 'Bonjour depuis le pipeline CI/CD' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));
```

```javascript
// index.test.js
const request = require('supertest');
const app = require('./app');

test('GET /health retourne 200', async () => {
  const reponse = await request(app).get('/health');
  expect(reponse.statusCode).toBe(200);
});
```

```json
// package.json
{
  "name": "demo-pipeline",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": { "express": "^4.19.0" },
  "devDependencies": { "jest": "^29.7.0", "supertest": "^7.0.0" }
}
```

## 22.2 Le Dockerfile (rappel du chapitre 12)

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "index.js"]
```

## 22.3 Le workflow complet

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [main]

env:
  IMAGE_NAME: ghcr.io/${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Connexion au registre GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Construire et pousser l'image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ env.IMAGE_NAME }}:${{ github.sha }}
            ${{ env.IMAGE_NAME }}:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://monsite.exemple.com
    steps:
      - name: Déployer sur le serveur via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVEUR_IP }}
          username: ${{ secrets.SERVEUR_UTILISATEUR }}
          key: ${{ secrets.SERVEUR_CLE_SSH }}
          script: |
            docker pull ${{ env.IMAGE_NAME }}:${{ github.sha }}
            docker stop demo-pipeline || true
            docker rm demo-pipeline || true
            docker run -d --name demo-pipeline -p 3000:3000 --restart unless-stopped \
              ${{ env.IMAGE_NAME }}:${{ github.sha }}
            sleep 5
            curl -f http://localhost:3000/health
```

**Explication des trois jobs :**

- **`test`** : reprend exactement le workflow du chapitre 21 (checkout, install, test).
- **`build-and-push`** (dépend de `test` via `needs`) : se connecte au registre GitHub Container Registry (chapitre 14) avec `secrets.GITHUB_TOKEN` (un jeton **automatiquement** fourni par GitHub à chaque exécution, jamais besoin de le créer manuellement) ; construit l'image et la pousse avec **deux tags** — `${{ github.sha }}` (l'identifiant unique et immuable de ce commit précis, chapitre 7) et `latest` — reliant directement le versionnage Git et Docker évoqué au chapitre 14 (section 14.3).
- **`deploy`** (dépend de `build-and-push`, protégé par un Environment `production` avec approbation possible, chapitre 21 section 21.5) : se connecte en SSH (chapitre 6) au serveur, récupère la nouvelle image taguée avec le SHA du commit (jamais `latest` seul, pour une traçabilité précise), remplace l'ancien conteneur, puis **vérifie** son bon fonctionnement avec `curl` sur `/health` — reprenant exactement `healthcheck.sh` du chapitre 10.

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Ce pipeline est la synthèse de neuf chapitres précédents</span>
`test` (chapitre 19, 21) → `build-and-push` (chapitres 12, 14, 21) → `deploy` (chapitres 6, 10, 20) : chaque ligne de ce fichier YAML a été expliquée dans un chapitre antérieur. Ce pipeline n'introduit aucun concept nouveau — il assemble, pour la première fois, tout ce qui a été appris séparément.
</div>

## 22.4 Secrets nécessaires

<div class="encadre securite">
<span class="encadre-titre">🔒 Secrets à configurer avant de pousser ce workflow</span>
Dans Settings → Secrets and variables → Actions du dépôt GitHub (chapitre 8, section 8.6) : <code>SERVEUR_IP</code> (l'adresse IP du serveur de laboratoire), <code>SERVEUR_UTILISATEUR</code> (le compte SSH dédié du chapitre 5), <code>SERVEUR_CLE_SSH</code> (la clé privée SSH du chapitre 6 — une clé dédiée à ce pipeline, distincte de ta clé personnelle, est une bonne pratique approfondie au chapitre 25). <code>secrets.GITHUB_TOKEN</code> n'a besoin d'aucune configuration : GitHub le génère automatiquement à chaque exécution.
</div>

## Atelier — Déclencher un vrai déploiement de bout en bout

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 22.1 — Du push au conteneur en production, sans aucune commande manuelle</span>

**Objectif** : vivre, sur ton propre dépôt et ton propre serveur de laboratoire, le pipeline complet de ce chapitre.

**Étapes détaillées** :

1. Crée un dépôt GitHub avec les fichiers des sections 22.1 et 22.2.
2. Configure les quatre secrets de la section 22.4.
3. Ajoute le workflow de la section 22.3, pousse sur `main`.
4. Observe, dans l'onglet Actions, les trois jobs s'exécuter dans l'ordre (`test` → `build-and-push` → `deploy`), ce dernier en attente si l'Environment `production` exige une approbation.
5. Une fois déployé, vérifie depuis ton navigateur ou `curl` que l'application tourne réellement sur le serveur, à la version exacte du dernier commit.
6. Modifie le message JSON retourné par `/`, commite, pousse : observe le pipeline complet se redéclencher et mettre à jour automatiquement le serveur.

**Résultat attendu** : une boucle complète et vérifiée — chaque `git push` sur `main` se traduit, en quelques minutes et sans aucune commande manuelle, par une nouvelle version en cours d'exécution sur le serveur de laboratoire.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier `permissions: packages: write`</span>
Sans cette ligne explicite, le job `build-and-push` peut échouer à pousser l'image vers GitHub Container Registry, les permissions par défaut du jeton `GITHUB_TOKEN` étant volontairement restrictives (principe du moindre privilège, chapitres 4, 5, 8).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Déployer avec `latest` plutôt que le SHA du commit</span>
Comme détaillé au chapitre 14 (section 14.3), utiliser uniquement `latest` dans l'étape `deploy` rend impossible de savoir précisément quelle version tourne réellement, et complique un futur rollback (chapitre 29) — ce pipeline utilise délibérément `${{ github.sha }}`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Pas de vérification finale après déploiement</span>
Sans le `curl -f http://localhost:3000/health` final, le pipeline pourrait se déclarer "réussi" alors que le nouveau conteneur a démarré mais ne répond pas réellement — la vérification finale, héritée directement de `healthcheck.sh` (chapitre 10), est ce qui transforme un simple redémarrage en un déploiement réellement vérifié.
</div>

## En entreprise

**Réalité répandue** : ce pipeline, bien que fonctionnel et représentatif, reste une version simplifiée de ce qu'on trouve en production dans des équipes plus matures — sans encore de stratégie de déploiement avancée (chapitre 28), de rollback automatique (chapitre 29), ni de monitoring continu (chapitre 32), tous abordés dans les chapitres suivants qui viennent enrichir cette base.

**Bonne pratique répandue** : de nombreuses équipes déploient d'abord vers un environnement de staging (chapitre 18) via un pipeline similaire mais séparé, avant de répliquer exactement ce même processus vers la production — réduisant le risque qu'un problème découvert en staging n'atteigne jamais les vrais utilisateurs.

**Erreur classique observée** : un premier pipeline CI/CD construit avec enthousiasme, jamais revu ni durci ensuite (pas de gestion d'échec partiel, pas de rollback), qui finit par causer un incident le jour où une étape échoue à mi-parcours dans un état inattendu — un rappel que ce chapitre est un point de départ solide, pas un aboutissement final.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Décris, étape par étape, un pipeline CI/CD complet que tu as construit ou pourrais construire."**
Réponse attendue : reprendre la structure de la section 22.3 — vérification (tests), construction et publication d'une image versionnée, déploiement avec vérification finale de bon fonctionnement (section 22.3 et 22.4).

**Q2. "Pourquoi taguer l'image avec le SHA du commit plutôt qu'uniquement `latest` ?"**
Réponse attendue : traçabilité précise de la version réellement déployée, essentielle pour un rollback rapide et fiable (section "Erreurs fréquentes", erreur n°2, lien avec le chapitre 14).

**Q3. "Comment ce pipeline vérifie-t-il qu'un déploiement a réellement réussi, pas seulement que les commandes se sont exécutées sans erreur ?"**
Réponse attendue : une vérification de santé finale (`curl` sur l'endpoint `/health`) après le redémarrage du conteneur, plutôt que de considérer le déploiement réussi simplement parce qu'aucune commande n'a levé d'erreur (section "Erreurs fréquentes", erreur n°3).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Utilise une clé SSH **dédiée** à ce pipeline (chapitre 6), avec des droits strictement limités à ce qui est nécessaire au déploiement — jamais ta clé SSH personnelle utilisée pour toutes tes connexions habituelles, une pratique de moindre privilège appliquée aux secrets d'automatisation.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Garde ce pipeline versionné et documenté comme n'importe quel autre code du projet (chapitre 7) — un `README.md` qui explique les secrets nécessaires et le fonctionnement général du pipeline fait gagner un temps précieux à toute nouvelle personne qui rejoint le projet.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Les trois jobs de ce pipeline s'enchaînent séquentiellement (via `needs`) parce que chacun dépend réellement du précédent — un exemple où la parallélisation (chapitre 21, section 21.4) ne serait pas pertinente, contrairement à des jobs véritablement indépendants.
</div>

## Résumé du chapitre

- Ce chapitre assemble neuf chapitres précédents en un pipeline CI/CD complet et fonctionnel : test, build-and-push, deploy.
- `GITHUB_TOKEN` est automatiquement fourni par GitHub Actions, sans configuration manuelle, pour authentifier l'accès au registre.
- Chaque image est taguée avec le SHA du commit, jamais uniquement `latest`, pour garantir une traçabilité précise.
- Le déploiement se termine toujours par une vérification de santé réelle, pas seulement l'absence d'erreur de commande.
- Ce pipeline est une base solide, appelée à être enrichie par les chapitres suivants (stratégies de déploiement, rollback, monitoring).

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `secrets.GITHUB_TOKEN` dans ce pipeline :
   - a) Doit être créé manuellement dans les paramètres du dépôt
   - b) Est automatiquement fourni par GitHub Actions à chaque exécution
   - c) N'existe pas dans GitHub Actions
   - d) Sert uniquement à envoyer des emails

2. Le job `deploy` de ce pipeline utilise l'image taguée avec :
   - a) Uniquement `latest`
   - b) Le SHA du commit (`github.sha`)
   - c) Un numéro aléatoire
   - d) Le nom du développeur

3. La dernière étape du script de déploiement sert à :
   - a) Supprimer l'ancienne image
   - b) Vérifier que l'application répond réellement après redémarrage
   - c) Envoyer une notification par email
   - d) Fermer la connexion SSH

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Sans `permissions: packages: write` explicite, la publication de l'image vers GitHub Container Registry peut échouer. — **Vrai** (section "Erreurs fréquentes", erreur n°1).
2. Ce pipeline est déjà complet et n'a besoin d'aucune amélioration future. — **Faux** (section "En entreprise").
3. Le job `deploy` peut être protégé par une approbation manuelle via un GitHub Environment. — **Vrai** (section 22.3).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.1</span>

Le script de déploiement de la section 22.3 utilise `docker stop` puis `docker rm` avant de relancer un nouveau conteneur. Explique le risque de cette approche (appelée stratégie "Recreate") en termes de disponibilité, et à quel chapitre ce sujet sera approfondi.
</div>

**Corrigé :** entre le moment où l'ancien conteneur est arrêté (`docker stop`) et celui où le nouveau démarre réellement et répond au healthcheck, l'application est totalement indisponible — une brève interruption de service à chaque déploiement. Cette stratégie ("Recreate") est la plus simple mais la moins tolérante aux interruptions ; le chapitre 28 (Stratégies de déploiement) présente des alternatives (Rolling, Blue/Green, Canary) qui éliminent ou réduisent cette fenêtre d'indisponibilité.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai construit un pipeline CI/CD complet avec trois jobs dépendants (test, build-and-push, deploy).</li>
<li>☐ Je sais configurer les secrets nécessaires à un déploiement SSH automatisé.</li>
<li>☐ Je comprends pourquoi taguer avec le SHA du commit plutôt qu'uniquement `latest`.</li>
<li>☐ J'ai vérifié, en conditions réelles, qu'un push déclenche un déploiement automatique complet.</li>
<li>☐ Je comprends la limite de ce pipeline (interruption brève à chaque déploiement) et je sais où elle sera résolue.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on utiliser Docker Hub plutôt que GitHub Container Registry dans ce pipeline ?</dt>
<dd>Oui, il suffit d'adapter l'étape de connexion (`docker/login-action`) avec les identifiants Docker Hub plutôt que `GITHUB_TOKEN`, et d'ajuster le nom de l'image en conséquence (chapitre 14).</dd>

<dt>Ce pipeline fonctionne-t-il aussi pour une application non-Node.js ?</dt>
<dd>Oui, la structure générale (test → build-and-push → deploy) reste identique — seules les étapes `test` (section 22.3) et le Dockerfile (chapitre 12) changent selon le langage, comme illustré avec les cinq langages du chapitre 12.</dd>

<dt>Faut-il obligatoirement une approbation manuelle sur le job `deploy` ?</dt>
<dd>Non, c'est optionnel et dépend du choix entre Continuous Delivery et Continuous Deployment (chapitre 20) — ce pipeline fonctionne dans les deux cas, avec ou sans règle de protection sur l'Environment `production`.</dd>
</dl>

## Références et pour aller plus loin

- `docker/build-push-action` — documentation officielle de l'action utilisée dans ce chapitre : [https://github.com/docker/build-push-action](https://github.com/docker/build-push-action)
- `appleboy/ssh-action` — documentation officielle de l'action de déploiement SSH : [https://github.com/appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- GitHub — authentification à GitHub Container Registry : [https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

*Chapitre suivant : tests automatisés — unitaires, intégration, API, end-to-end, et comment les intégrer efficacement dans le job `test` de ce pipeline.*
