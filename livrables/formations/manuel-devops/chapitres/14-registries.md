<div class="chapitre-titre-num">CHAPITRE 14 · 🟡 INTERMÉDIAIRE</div>

# Registries

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre le rôle d'un registre d'images Docker, publier une image sur Docker Hub, comprendre le système de tags et de versions, et mettre en place un registre privé pour des images qui ne doivent pas être publiques. Ce chapitre clôt la Partie V : les images construites au chapitre 12, orchestrées au chapitre 13, sont maintenant prêtes à être distribuées vers n'importe quel serveur, y compris ceux des chapitres suivants.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Une image construite sur ta machine locale (`docker build`) n'existe, par défaut, que sur cette machine. Pour qu'un serveur de production puisse l'utiliser, il faut un intermédiaire où la déposer et depuis lequel la récupérer — exactement le même besoin que GitHub pour le code (chapitre 8), mais pour des images Docker plutôt que pour du code source. C'est le rôle d'un registre.
</div>

## 14.1 Ce qu'est un registre, et pourquoi il en existe plusieurs

<div class="encadre retenir">
<span class="encadre-titre">📌 Registre, dépôt, tag : le vocabulaire</span>
Un <strong>registre</strong> (Docker Hub, GitHub Container Registry, un registre privé auto-hébergé) héberge des images. Un <strong>dépôt</strong> (<em>repository</em>) regroupe toutes les versions d'une même image (<code>ton-compte/mon-api</code>). Un <strong>tag</strong> identifie une version précise à l'intérieur de ce dépôt (<code>ton-compte/mon-api:1.2.0</code>, <code>ton-compte/mon-api:latest</code>).
</div>

| Registre | Caractéristique |
|---|---|
| **Docker Hub** | Le registre public par défaut, utilisé implicitement par `docker pull nginx` |
| **GitHub Container Registry (ghcr.io)** | Intégré à GitHub, pratique quand le code et les images vivent au même endroit (chapitre 21) |
| **Registre privé auto-hébergé** | Contrôle total, hébergé sur ton infrastructure (section 14.4) |
| **Registres cloud managés** | ECR (AWS), ACR (Azure), GCR (GCP) — approfondis en Partie XII |

## 14.2 Publier une image sur Docker Hub

```bash
docker login
```

