<div class="chapitre-titre-num">CHAPITRE 40</div>

# Docker en pratique : Dockerfile, volumes et réseaux

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Passer de l'usage d'images existantes (chapitre 39) à la construction de sa propre image via un Dockerfile, comprendre pourquoi les données d'un conteneur disparaissent à sa suppression sans un volume, et faire communiquer deux conteneurs entre eux via un réseau Docker. À la fin de ce chapitre, tu sauras conteneuriser une application complète avec sa base de données, en respectant les bonnes pratiques de sécurité déjà établies dans ce manuel.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Convaincu par les explications du chapitre 39, le développeur du portail client souhaite maintenant conteneuriser réellement son application Node.js, plutôt que de continuer à l'installer manuellement sur chaque serveur (chapitre 15). Il te pose deux questions concrètes : <em>"Comment je construis une image qui contient mon code, pas seulement Nginx tout seul ? Et si je conteneurise aussi PostgreSQL, est-ce que je ne vais pas perdre toutes mes données à chaque fois que je redémarre le conteneur ?"</em> Ce chapitre répond aux deux questions, en construisant progressivement l'architecture conteneurisée complète du portail.
</div>

## 40.1 Le Dockerfile : construire sa propre image

Un **Dockerfile** est un fichier texte décrivant, étape par étape, comment construire une image Docker — exactement le même besoin que les commandes d'installation manuelles du chapitre 15, mais capturées dans un fichier reproductible plutôt qu'exécutées à la main à chaque fois.

```dockerfile
# Dockerfile pour l'application Node.js du portail client
FROM node:20-slim

# Definir le repertoire de travail a l'interieur de l'image
WORKDIR /app

# Copier d'abord les fichiers de dependances seuls (voir section 40.3
# pour l'optimisation que cet ordre precis permet)
COPY package*.json ./
RUN npm install --production

# Copier le reste du code applicatif
COPY . .

# Documenter le port utilise par l'application (n'ouvre rien
# automatiquement, une information pour quiconque lit ce Dockerfile)
EXPOSE 3000

# Commande executee au demarrage du conteneur
CMD ["node", "server.js"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication des instructions clés</span>
<code>FROM</code> définit l'image de base (ici, une version officielle de Node.js — rappel du chapitre 39 sur les images officielles). <code>WORKDIR</code> définit le répertoire de travail à l'intérieur de l'image. <code>COPY</code> copie des fichiers depuis la machine qui construit l'image vers l'image elle-même. <code>RUN</code> exécute une commande pendant la construction (ici, l'installation des dépendances, rappel du chapitre 15). <code>CMD</code> définit la commande exécutée quand un conteneur démarre à partir de cette image.
</div>

```
# Construire l'image a partir du Dockerfile present dans le
# repertoire courant
docker build -t portail-client:1.0 .

# Lancer un conteneur a partir de cette image nouvellement construite
docker run -d -p 3000:3000 --name portail portail-client:1.0
```

## 40.2 Bonnes pratiques Dockerfile : rappels directs de chapitres précédents

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — ne jamais coder un secret en dur dans un Dockerfile</span>
Rappel direct du chapitre 20 (scripts Bash) : un mot de passe ou une clé d'API écrit directement dans un Dockerfile est visible par quiconque a accès à l'image ou à son historique de construction, exactement le même risque que pour un script versionné dans Git. Les secrets doivent être injectés au moment de l'exécution du conteneur (variables d'environnement, ou un gestionnaire de secrets dédié approfondi en Partie 9), jamais figés dans l'image elle-même.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — ne jamais exécuter un conteneur en tant que root par défaut</span>
Rappel direct du chapitre 16 (systemd, directive <code>User=</code>) : un conteneur qui tourne en tant que root, sans raison spécifique, s'expose au même risque déjà expliqué pour un service systemd — en cas de compromission de l'application, un accès root offre un impact disproportionné. Un Dockerfile bien conçu crée et utilise un utilisateur dédié à privilèges limités :
</div>

```dockerfile
# Ajout a la fin du Dockerfile precedent : creer et utiliser un
# utilisateur dedie plutot que de rester en root par defaut
RUN adduser --disabled-password --gecos "" appuser
USER appuser
CMD ["node", "server.js"]
```

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — l'ordre des instructions COPY compte réellement</span>
Copier d'abord `package*.json` seul, installer les dépendances, puis copier le reste du code (comme dans le Dockerfile de la section 40.1) exploite le système de cache de Docker : si seul le code applicatif change (pas les dépendances), Docker réutilise la couche déjà construite de l'installation des dépendances, accélérant considérablement les reconstructions successives — un gain de temps concret et cumulatif pour une équipe qui reconstruit l'image plusieurs fois par jour pendant le développement.
</div>

## 40.3 Le piège de la persistance : répondre à la seconde question du développeur

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rappel direct de la FAQ du chapitre 39</span>
Par défaut, toutes les données créées à l'intérieur d'un conteneur (comme les tables et enregistrements d'une base PostgreSQL) résident dans la couche d'écriture temporaire du conteneur — supprimées définitivement dès que le conteneur lui-même est supprimé. C'est exactement l'inquiétude légitime du développeur dans le scénario d'ouverture, et exactement le problème que les **volumes** résolvent.
</div>

## 40.4 Les volumes : faire persister les données

```
# Creer un volume nomme, gere par Docker
docker volume create donnees-portail-db

