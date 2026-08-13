# Chapitre 9 — Variables d'environnement et secrets

**Niveau : Débutant → Intermédiaire**

---

## Introduction

Le chapitre 6 a introduit `ENV` dans le Dockerfile, en prévenant qu'un secret n'y a jamais sa place. Ce chapitre explique où le placer à la place : `-e` au lancement, un fichier `.env`, et une première mise en garde honnête sur les limites de cette approche — la sécurité complète des secrets est un sujet à part entière, traité au chapitre 26, mais ce chapitre pose déjà les bons réflexes.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- passer une variable d'environnement à un conteneur avec `-e`, sans la graver dans l'image ;
- utiliser un fichier `.env` avec `--env-file` pour éviter d'empiler des `-e` en ligne de commande ;
- expliquer la priorité entre une variable définie dans le Dockerfile (`ENV`) et une variable passée au lancement (`-e`) ;
- expliquer pourquoi un secret ne doit jamais être écrit dans un Dockerfile ni committé dans un fichier `.env` ;
- reconnaître les limites de `-e` en matière de confidentialité, et savoir que le chapitre 26 les traite en profondeur.

## 📋 Prérequis

Chapitres 6 (`ENV`/`ARG`) et 7.

## Pourquoi ce chapitre est important

Toute application réelle a besoin d'être configurée différemment selon l'endroit où elle tourne (chapitre 1, section 1.2) : l'URL d'une base de données change entre développement et production, une clé d'API ne doit jamais être partagée publiquement. Ce chapitre est le point de passage obligé avant le chapitre 16 (MySQL) et tous les suivants, qui utilisent systématiquement des variables d'environnement pour se connecter à une base de données.

---

## Concepts fondamentaux

1. **`-e`** — passer une variable au moment du lancement, pas de la construction.
2. **`--env-file`** — regrouper de nombreuses variables dans un fichier.
3. **La convention `.env`** — et pourquoi elle ne doit jamais être versionnée.
4. **Les limites réelles de `-e`** — ce qu'il protège, ce qu'il ne protège pas.

---

## 9.1 Rappel du chapitre 6 : `ENV` (build) vs `-e` (run)

