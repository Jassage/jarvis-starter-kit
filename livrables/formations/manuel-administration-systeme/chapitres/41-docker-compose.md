<div class="chapitre-titre-num">CHAPITRE 41</div>

# Docker Compose

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Remplacer l'enchaînement manuel de commandes `docker run`, `docker volume create` et `docker network create` du chapitre 40 par un seul fichier déclaratif — Docker Compose. À la fin de ce chapitre, tu sauras écrire un fichier `docker-compose.yml` complet pour une application multi-conteneurs, gérer la configuration via des variables d'environnement, et éviter le piège classique de `depends_on`, souvent mal compris.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un collègue du développeur, chargé de relancer l'environnement du portail après une mise à jour, oublie l'option `--network` sur l'une des deux commandes `docker run` du chapitre 40 — l'application et sa base de données se retrouvent sur des réseaux Docker différents, incapables de communiquer, et personne ne comprend immédiatement pourquoi "ça marchait hier". <em>"Il doit y avoir un moyen de ne pas avoir à retaper ces commandes à la main à chaque fois, avec le risque d'en oublier une,"</em> constate le développeur. C'est exactement le rôle de Docker Compose — l'objet de ce chapitre, qui transforme la suite de commandes manuelles du chapitre 40 en un seul fichier fiable et reproductible.
</div>

## 41.1 Le problème des commandes manuelles répétées

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — la recette de cuisine écrite vs les instructions retenues de mémoire</span>
Enchaîner manuellement plusieurs commandes `docker run`, `docker network create` et `docker volume create` à chaque redémarrage ressemble à préparer un plat compliqué uniquement de mémoire, sans jamais l'écrire — fonctionnel tant que la même personne s'en souvient parfaitement, mais fragile dès qu'une étape est oubliée ou qu'une autre personne doit reproduire exactement la même recette. Docker Compose est la recette écrite : un seul fichier qui décrit l'ensemble de l'architecture, exécutable de façon identique par n'importe qui, à chaque fois.
</div>

## 41.2 `docker-compose.yml` : toute l'architecture en un seul fichier

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_HOST: db
    depends_on:
      - db
    networks:
      - reseau-portail

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db-password
    secrets:
      - db-password
    volumes:
      - donnees-portail-db:/var/lib/postgresql/data
    networks:
      - reseau-portail

volumes:
  donnees-portail-db:

networks:
  reseau-portail:

secrets:
  db-password:
    file: ./db-password.txt
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce fichier capture exactement l'architecture du chapitre 40</span>
Chaque élément construit manuellement au chapitre précédent trouve sa place déclarative ici : le Dockerfile (via <code>build: .</code>), le volume nommé pour la persistance des données PostgreSQL (section 40.4), le réseau dédié permettant aux deux conteneurs de communiquer par leur nom (section 40.5), et même la gestion du secret de mot de passe via un fichier plutôt qu'une variable en clair (section 40.4). Plus aucune commande à retaper de mémoire, plus aucun risque d'oublier une option comme <code>--network</code>.
</div>

## 41.3 Le cycle de vie complet en une seule commande

```
# Demarrer l'ensemble de l'architecture (construit l'image si
# necessaire, cree les volumes et reseaux, lance les conteneurs)
docker compose up -d

# Arreter et supprimer les conteneurs, en conservant les volumes
# (les donnees ne sont jamais perdues par cette commande)
docker compose down

# Consulter les journaux de l'ensemble des services simultanement
docker compose logs -f
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — `docker compose down` sans `-v` préserve les données</span>
Rappel direct du chapitre 40 : les volumes existent indépendamment du cycle de vie des conteneurs. `docker compose down` supprime les conteneurs et le réseau, mais **conserve** les volumes par défaut — un comportement rassurant qui répond directement à l'inquiétude du développeur au chapitre précédent. Supprimer réellement les volumes nécessite l'option explicite `-v`, un geste volontaire et jamais accidentel par défaut.
</div>

## 41.4 Variables d'environnement et fichiers `.env` : rappel direct du chapitre 12

```
# Fichier .env, JAMAIS committe dans Git (rappel direct du .gitignore
# deja pratique au chapitre 20 pour les secrets de script)
DATABASE_HOST=db
APP_PORT=3000
```

```yaml
# Reference dans docker-compose.yml
services:
  app:
    ports:
      - "${APP_PORT}:3000"
    environment:
      DATABASE_HOST: ${DATABASE_HOST}
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le même principe que les variables d'environnement du chapitre 12</span>
Exactement le même mécanisme déjà expliqué au chapitre 12 pour séparer la configuration du code : un fichier `.env` garde la configuration spécifique à un environnement (développement, test, production) hors du fichier `docker-compose.yml` lui-même, qui reste identique et versionnable dans Git — jamais de valeur sensible ou spécifique à un environnement codée en dur dans le fichier compose partagé par toute l'équipe.
</div>