# Lancer PostgreSQL en montant ce volume sur le repertoire ou
# PostgreSQL stocke reellement ses donnees
docker run -d --name portail-db \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/db-password \
  -v donnees-portail-db:/var/lib/postgresql/data \
  postgres:16
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un **volume** existe indépendamment du cycle de vie d'un conteneur précis — supprimer le conteneur PostgreSQL et en recréer un nouveau, en remontant le même volume, restaure immédiatement l'accès à toutes les données précédentes. C'est la réponse directe à la question du développeur : les données ne sont jamais perdues, à condition qu'elles soient explicitement stockées dans un volume plutôt que dans la couche temporaire du conteneur lui-même.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — remarque sur `POSTGRES_PASSWORD_FILE`</span>
L'exemple ci-dessus utilise <code>POSTGRES_PASSWORD_FILE</code> plutôt qu'une variable d'environnement <code>POSTGRES_PASSWORD</code> directe — un mot de passe passé en variable d'environnement reste visible via <code>docker inspect</code> ou dans les journaux système, alors qu'un fichier de secret monté séparément (approche approfondie en Partie 9 avec des gestionnaires de secrets dédiés) réduit cette exposition, exactement le même souci de protection des secrets déjà évoqué en section 40.2.
</div>

## 40.5 Les réseaux Docker : faire communiquer deux conteneurs

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque conteneur est isolé par défaut, exactement comme prévu par les namespaces (chapitre 39)</span>
Deux conteneurs lancés indépendamment ne peuvent pas se joindre l'un l'autre par défaut — un **réseau Docker** dédié doit être créé pour leur permettre de communiquer, l'application du portail devant atteindre sa base de données PostgreSQL.
</div>