| | `ENV` dans le Dockerfile | `-e` au lancement (`docker run`) |
|---|---|---|
| Moment où la valeur est fixée | À la construction de l'image | Au lancement du conteneur |
| Gravée dans l'image ? | **Oui**, visible par quiconque a l'image | Non, propre à ce conteneur précis |
| Modifiable sans reconstruire l'image ? | Non | **Oui** |
| Cas d'usage typique | Une valeur par défaut, non sensible (`NODE_ENV=production`) | Une configuration propre à l'environnement (URL de base de données, clé d'API) |

> 📌 **À retenir** — `ENV` définit une valeur **par défaut**, embarquée dans l'image. `-e` **remplace** cette valeur par défaut, spécifiquement pour le conteneur en cours de démarrage — sans jamais modifier l'image elle-même.

---

## 9.2 `docker run -e` : passer une variable au démarrage

```bash
# [Windows PowerShell] / [Linux Terminal] / [Terminal macOS]
docker run --rm -e MESSAGE="Bonjour depuis -e" node:20-alpine node -e "console.log(process.env.MESSAGE)"
```

**Explication :**
```text
--rm
→ supprime automatiquement le conteneur dès qu'il s'arrête (pratique pour un test ponctuel,
   évite d'accumuler des conteneurs Exited comme au chapitre 4)

-e MESSAGE="Bonjour depuis -e"
→ définit la variable d'environnement MESSAGE, disponible UNIQUEMENT à l'intérieur
   de ce conteneur précis, pour toute sa durée de vie

node -e "console.log(process.env.MESSAGE)"
→ (le "-e" de node ici est une option de Node.js, sans rapport avec celui de Docker —
   simple coïncidence de nommage) exécute une ligne de JavaScript qui lit la variable
```

**Résultat attendu :** `Bonjour depuis -e`.

> ⚠️ **Attention** — Le `-e` de `docker run` et l'option `-e` de la commande `node` dans cet exemple n'ont **aucun rapport** — c'est une coïncidence de nommage entre deux outils différents. Ne pas confondre les deux en lisant une commande composée comme celle-ci.

**Plusieurs variables** : répéter `-e` autant de fois que nécessaire.

```bash
# [Terminal]
docker run --rm \
  -e DATABASE_URL="postgresql://user:pass@db:5432/app" \
  -e NODE_ENV="production" \
  node:20-alpine node -e "console.log(process.env.NODE_ENV)"
```

---

## 9.3 `--env-file` : regrouper les variables dans un fichier

Empiler des `-e` devient vite illisible dès qu'une application a de nombreuses variables (un scénario réel dès le chapitre 14). La solution standard est un fichier, par convention nommé `.env` :

```text
# [.env]
DATABASE_URL=postgresql://user:pass@db:5432/app
NODE_ENV=production
API_KEY=abc123
```

```bash
# [Terminal]
docker run --rm --env-file .env node:20-alpine node -e "console.log(process.env.DATABASE_URL)"
```

**Explication :**
```text
--env-file .env
→ charge TOUTES les variables définies dans le fichier ".env", comme si chacune
   avait été passée individuellement avec -e
```

**Résultat attendu :** `postgresql://user:pass@db:5432/app`.

> 📌 **À retenir** — Le format d'un fichier `.env` est volontairement simple : une variable par ligne, `CLE=valeur`, sans espaces autour du `=`, sans guillemets nécessaires dans le cas général. Ce même format et cette même convention `.env` sont repris tels quels par Docker Compose au chapitre 12.

---

## 9.4 Ne jamais versionner un `.env` réel

```text
# [.gitignore]
.env
```

> ⚠️ **Attention — règle absolue** — Un fichier `.env` contenant de vraies valeurs (mots de passe, clés d'API) ne doit **jamais** être commité dans Git, ni public ni privé. Une fois poussé sur un dépôt, même supprimé ensuite, le secret reste présent dans l'historique Git et doit être considéré comme compromis (il faudrait le révoquer et en générer un nouveau, pas simplement supprimer le fichier).

> ✅ **Bonne pratique** — Committer à la place un fichier `.env.example`, avec la même structure mais des valeurs factices ou vides, documentant quelles variables sont attendues sans jamais exposer de vraie valeur :

```text
# [.env.example] — celui-ci PEUT être versionné
DATABASE_URL=postgresql://user:password@localhost:5432/nom_de_la_base
NODE_ENV=development
API_KEY=
```

Ce pattern (`.env` ignoré, `.env.example` versionné) reviendra systématiquement à partir du chapitre 13 (premier projet Compose) et dans chacun des projets complets de la Partie X.

---

## 9.5 Ce que `-e` protège, et ce qu'il ne protège pas

`-e` évite le pire scénario du chapitre 6 (un secret figé dans l'image, visible par quiconque récupère cette image via `docker history` ou `docker pull`). Mais `-e` n'est **pas** un coffre-fort :

```bash
# [Terminal] — un secret passé via -e reste visible ici
docker inspect --format "{{.Config.Env}}" nom-conteneur
```

**Résultat attendu :** la liste complète des variables d'environnement du conteneur, **secrets compris, en clair**.

> ⚠️ **Attention** — Toute personne ayant accès à `docker inspect` sur la machine (ou à `docker exec`, chapitre 23) peut lire n'importe quelle variable d'environnement d'un conteneur en cours d'exécution, secret ou non. `-e` protège contre la fuite **dans l'image partagée** (le problème du chapitre 6), pas contre un accès à la machine elle-même — un modèle de menace différent. Sur une machine multi-utilisateurs ou dans un contexte de sécurité renforcée, des mécanismes plus stricts existent (gestionnaires de secrets dédiés, Docker Secrets en mode Swarm) — hors du périmètre pratique de ce manuel, mais mentionnés et mis en contexte au chapitre 26.

> 📌 **À retenir, pour la suite du manuel** — `-e` et `--env-file` sont l'approche standard et suffisante pour l'écrasante majorité des projets de ce manuel (développement, petites et moyennes équipes, un seul serveur). La hiérarchie de confiance à retenir : **jamais dans le Dockerfile ni le code source** (pire) → **`-e`/`.env` non versionné** (norme de ce manuel) → **gestionnaire de secrets dédié** (nécessaire à plus grande échelle ou en environnement réglementé, chapitre 26).

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Une variable semble "ne pas exister" dans l'application | Variable définie dans `.env` mais `--env-file` oublié au lancement | Toujours vérifier la commande `docker run` complète |
| Secret visible dans `docker history` d'une image partagée | Secret placé dans `ENV`/`ARG` du Dockerfile (rappel chapitre 6) | Ne jamais y placer de secret ; utiliser `-e` au lancement |
| `.env` accidentellement poussé sur GitHub | Absence de `.gitignore` avant le premier commit | Ajouter `.env` au `.gitignore` **avant** de créer le fichier, révoquer immédiatement tout secret déjà exposé |
| Une variable définie deux fois donne un résultat inattendu | `-e` répété avec la même clé, ou conflit entre `ENV` du Dockerfile et `-e` | La dernière valeur définie l'emporte — vérifier avec `docker inspect` |

---

## Laboratoire pratique n°1 — Passer et lire une variable avec `-e`

**Objectifs :** exécuter la section 9.2 soi-même.
**Prérequis :** Chapitre 7.

**Étapes :** reproduis la commande de la section 9.2 avec un message personnalisé, puis relance-la sans `-e` et observe le résultat (`undefined`).

**Résultat attendu :** confirmation que la variable n'existe que lorsqu'elle est explicitement fournie.

---

## Laboratoire pratique n°2 — Utiliser un fichier `.env` avec `--env-file`

**Objectifs :** pratiquer le pattern `.env`/`.env.example` qui reviendra à chaque projet du manuel.
**Prérequis :** Laboratoire 1 complété.

**Étapes :**
1. Crée un fichier `.env` avec deux ou trois variables de ton choix.
2. Lance un conteneur avec `--env-file .env` et vérifie que les valeurs sont bien lues.
3. Crée un `.env.example` correspondant, avec des valeurs vides ou factices.
4. Crée un `.gitignore` contenant `.env` (mais pas `.env.example`).

**Résultat attendu :** une structure de projet prête à être versionnée sans jamais exposer de vraie valeur.

---

## Laboratoire pratique n°3 — Observer les limites de `-e`

**Objectifs :** vérifier honnêtement la mise en garde de la section 9.5.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :**
1. Lance un conteneur en arrière-plan avec une variable "secrète" via `-e` (`docker run -d --name test-secret -e SECRET=abc123 nginx`).
2. Exécute `docker inspect --format "{{.Config.Env}}" test-secret` et observe que la valeur apparaît en clair.
3. Compare avec `docker history nginx` : la variable n'apparaît **pas** dans l'historique de l'image elle-même (elle n'a jamais été gravée dedans).

**Résultat attendu :** une distinction claire, vécue et non plus seulement lue, entre "gravé dans l'image" (chapitre 6, à éviter absolument) et "visible dans l'inspection d'un conteneur en cours d'exécution" (limite plus restreinte, acceptable pour ce manuel, approfondie au chapitre 26).

---

## Exercices

1. Explique la différence entre `ENV` dans un Dockerfile et `-e` au lancement, en une phrase chacun.
2. Pourquoi `.env.example` peut-il être versionné alors que `.env` ne le doit jamais ?
3. Un développeur committe `.env` par erreur, puis le supprime immédiatement dans un commit suivant. Le secret est-il encore en danger ? Justifie.
4. Que montre exactement `docker inspect --format "{{.Config.Env}}"` ?
5. Pourquoi `-e` ne constitue-t-il pas, à lui seul, une solution de sécurité complète pour des secrets très sensibles ?

---

## Quiz

**Question 1.** Une variable passée avec `-e` est-elle gravée dans l'image Docker ?
a) Oui, toujours
b) Non, elle n'existe que pour le conteneur en cours de lancement
c) Seulement si `--save` est ajouté
d) Seulement pour les images officielles