**Résultat attendu** : une authentification réussie avec ton compte Docker Hub (créé gratuitement sur [hub.docker.com](https://hub.docker.com)).

```bash
docker build -t ton-compte/mon-api:1.0.0 .
docker push ton-compte/mon-api:1.0.0
```

**Explication :** le nom de l'image doit être **préfixé** par ton nom d'utilisateur (ou ton organisation) Docker Hub pour que `push` sache où l'envoyer ; `1.0.0` est le tag choisi, idéalement un numéro de version explicite plutôt que rien du tout.

```bash
# Sur un autre serveur
docker pull ton-compte/mon-api:1.0.0
docker run -d ton-compte/mon-api:1.0.0
```

**Résultat attendu** : l'image, construite sur ta machine locale, tourne maintenant sur un serveur totalement différent, sans jamais avoir eu besoin du code source ni d'un Dockerfile sur ce serveur — seulement l'image déjà construite.

## 14.3 Tags et versions : une discipline, pas une formalité

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le tag `latest` n'est pas ce qu'il semble être</span>
<code>latest</code> n'est <strong>pas</strong> automatiquement "la version la plus récente" au sens temporel — c'est simplement le tag par défaut utilisé si aucun tag n'est précisé, et n'importe quelle version peut être publiée sous ce nom, y compris par erreur une version plus ancienne. S'appuyer sur <code>latest</code> en production rend impossible de savoir précisément quelle version tourne réellement, et casse la reproductibilité (chapitre 1) : deux déploiements à des dates différentes avec <code>latest</code> peuvent utiliser deux versions différentes de l'image sans qu'on le sache.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — versionnage sémantique</span>
Adopter une convention comme <strong>SemVer</strong> (<em>Semantic Versioning</em>, <code>MAJEUR.MINEUR.CORRECTIF</code>) : incrémenter MAJEUR pour un changement incompatible, MINEUR pour une nouvelle fonctionnalité compatible, CORRECTIF pour une correction de bug. Publier systématiquement une image sous un tag de version précis (<code>1.2.3</code>), en plus, éventuellement, d'un tag <code>latest</code> qui pointe vers la dernière version stable — jamais <code>latest</code> comme <strong>seul</strong> tag utilisé en production.
</div>

```bash
docker tag ton-compte/mon-api:1.2.0 ton-compte/mon-api:latest
docker push ton-compte/mon-api:1.2.0
docker push ton-compte/mon-api:latest
```

**Cas pratique DevOps :** un pipeline CI/CD (chapitre 22) construit et publie automatiquement une image taguée avec le numéro de version issu d'un tag Git (chapitre 7, section 7.7) — le lien direct entre le tag Git du code source et le tag Docker de l'image qui en résulte, une pratique de traçabilité de bout en bout.

## 14.4 Registre privé auto-hébergé

Pour des images qui ne doivent jamais être publiques (code propriétaire, client spécifique), un registre privé auto-hébergé est une option simple :

```yaml
services:
  registry:
    image: registry:2
    ports:
      - "5000:5000"
    volumes:
      - donnees-registry:/var/lib/registry

volumes:
  donnees-registry:
```

```bash
docker compose up -d
docker tag mon-api:1.0.0 localhost:5000/mon-api:1.0.0
docker push localhost:5000/mon-api:1.0.0
docker pull localhost:5000/mon-api:1.0.0
```

**Explication :** l'image officielle `registry:2` est elle-même un registre Docker complet, exécutable en un conteneur ; préfixer le nom de l'image par l'adresse du registre (`localhost:5000/`) indique à Docker où pousser/récupérer, exactement comme le préfixe `ton-compte/` pour Docker Hub.

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — un registre privé sans HTTPS refuse de fonctionner par défaut</span>
Docker refuse, par défaut, de communiquer avec un registre qui n'est pas en HTTPS, sauf exception explicite ("insecure registry") réservée à un usage strictement local de test. Un registre privé accessible depuis plusieurs serveurs doit être protégé par HTTPS (chapitre 16) et une authentification, jamais exposé nu sur Internet.
</div>

## Atelier — Publier et récupérer une image sur un registre privé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 14.1 — Cycle complet push/pull</span>

**Objectif** : vérifier concrètement qu'une image publiée sur un registre peut être récupérée et exécutée indépendamment de la machine qui l'a construite.

**Étapes détaillées** :

1. Sur ton serveur de laboratoire, lance un registre privé local avec le fichier Compose de la section 14.4.
2. Construis une petite image de test (`docker build -t test-app:1.0.0 .`), tague-la pour le registre local, pousse-la.
3. Supprime l'image locale (`docker rmi test-app:1.0.0` et `docker rmi localhost:5000/test-app:1.0.0`).
4. Récupère-la depuis le registre (`docker pull localhost:5000/test-app:1.0.0`), lance-la, vérifie qu'elle fonctionne.

**Résultat attendu** : la preuve concrète que l'image survit à sa suppression locale, tant qu'elle reste disponible sur le registre — le mécanisme exact qui permettra, au chapitre 22, à un pipeline CI/CD de construire une image sur un serveur temporaire et de la rendre disponible pour un déploiement ailleurs.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Déployer uniquement avec `latest`</span>
Comme détaillé en section 14.3, un déploiement basé uniquement sur `latest` rend impossible de savoir précisément quelle version tourne, et complique énormément un rollback précis (chapitre 29, qui a justement besoin de connaître la version précédente exacte).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Publier une image contenant des secrets</span>
Une image Docker peut être inspectée couche par couche — un secret copié puis supprimé dans une instruction ultérieure du Dockerfile reste souvent récupérable dans l'historique des couches. Ne jamais intégrer un secret dans une image, quelle que soit sa visibilité (chapitre 25).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Registre privé sans authentification, exposé sur Internet</span>
Un registre privé mal sécurisé (sans authentification, sans HTTPS) accessible publiquement expose potentiellement du code propriétaire à quiconque connaît son adresse — un registre privé mérite la même rigueur de sécurité qu'un serveur de production (Partie VIII).
</div>

## En entreprise

**Réalité répandue** : la plupart des équipes utilisent le registre intégré à leur plateforme CI/CD (GitHub Container Registry pour GitHub Actions, chapitre 21) plutôt que de gérer un registre séparé — moins de pièces mobiles, authentification déjà en place.

**Bonne pratique répandue** : des politiques de rétention automatique suppriment les vieilles images non utilisées (par exemple, garder seulement les 10 dernières versions d'une branche de développement) pour éviter que le registre ne grossisse indéfiniment.

**Erreur classique observée** : des images poussées sans jamais être nettoyées, accumulant des téraoctets de versions obsolètes jamais utilisées, avec un coût de stockage cloud qui grandit silencieusement.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi éviter de déployer uniquement avec le tag `latest` ?"**
Réponse attendue : `latest` ne garantit aucune traçabilité de version réelle, rend un rollback précis difficile, et casse la reproductibilité d'un déploiement (section 14.3).

**Q2. "Comment lierais-tu le versionnage Git et le versionnage des images Docker ?"**
Réponse attendue : tague l'image Docker avec le même numéro de version que le tag Git du code source qui l'a produite, généralement automatisé dans un pipeline CI/CD (section 14.3, approfondi au chapitre 22).

**Q3. "Pourquoi un registre privé doit-il être en HTTPS ?"**
Réponse attendue : Docker refuse par défaut les registres non-HTTPS, et un registre exposé sans chiffrement risquerait la confidentialité du code et une possible altération des images en transit (section 14.4).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un dépôt d'image privé (pas seulement un registre privé, mais la visibilité du dépôt lui-même sur Docker Hub ou ghcr.io) protège du code propriétaire — vérifier systématiquement la visibilité choisie avant le premier `push`.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente, dans le `README.md` du projet, la convention de tags utilisée (SemVer, ou toute autre) — une équipe qui applique des conventions différentes selon la personne qui publie perd rapidement toute lisibilité sur les versions réellement déployées.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le cache de build du chapitre 12 se combine avec le cache de couches d'un registre : `docker push` ne retransmet que les couches réellement modifiées, pas l'image entière à chaque fois — un gain de temps direct sur des images fréquemment republiées.
</div>

## Résumé du chapitre

- Un registre héberge des images ; un dépôt regroupe les versions d'une même image ; un tag identifie une version précise.
- `docker login`, `docker tag`, `docker push`/`pull` couvrent le cycle complet de publication et récupération.
- `latest` n'est pas fiable comme seule référence de version en production — un versionnage sémantique explicite est recommandé.
- Un registre privé auto-hébergé (image `registry:2`) convient pour des images qui ne doivent jamais être publiques, à condition d'être protégé par HTTPS et une authentification.
- Une image ne doit jamais contenir de secret, quelle que soit sa visibilité.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le tag `latest` signifie :
   - a) Toujours la version la plus récente publiée dans le temps
   - b) Simplement le tag par défaut utilisé si aucun n'est précisé, sans garantie temporelle
   - c) Une version certifiée stable
   - d) Une image supprimée automatiquement après 30 jours