## 41.5 Le piège classique de `depends_on`

<div class="encadre attention">
<span class="encadre-titre">⚠️ `depends_on` contrôle l'ordre de démarrage, pas la disponibilité réelle du service</span>
C'est l'un des malentendus les plus fréquents et les plus documentés autour de Docker Compose : `depends_on: - db` garantit que le conteneur `db` **démarre** avant le conteneur `app`, mais ne garantit absolument pas que PostgreSQL soit réellement **prêt à accepter des connexions** au moment où l'application tente de s'y connecter — un serveur de base de données peut mettre plusieurs secondes à devenir opérationnel après le démarrage de son processus. Une application qui tente de se connecter immédiatement peut donc échouer, malgré un `depends_on` apparemment correct.
</div>

```yaml
# Une solution robuste : une verification de sante (healthcheck)
# explicite, que "depends_on" peut alors attendre reellement
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build: .
    depends_on:
      db:
        condition: service_healthy
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — combiner `depends_on` avec une vérification de santé</span>
La condition `service_healthy` (plutôt qu'un simple `depends_on` par défaut) attend réellement que le healthcheck du service `db` confirme sa disponibilité effective avant de démarrer `app` — la solution robuste au piège de la section 41.5, bien plus fiable qu'un simple ordre de démarrage séquentiel qui ne tient pas compte du temps réel d'initialisation du service.
</div>

## 41.6 Docker Compose comme documentation vivante

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Un rappel direct du chapitre 3</span>
Un fichier `docker-compose.yml` bien structuré documente, par sa seule existence, l'architecture complète d'une application — quels services, quelles dépendances entre eux, quels volumes, quels réseaux — exactement le type de documentation vivante recherchée depuis le chapitre 3, mais qui a l'avantage supplémentaire d'être directement exécutable, ne pouvant donc jamais devenir aussi obsolète qu'un document écrit séparément du code qu'il décrit.
</div>

## Atelier — Convertir les commandes du chapitre 40 en Compose

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 41 — Éliminer le risque d'oubli du scénario d'ouverture</span>

**Objectif** : traduire les commandes manuelles du chapitre 40 en un fichier `docker-compose.yml` complet et fiable.

**Préparation** : accès à un environnement Docker de test, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Identifie chaque commande manuelle du chapitre 40 (création du réseau, création du volume, lancement de chaque conteneur) et son équivalent déclaratif dans un fichier Compose.
2. Ajoute une vérification de santé (`healthcheck`) pour le service de base de données, en t'appuyant sur la section 41.5.
3. Explique pourquoi cette version élimine spécifiquement le risque qui a causé l'incident du scénario d'ouverture.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le fichier reprend la structure de la section 41.2, avec l'ajout du `healthcheck` de la section 41.5. Ce fichier élimine le risque de l'incident d'ouverture car le réseau `reseau-portail` est automatiquement créé et attaché aux deux services par Docker Compose lui-même, à chaque exécution de `docker compose up` — il devient structurellement impossible d'oublier d'attacher un des deux services au réseau, contrairement à une commande manuelle où cette étape peut être omise par erreur humaine.

**Dépannage** : si l'application échoue toujours à se connecter à la base de données malgré `depends_on`, vérifie que la condition `service_healthy` est bien utilisée plutôt qu'un simple `depends_on` par défaut (section 41.5) — l'erreur la plus fréquente à ce stade est de croire que `depends_on` seul suffit à garantir la disponibilité réelle du service.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — supposer que `depends_on` seul garantit la disponibilité du service</span>
Exactement le piège classique et bien documenté de la section 41.5 — une source très fréquente de bugs intermittents difficiles à diagnostiquer sans en connaître la cause précise.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — committer un fichier `.env` contenant des secrets dans Git</span>
Rappel direct du chapitre 20 : le fichier `.env` doit systématiquement figurer dans `.gitignore`, exactement comme tout fichier de configuration contenant des informations sensibles ou spécifiques à un environnement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — utiliser `docker compose down -v` sans réfléchir</span>
Rappel de la section 41.3 : l'option `-v` supprime aussi les volumes, donc les données qu'ils contiennent — une commande à utiliser consciemment, jamais par réflexe ou par habitude d'un autre contexte.
</div>

## Diagnostiquer une application qui démarre avant que sa base de données soit prête

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : l'application échoue à se connecter à la base de données au premier démarrage, malgré `depends_on`</span>

- **Diagnostic** : exactement le piège de la section 41.5 — `depends_on` sans condition de santé garantit uniquement l'ordre de démarrage des processus, pas la disponibilité réelle du service de base de données.
- **Comment vérifier** : `docker compose logs db` révèle généralement si PostgreSQL était encore en cours d'initialisation au moment où l'application a tenté sa première connexion.
- **Résolution** : ajouter un `healthcheck` au service de base de données et utiliser `condition: service_healthy` (section 41.5) plutôt qu'un `depends_on` simple, garantissant une attente réelle de disponibilité plutôt qu'un simple ordre de lancement des processus.
</div>

## En entreprise

- **Bonne pratique répandue** : versionner le fichier `docker-compose.yml` dans le même dépôt Git que le code applicatif (rappel du chapitre 20), garantissant que l'architecture décrite reste toujours synchronisée avec le code qu'elle orchestre.
- **Bonne pratique répandue** : utiliser des fichiers `.env` distincts par environnement (développement, test, production), jamais un seul fichier `.env` générique partagé entre tous les contextes.
- **Erreur classique observée** : une équipe qui découvre le piège de `depends_on` uniquement après plusieurs incidents intermittents en production, plutôt que de connaître cette limitation dès le départ et d'implémenter systématiquement des healthchecks appropriés.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quel problème Docker Compose résout-il par rapport à des commandes `docker run` individuelles ?"**
Réponse attendue : Compose déclare l'ensemble de l'architecture (services, volumes, réseaux) dans un seul fichier reproductible, éliminant le risque d'erreur humaine lié à l'exécution manuelle répétée de plusieurs commandes distinctes, et servant simultanément de documentation vivante de l'architecture.

**Q2. "Pourquoi `depends_on` seul ne garantit-il pas qu'un service dépendant soit réellement prêt ?"**
Réponse attendue : `depends_on` contrôle uniquement l'ordre de démarrage des conteneurs, pas le temps réel d'initialisation interne d'un service (comme une base de données qui met du temps à devenir opérationnelle après le lancement de son processus) — une vérification de santé (`healthcheck`) combinée à `condition: service_healthy` est nécessaire pour une attente réellement fiable.

**Q3. "Comment gérer différemment la configuration entre un environnement de développement et de production avec Docker Compose ?"**
Réponse attendue : via des fichiers `.env` distincts par environnement, référencés dans le même fichier `docker-compose.yml` versionné — le fichier Compose reste identique et partagé, seule la configuration spécifique à l'environnement change, exactement le même principe déjà établi au chapitre 12 pour les variables d'environnement en général.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'inclus jamais de secret en clair directement dans `docker-compose.yml` — utilise systématiquement des fichiers `.env` exclus de Git ou le mécanisme `secrets` déjà illustré en section 41.2, dans le même esprit de protection déjà établi aux chapitres 20 et 40.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Traite le fichier `docker-compose.yml` comme la documentation de référence de l'architecture d'une application — tenu à jour par nécessité, puisque toute divergence avec la réalité se manifeste immédiatement par un échec de `docker compose up`, contrairement à une documentation séparée qui peut silencieusement devenir obsolète.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Utilise des healthchecks avec des intervalles raisonnables (ni trop fréquents, consommant des ressources inutilement, ni trop espacés, retardant la détection réelle de disponibilité) — un équilibre à ajuster selon le temps d'initialisation typique de chaque service concerné.
</div>

## Résumé du chapitre

- Docker Compose remplace l'enchaînement manuel de commandes `docker run` par un seul fichier déclaratif, reproductible et versionnable.
- `docker compose down` conserve les volumes par défaut ; seule l'option explicite `-v` les supprime, un geste toujours volontaire.
- Les fichiers `.env` séparent la configuration spécifique à un environnement du fichier Compose lui-même, jamais committés dans Git s'ils contiennent des secrets.
- `depends_on` seul contrôle uniquement l'ordre de démarrage, pas la disponibilité réelle d'un service — un `healthcheck` combiné à `condition: service_healthy` est nécessaire pour une attente fiable.
- Un fichier Compose bien structuré constitue une documentation vivante et toujours à jour de l'architecture d'une application.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `docker compose down`, sans option supplémentaire :
   - a) Supprime aussi tous les volumes
   - b) Conserve les volumes par défaut
   - c) Supprime l'image utilisée
   - d) Redémarre automatiquement les conteneurs

2. `depends_on` seul, sans condition de santé, garantit :
   - a) Que le service dépendant est pleinement opérationnel
   - b) Uniquement l'ordre de démarrage des conteneurs
   - c) Une connexion réseau chiffrée
   - d) Rien du tout, l'option est ignorée

3. Un fichier `.env` contenant des secrets devrait :
   - a) Être committé dans Git pour le partager avec l'équipe
   - b) Être exclu de Git via `.gitignore`
   - c) Être inclus directement dans le Dockerfile
   - d) Être supprimé après chaque déploiement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Docker Compose élimine le risque d'oublier d'attacher un service à un réseau, contrairement à des commandes manuelles. — **Vrai**.
2. `depends_on: condition: service_healthy` attend une vérification de santé réelle avant de démarrer le service dépendant. — **Vrai**.
3. Le fichier `docker-compose.yml` devrait toujours contenir les mots de passe en clair pour plus de simplicité. — **Faux** (à éviter systématiquement, section 41.4).
4. `docker compose up -d` construit l'image si nécessaire et lance l'ensemble des services décrits dans le fichier. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi Docker Compose constitue une meilleure documentation qu'un document écrit séparément décrivant la même architecture.
2. Reprends le scénario d'ouverture. Explique pourquoi cet incident particulier (oubli du `--network`) ne peut structurellement plus se reproduire une fois le fichier Compose adopté par l'équipe.

**Corrigé 1** : un document écrit séparément peut devenir obsolète sans que personne ne s'en rende compte immédiatement, puisque son inexactitude n'empêche jamais le système réel de continuer à fonctionner. Un fichier Docker Compose, à l'inverse, est directement exécutable — toute divergence entre ce qu'il décrit et ce qui devrait réellement fonctionner se manifeste immédiatement par un échec de `docker compose up`, forçant une correction rapide plutôt qu'une dérive silencieuse et invisible dans le temps.

**Corrigé 2** : dans le fichier Compose, le réseau `reseau-portail` est défini une seule fois et automatiquement attaché à chaque service qui le référence dans sa section `networks` — il n'existe plus de commande individuelle où quelqu'un pourrait, par erreur humaine, oublier d'inclure l'option réseau pour un seul des deux conteneurs. La déclaration centralisée élimine structurellement la possibilité même de ce type d'erreur, plutôt que de simplement rendre l'erreur moins probable.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 41.1</span>

Un fichier `docker-compose.yml` définit un service `app` avec `depends_on: - db`, sans healthcheck sur `db`. Explique pourquoi l'application pourrait échouer intermittemment à se connecter à la base de données, alors qu'un simple redémarrage manuel après quelques secondes résout systématiquement le problème.
</div>

**Corrigé :** Sans healthcheck, `depends_on` garantit uniquement que le conteneur `db` a été lancé avant `app`, pas que PostgreSQL a terminé son initialisation interne et accepte réellement des connexions (section 41.5). Si l'application tente de se connecter immédiatement après son propre démarrage, elle peut arriver avant que PostgreSQL ne soit prêt, provoquant un échec de connexion — un redémarrage manuel quelques secondes plus tard fonctionne simplement parce que, à ce moment-là, PostgreSQL a eu le temps de terminer son initialisation, masquant la cause réelle du problème plutôt que de la résoudre durablement.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 41.2</span>

Rédige, en 3 à 5 phrases, pourquoi versionner `docker-compose.yml` dans Git, mais jamais le fichier `.env` associé, constitue une bonne pratique cohérente plutôt qu'une contradiction.
</div>

**Corrigé (exemple de réponse) :** `docker-compose.yml` décrit la structure de l'architecture (quels services, quelles relations entre eux) — une information stable et identique pour toute l'équipe, qui mérite d'être versionnée et partagée comme le reste du code. Le fichier `.env`, à l'inverse, contient des valeurs spécifiques à un environnement précis (mots de passe, hôtes, ports), potentiellement sensibles et différentes entre le poste d'un développeur, l'environnement de test et la production — le versionner exposerait des secrets et créerait des conflits entre les configurations propres à chaque environnement. Cette séparation (structure versionnée, configuration spécifique exclue) applique exactement le même principe déjà établi au chapitre 12 pour les variables d'environnement en général, simplement transposé au contexte de Docker Compose.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire un fichier `docker-compose.yml` décrivant plusieurs services, un volume et un réseau.</li>
<li>☐ Je sais utiliser `docker compose up`, `down` et `logs`.</li>
<li>☐ Je comprends que `docker compose down` conserve les volumes par défaut, sauf option `-v` explicite.</li>
<li>☐ Je sais utiliser un fichier `.env` pour séparer la configuration du fichier Compose lui-même.</li>
<li>☐ Je comprends pourquoi `depends_on` seul ne garantit pas la disponibilité réelle d'un service.</li>
<li>☐ Je sais ajouter un `healthcheck` et l'utiliser avec `condition: service_healthy`.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Docker Compose convient-il à un déploiement à grande échelle avec de nombreux serveurs ?</dt>
<dd>Non, Docker Compose reste conçu pour orchestrer des conteneurs sur une seule machine — au-delà de ce périmètre (plusieurs serveurs, mise à l'échelle automatique, tolérance de panne avancée), Kubernetes (chapitres 42-44) devient l'outil approprié, un changement d'échelle abordé dans les prochains chapitres.</dd>

<dt>Peut-on utiliser Docker Compose en production, ou seulement en développement ?</dt>
<dd>Il est utilisable en production pour des architectures simples sur un serveur unique, mais ses limites (pas de haute disponibilité native, pas de bascule automatique en cas de panne d'un hôte) le rendent moins adapté à des charges de production critiques à grande échelle — un choix à évaluer selon la même logique contextuelle que tous les choix technologiques de ce manuel.</dd>

<dt>Comment mettre à jour une application gérée par Docker Compose sans interruption de service ?</dt>
<dd>Docker Compose seul ne propose pas nativement de mise à jour progressive sans interruption (rolling update) — cette capacité, importante pour des applications critiques ne tolérant aucune coupure, est l'un des arguments centraux en faveur de Kubernetes, approfondi au chapitre 44.</dd>

<dt>Faut-il connaître YAML en profondeur pour utiliser Docker Compose efficacement ?</dt>
<dd>Une connaissance de base de la syntaxe YAML (indentation significative, listes, clés-valeurs) suffit largement pour la plupart des fichiers Compose courants — cette même syntaxe reviendra d'ailleurs directement utile pour Kubernetes dans les prochains chapitres, qui utilise également YAML pour ses définitions.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Docker Compose : [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- Référence complète du fichier Compose : [https://docs.docker.com/compose/compose-file/](https://docs.docker.com/compose/compose-file/)
- Documentation officielle sur les healthchecks Docker : [https://docs.docker.com/reference/dockerfile/#healthcheck](https://docs.docker.com/reference/dockerfile/#healthcheck)

*Fin de la trilogie Docker de ce manuel. Le chapitre suivant introduit Kubernetes — l'outil qui prend le relais quand une infrastructure dépasse ce qu'un seul serveur et Docker Compose peuvent raisonnablement orchestrer.*