**Question 2.** `--env-file .env` sert à :
a) Créer automatiquement un fichier `.env`
b) Charger toutes les variables d'un fichier, plutôt que de répéter `-e` pour chacune
c) Chiffrer les variables d'environnement
d) Supprimer les variables d'environnement existantes

**Question 3.** Un fichier `.env` contenant de vraies valeurs doit :
a) Être commité pour que l'équipe y ait accès
b) Ne jamais être commité, avec un `.env.example` versionné à la place
c) Être renommé `.env.production` pour être sûr
d) Être supprimé après chaque déploiement

**Question 4.** `docker inspect` sur un conteneur en cours d'exécution :
a) Ne montre jamais les variables d'environnement, pour des raisons de sécurité
b) Peut montrer les variables d'environnement en clair, secrets compris
c) Chiffre automatiquement les secrets affichés
d) Ne fonctionne que sur des conteneurs arrêtés

**Question 5.** Si un secret a été committé une fois sur Git puis supprimé dans un commit suivant :
a) Le secret est totalement sécurisé, plus personne ne peut y accéder
b) Le secret reste présent dans l'historique Git et doit être considéré comme compromis
c) Git supprime automatiquement les traces après 24h
d) Seul un accès direct au serveur permettrait de le retrouver

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- `ENV` (Dockerfile) définit une valeur par défaut gravée dans l'image ; `-e` (au lancement) la remplace pour un conteneur précis, sans jamais toucher à l'image.
- `--env-file` charge de nombreuses variables depuis un fichier, par convention `.env`.
- Un `.env` réel ne doit **jamais** être versionné ; un `.env.example` à valeurs factices documente la structure attendue et peut l'être sans risque.
- Un secret committé une fois sur Git reste compromis même après suppression du fichier — il doit être révoqué, pas seulement effacé.
- `-e` protège contre la fuite dans une image partagée, mais reste visible via `docker inspect` sur la machine qui exécute le conteneur — une limite honnête, approfondie au chapitre 26.