2. Un registre privé Docker, par défaut, refuse de fonctionner sans :
   - a) Une carte graphique dédiée
   - b) HTTPS (sauf exception explicite "insecure registry" pour un usage local de test)
   - c) Une connexion à Docker Hub
   - d) Kubernetes

3. Un secret copié dans une image puis supprimé dans une instruction ultérieure du Dockerfile :
   - a) Disparaît définitivement de l'image
   - b) Peut souvent rester récupérable dans l'historique des couches
   - c) Est automatiquement chiffré
   - d) Bloque la construction de l'image

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une image doit obligatoirement être préfixée par un nom d'utilisateur ou d'organisation pour être poussée sur Docker Hub. — **Vrai** (section 14.2).
2. Un registre privé auto-hébergé élimine tout besoin de sécurité supplémentaire. — **Faux** (section 14.4 et erreurs fréquentes).
3. Le versionnage sémantique (SemVer) distingue changements majeurs, mineurs et correctifs. — **Vrai** (section 14.3).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Une équipe publie systématiquement ses images uniquement sous le tag `latest`, sans autre version. Explique en 3-4 phrases pourquoi cette pratique deviendra un problème le jour où elle devra effectuer un rollback (chapitre 29) après un déploiement défaillant.
</div>

**Corrigé (exemple de réponse) :** sans tag de version précis, il est impossible de savoir quelle image exacte tournait avant le dernier déploiement problématique — `latest` a été réécrit à chaque publication, écrasant toute trace de la version précédente. Un rollback nécessiterait alors de reconstruire manuellement l'ancienne version à partir de l'historique Git (chapitre 7), en espérant que le code corresponde exactement à ce qui tournait réellement, une opération lente et risquée en pleine incident. Un tag de version explicite à chaque publication (section 14.3) aurait permis un rollback immédiat en redéployant simplement l'image du tag précédent.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends la différence entre registre, dépôt et tag.</li>
<li>☐ Je sais publier une image sur Docker Hub (`login`, `tag`, `push`).</li>
<li>☐ Je comprends pourquoi `latest` seul est insuffisant en production.</li>
<li>☐ Je sais mettre en place un registre privé auto-hébergé avec l'image `registry:2`.</li>
<li>☐ Je sais qu'un secret dans une image reste potentiellement récupérable même après suppression apparente.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Docker Hub gratuit suffit-il pour ce manuel ?</dt>
<dd>Oui, largement. Les dépôts publics sont gratuits sans limite significative pour un usage d'apprentissage ; les dépôts privés gratuits sont limités en nombre sur le plan gratuit, mais suffisants pour les projets de ce manuel.</dd>

<dt>Faut-il toujours un registre séparé de GitHub ?</dt>
<dd>Non. GitHub Container Registry (ghcr.io) permet de garder code et images au même endroit, avec la même authentification — souvent le choix le plus simple une fois GitHub Actions en place (chapitre 21).</dd>

<dt>Combien de temps garder les anciennes versions d'une image ?</dt>
<dd>Il n'existe pas de règle universelle, mais garder au minimum les dernières versions déployées en production (pour un rollback rapide, chapitre 29) est un minimum raisonnable, au-delà duquel une politique de rétention automatique évite l'accumulation indéfinie (section "En entreprise").</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Docker Hub : [https://docs.docker.com/docker-hub/](https://docs.docker.com/docker-hub/)
- GitHub Container Registry — documentation officielle : [https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- Semantic Versioning — spécification officielle : [https://semver.org](https://semver.org)
- Documentation officielle du registre open source auto-hébergeable : [https://distribution.github.io/distribution/](https://distribution.github.io/distribution/)

*Chapitre suivant : Nginx — serveur web, reverse proxy, load balancing. La Partie VI commence, et les architectures Docker Compose de ce chapitre vont enfin être exposées correctement au monde extérieur.*