```
# Creer un reseau Docker dedie a l'application portail
docker network create reseau-portail

# Relancer les deux conteneurs sur ce meme reseau, en utilisant
# --network plutot que les options par defaut
docker run -d --name portail-db --network reseau-portail \
  -v donnees-portail-db:/var/lib/postgresql/data postgres:16

docker run -d --name portail --network reseau-portail \
  -p 3000:3000 portail-client:1.0
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — la résolution de noms automatique entre conteneurs</span>
Sur un réseau Docker dédié, les conteneurs peuvent se joindre par leur **nom** plutôt que par une adresse IP — l'application du portail peut se connecter à sa base de données simplement en la désignant comme `portail-db` dans sa configuration de connexion, sans jamais avoir besoin de connaître ou de coder en dur une adresse IP susceptible de changer, un écho direct à la résolution DNS déjà expliquée en profondeur au chapitre 9, appliquée ici à l'échelle d'un réseau Docker local.
</div>

## Atelier — Conteneuriser complètement le portail client

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 40 — Assembler Dockerfile, volume et réseau</span>

**Objectif** : construire une architecture conteneurisée complète du portail client, répondant aux deux questions du scénario d'ouverture.

**Préparation** : accès à un environnement Docker de test, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Identifie les trois éléments distincts nécessaires pour que l'architecture soit à la fois fonctionnelle et fiable (rappel des sections 40.1, 40.4 et 40.5).
2. Explique pourquoi l'ordre de création (réseau, puis volume, puis conteneurs) est logique.
3. Propose une réponse claire aux deux questions initiales du développeur.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : les trois éléments sont un Dockerfile pour construire l'image de l'application (section 40.1), un volume pour la persistance des données PostgreSQL (section 40.4), et un réseau Docker dédié pour la communication entre les deux conteneurs (section 40.5). L'ordre logique découle de la dépendance : le réseau et le volume doivent exister avant de lancer les conteneurs qui vont les utiliser. La réponse au développeur : son propre code est bien inclus dans l'image via le Dockerfile (pas seulement Nginx) ; ses données PostgreSQL ne seront jamais perdues tant qu'elles résident dans le volume nommé, indépendant du cycle de vie du conteneur lui-même.

**Dépannage** : si les deux conteneurs ne parviennent pas à communiquer malgré le réseau créé, vérifie qu'ils utilisent bien exactement le même nom de réseau (`--network reseau-portail` sur les deux commandes) — une faute de frappe ou un oubli sur l'un des deux conteneurs les laisserait sur des réseaux distincts, reproduisant le problème d'isolation par défaut.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — oublier un volume pour des données à conserver</span>
Rappel de la section 40.3 : exactement l'inquiétude légitime du scénario d'ouverture — sans volume explicite, toute donnée disparaît à la suppression du conteneur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — coder un secret en dur dans le Dockerfile</span>
Rappel de la section 40.2 : un secret figé dans l'image devient visible par quiconque a accès à cette image, un risque de sécurité direct.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — laisser un conteneur tourner en root sans raison</span>
Rappel de la section 40.2 : le même principe de moindre privilège déjà établi tout au long de ce manuel, appliqué ici à l'utilisateur d'exécution à l'intérieur du conteneur.
</div>

## Diagnostiquer une perte de données après redémarrage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les données d'une base de données conteneurisée disparaissent après un redémarrage du conteneur</span>

- **Diagnostic** : vérifier si un volume a réellement été monté sur le répertoire de données du conteneur, ou si les données résidaient uniquement dans la couche d'écriture temporaire par défaut (section 40.3).
- **Comment vérifier** : `docker inspect nom-du-conteneur` révèle les montages configurés — l'absence d'un montage vers le répertoire de données attendu confirme immédiatement l'hypothèse.
- **Résolution** : recréer le conteneur avec un volume correctement monté (section 40.4) — malheureusement, les données déjà perdues d'un conteneur précédent sans volume ne peuvent généralement pas être récupérées après coup, une raison supplémentaire de configurer les volumes dès la conception initiale plutôt qu'en réaction à une perte déjà survenue.
</div>

## En entreprise

- **Bonne pratique répandue** : versionner les Dockerfile dans le même dépôt Git que le code applicatif (rappel du chapitre 20), garantissant que l'image et le code qu'elle contient restent toujours synchronisés.
- **Bonne pratique répandue** : documenter (chapitre 3) quels volumes contiennent des données critiques nécessitant une stratégie de sauvegarde dédiée (rappel du chapitre 30) — un volume Docker n'est pas automatiquement sauvegardé, il mérite la même rigueur que tout autre stockage de données critique.
- **Erreur classique observée** : une base de données conteneurisée en production sans volume correctement configuré, découverte seulement après une perte de données lors d'une mise à jour de routine de l'image — un incident totalement évitable avec la discipline de ce chapitre.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi les données d'un conteneur disparaissent-elles à sa suppression, sauf configuration particulière ?"**
Réponse attendue : les données créées à l'intérieur d'un conteneur résident par défaut dans sa couche d'écriture temporaire, propre à ce conteneur précis — un volume Docker doit être explicitement monté pour que les données persistent indépendamment du cycle de vie du conteneur.

**Q2. "Pourquoi l'ordre des instructions COPY dans un Dockerfile peut-il affecter significativement le temps de construction ?"**
Réponse attendue : Docker met en cache chaque couche construite ; copier d'abord les fichiers de dépendances (qui changent rarement) avant d'installer ces dépendances, puis copier le reste du code (qui change souvent) permet de réutiliser le cache des couches de dépendances lors des reconstructions ultérieures si seul le code applicatif a changé.

**Q3. "Comment deux conteneurs peuvent-ils communiquer entre eux, alors que chacun est isolé par défaut ?"**
Réponse attendue : en les rattachant à un même réseau Docker dédié, créé explicitement — sur ce réseau, les conteneurs peuvent se joindre par leur nom grâce à la résolution DNS automatique fournie par Docker, sans nécessiter de coder en dur une adresse IP.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'écris jamais un secret directement dans un Dockerfile ; utilise systématiquement un utilisateur non-root dans l'image finale — les deux réflexes de sécurité les plus importants de ce chapitre, directement transposés de principes déjà établis aux chapitres 16 et 20.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) l'architecture de conteneurs de chaque application — quelles images, quels volumes, quels réseaux — une information indispensable pour toute personne reprenant la maintenance de l'application conteneurisée après toi.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Structure ton Dockerfile pour exploiter le cache de construction (section 40.2) — un réflexe simple qui accélère considérablement les itérations de développement quotidiennes, un gain cumulatif important sur la durée d'un projet.
</div>

## Résumé du chapitre

- Un Dockerfile décrit, étape par étape, comment construire une image Docker personnalisée, reproductible et versionnable.
- Les secrets ne doivent jamais être codés en dur dans un Dockerfile ; un conteneur ne devrait jamais tourner en root sans raison spécifique.
- Sans volume explicite, les données créées dans un conteneur disparaissent à sa suppression — un volume Docker fait persister les données indépendamment du cycle de vie du conteneur.
- Un réseau Docker dédié permet à plusieurs conteneurs de communiquer entre eux par leur nom, grâce à une résolution DNS automatique.
- L'ordre des instructions dans un Dockerfile affecte directement l'efficacité du cache de construction, un gain de temps cumulatif significatif.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un Dockerfile sert à :
   - a) Exécuter un conteneur existant
   - b) Décrire, étape par étape, comment construire une image Docker personnalisée
   - c) Sauvegarder automatiquement un conteneur
   - d) Configurer un réseau physique

2. Sans volume explicite, les données créées dans un conteneur :
   - a) Sont automatiquement sauvegardées
   - b) Disparaissent à la suppression du conteneur
   - c) Sont répliquées sur tous les autres conteneurs
   - d) Deviennent immédiatement en lecture seule

3. Deux conteneurs peuvent communiquer par leur nom si :
   - a) Ils partagent le même Dockerfile
   - b) Ils sont rattachés à un même réseau Docker dédié
   - c) Ils utilisent la même image
   - d) Ils sont lancés en tant que root

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un secret codé en dur dans un Dockerfile reste invisible dans l'image finale. — **Faux** (il reste visible par quiconque a accès à l'image ou à son historique, section 40.2).
2. Un conteneur devrait, par bonne pratique, s'exécuter avec un utilisateur dédié plutôt qu'en root. — **Vrai**.
3. Un volume Docker est automatiquement sauvegardé par Docker lui-même. — **Faux** (il nécessite une stratégie de sauvegarde dédiée, comme tout autre stockage de données critique).
4. L'ordre des instructions COPY dans un Dockerfile peut affecter significativement le temps de reconstruction de l'image. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi `POSTGRES_PASSWORD_FILE` est préférable à `POSTGRES_PASSWORD` directement en variable d'environnement.
2. Reprends le scénario d'ouverture. Explique en 3-4 phrases comment tu répondrais aux deux questions du développeur, en une explication claire et non technique.

**Corrigé 1** : une variable d'environnement classique reste visible via des commandes comme `docker inspect`, potentiellement dans les journaux système, ou par quiconque a accès à la configuration du conteneur — un risque d'exposition du mot de passe. Un fichier de secret monté séparément réduit cette surface d'exposition, en ne rendant le secret accessible qu'au processus qui le lit réellement, un principe qui rejoint directement la protection des secrets déjà évoquée au chapitre 20 pour les scripts.

**Corrigé 2** : je lui expliquerais que le Dockerfile inclut désormais son propre code applicatif dans l'image (pas seulement Nginx tout seul comme avant), garantissant que l'application se comporte exactement de la même façon partout où cette image est lancée. Pour ses données PostgreSQL, je lui montrerais que le volume Docker fonctionne comme un disque externe branché au conteneur : le conteneur peut être supprimé et recréé autant de fois que nécessaire, les données du volume restent intactes tant que ce volume lui-même n'est pas explicitement supprimé.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.1</span>

Un Dockerfile copie tout le code de l'application (`COPY . .`) avant d'installer les dépendances (`RUN npm install`). Explique pourquoi cet ordre est moins efficace que celui présenté en section 40.1, en termes de temps de reconstruction.
</div>

**Corrigé :** Avec cet ordre inversé, chaque modification du code applicatif (même une modification mineure sans rapport avec les dépendances) invalide le cache de la couche `COPY . .`, forçant Docker à réexécuter également `npm install` à chaque reconstruction — même si les dépendances elles-mêmes n'ont pas changé. L'ordre recommandé (copier d'abord les fichiers de dépendances, les installer, puis copier le reste du code, section 40.2) permet à Docker de réutiliser la couche d'installation des dépendances tant qu'elles ne changent pas, accélérant considérablement les reconstructions fréquentes pendant le développement itératif.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.2</span>

Rédige, en 3 à 5 phrases, pourquoi documenter quels volumes Docker contiennent des données critiques (chapitre 3) est particulièrement important dans une infrastructure conteneurisée, comparé à une infrastructure traditionnelle sur serveurs physiques ou VM.
</div>

**Corrigé (exemple de réponse) :** Dans une infrastructure conteneurisée, les conteneurs eux-mêmes sont conçus pour être éphémères et facilement recréés — une pratique courante qui peut faire perdre de vue, sans documentation explicite, que certaines données stockées dans des volumes spécifiques nécessitent absolument une stratégie de sauvegarde dédiée. Sans cette documentation claire, une personne moins familière avec l'architecture pourrait supprimer un volume par erreur en pensant qu'il s'agit simplement d'un artefact temporaire lié à un conteneur, causant une perte de données irréversible qui aurait été évitée par une simple annotation claire dans la CMDB indiquant la criticité réelle de ce volume précis.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire un Dockerfile pour construire une image personnalisée.</li>
<li>☐ Je comprends pourquoi ne jamais coder un secret en dur dans un Dockerfile.</li>
<li>☐ Je sais pourquoi et comment utiliser un utilisateur non-root dans un conteneur.</li>
<li>☐ Je comprends pourquoi les données d'un conteneur disparaissent à sa suppression sans volume.</li>
<li>☐ Je sais créer et monter un volume Docker pour la persistance des données.</li>
<li>☐ Je sais créer un réseau Docker pour permettre à deux conteneurs de communiquer par leur nom.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on monter un dossier de l'hôte directement dans un conteneur, plutôt qu'un volume nommé ?</dt>
<dd>Oui, via un "bind mount" (montage direct d'un chemin de l'hôte) — utile pour le développement (voir immédiatement les changements de code sans reconstruire l'image), mais un volume nommé, géré entièrement par Docker, reste généralement préférable en production pour sa portabilité et sa gestion simplifiée.</dd>

<dt>Combien de conteneurs peuvent partager le même volume ?</dt>
<dd>Plusieurs conteneurs peuvent monter le même volume simultanément, mais attention aux accès concurrents en écriture selon le type de données stockées — certaines applications (comme une base de données) ne sont pas conçues pour un accès simultané par plusieurs instances au même stockage sous-jacent, un point à vérifier selon le logiciel concerné.</dd>

<dt>Faut-il créer un réseau Docker distinct pour chaque application, ou un seul réseau partagé pour toute l'infrastructure ?</dt>
<dd>Un réseau dédié par application (comme dans l'exemple de ce chapitre) est généralement recommandé pour l'isolation — un principe qui rejoint directement l'esprit de la segmentation réseau plus large déjà évoquée au chapitre 26 (Zero Trust), limitant l'exposition mutuelle entre applications qui n'ont pas besoin de communiquer entre elles.</dd>

<dt>Comment mettre à jour une application conteneurisée sans perdre ses données ?</dt>
<dd>Reconstruire une nouvelle image avec le code mis à jour, puis supprimer l'ancien conteneur et en lancer un nouveau à partir de cette nouvelle image, en remontant le même volume de données — le volume, indépendant du cycle de vie du conteneur (section 40.4), survit naturellement à ce remplacement.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Docker — Bonnes pratiques pour l'écriture de Dockerfile : [https://docs.docker.com/build/building/best-practices/](https://docs.docker.com/build/building/best-practices/)
- Documentation officielle Docker — Volumes : [https://docs.docker.com/storage/volumes/](https://docs.docker.com/storage/volumes/)
- Documentation officielle Docker — Réseaux : [https://docs.docker.com/network/](https://docs.docker.com/network/)

*Chapitre suivant : Docker Compose — orchestrer plusieurs conteneurs (application, base de données, et plus) à partir d'un seul fichier de configuration, plutôt que d'enchaîner manuellement des commandes `docker run` individuelles.*