## ✅ Checklist avant de passer au chapitre 10

- [ ] Je sais passer une variable avec `-e` et la lire dans l'application.
- [ ] Je sais utiliser `--env-file` avec un fichier `.env`.
- [ ] J'ai systématiquement un `.env.example` versionné et un `.env` ignoré dans mes projets.
- [ ] Je sais expliquer pourquoi `-e` n'est pas une solution de sécurité absolue.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Variable d'environnement**
Définition simple : une valeur de configuration fournie à un programme depuis l'extérieur de son code (rappel, déjà défini pour le contexte général au Guide Ultime du Déploiement — ici appliqué spécifiquement à Docker).
Voir : Chapitre 6, section 6.5 ; Chapitre 9, sections 9.2 et 9.3.

**`.env` / `.env.example`**
Définition simple : le fichier réel de configuration (jamais versionné) et son modèle documenté (versionné, sans vraies valeurs).
Voir : Chapitre 9, sections 9.3 et 9.4.

---

## ❓ FAQ

**Puis-je utiliser `-e` et `--env-file` en même temps ?**
Oui — si une même clé est définie dans les deux, la valeur passée par `-e` l'emporte, car elle est évaluée après le chargement du fichier dans l'ordre de la commande.

**Docker Compose utilise-t-il le même système `.env` ?**
Oui, avec quelques comportements supplémentaires propres à Compose (interpolation automatique du fichier `.env` situé à la racine du projet) — détaillé au chapitre 12.

**Existe-t-il un vrai "coffre-fort" intégré à Docker pour les secrets ?**
Oui, "Docker Secrets", mais ce mécanisme est conçu pour le mode Swarm (l'orchestrateur natif de Docker, non couvert par ce manuel qui se concentre sur Docker seul et Compose — rappel du chapitre 2). Le chapitre 26 situe cette option parmi les autres solutions de gestion de secrets disponibles.

---

## Références officielles

- Variables d'environnement dans les conteneurs — [docs.docker.com/reference/cli/docker/container/run/#env](https://docs.docker.com/reference/cli/docker/container/run/#env)
- `--env-file` — [docs.docker.com/reference/cli/docker/container/run/#env-file](https://docs.docker.com/reference/cli/docker/container/run/#env-file)
- Docker Secrets (mode Swarm) — [docs.docker.com/engine/swarm/secrets](https://docs.docker.com/engine/swarm/secrets/)

---

## Conclusion

Une application peut désormais être configurée différemment selon son environnement, sans jamais graver de secret dans une image ni sur Git. Il manque encore une pièce essentielle avant de pouvoir dockeriser une vraie base de données : que deviennent ses données si le conteneur est supprimé ? Le chapitre 10 y répond avec les volumes.

---

⬅️ [Chapitre 8 — Ports et exposition réseau](08-ports-et-exposition-reseau.md) · ➡️ **Suite : Chapitre 10 — Volumes et persistance des données**
