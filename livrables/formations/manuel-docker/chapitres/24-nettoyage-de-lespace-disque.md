# Chapitre 24 — Nettoyage de l'espace disque

**Niveau : Intermédiaire**

---

## Introduction

Dernier chapitre de la Partie VI. Après des dizaines de `docker build` (chapitre 7), de conteneurs créés et supprimés (chapitre 4), et de volumes accumulés (chapitre 10), Docker laisse derrière lui des couches d'images intermédiaires, des conteneurs arrêtés, des volumes orphelins. Ce chapitre explique comment nettoyer tout ça — **règle absolue de ce chapitre : chaque commande destructive est précédée d'un encadré expliquant précisément ce qu'elle supprime, avant la commande elle-même.**

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- mesurer l'espace disque utilisé par Docker avec `docker system df` ;
- supprimer sélectivement des conteneurs, images, volumes ou réseaux inutilisés ;
- expliquer précisément la différence de portée entre `docker image prune` et `docker image prune -a` ;
- reconnaître pourquoi `docker volume prune` est la commande la plus dangereuse de ce chapitre ;
- construire une routine de nettoyage qui automatise ce qui est sûr, sans jamais automatiser ce qui ne l'est pas.

## 📋 Prérequis

Chapitres 4, 5, 10 et 11 — ce chapitre supprime ce que ces chapitres ont créé.

## Pourquoi ce chapitre est important

Un poste de développement ou un serveur qui accumule des images et des conteneurs sans jamais les nettoyer finit, un jour, par manquer d'espace disque — souvent découvert au pire moment (un `docker build` qui échoue en pleine urgence de production). Mais nettoyer sans discernement est tout aussi dangereux : ce chapitre enseigne à distinguer ce qui peut être supprimé sans risque de ce qui exige réflexion.

---

## Concepts fondamentaux

1. **`docker system df`** — mesurer avant d'agir.
2. **Nettoyage sûr** — conteneurs arrêtés, images non taguées.
3. **Nettoyage risqué** — images encore potentiellement utiles, réseaux.
4. **Nettoyage dangereux** — volumes, jamais sans réflexion préalable.

---

## 24.1 `docker system df` : mesurer avant d'agir

```bash
# [Terminal]
docker system df
```

**Résultat attendu**, en substance :
```text
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          14        4         3.2GB     2.1GB (65%)
Containers      6         3         120MB     45MB (37%)
Local Volumes   5         3         890MB     210MB (23%)
Build Cache     32        0         540MB     540MB (100%)
```

**Explication des colonnes :**
```text
TOTAL       → nombre total d'objets de ce type
ACTIVE      → combien sont actuellement utilisés (conteneur en cours, image référencée...)
SIZE        → espace disque total occupé
RECLAIMABLE → espace qui pourrait être récupéré si tout ce qui est inactif était supprimé
```

```bash
# [Terminal] — détail par objet individuel
docker system df -v
```

> 📌 **À retenir** — `docker system df` est **toujours** la première commande de ce chapitre à exécuter, avant toute commande de nettoyage — elle répond à "ai-je réellement un problème d'espace disque, et où se trouve-t-il" avant de décider quoi supprimer.

---

## 24.2 Conteneurs arrêtés

> ⚠️ **Ce que cette commande supprime** — Tous les conteneurs à l'état `Exited` (chapitre 4) — définitivement, y compris leur couche inscriptible et tout ce qu'ils contenaient qui n'était pas dans un volume (chapitre 10). Les conteneurs **actifs** (`Running`) ne sont jamais touchés.

```bash
# [Terminal]
docker container prune
```

**Résultat attendu :** une invite de confirmation (`Are you sure you want to continue? [y/N]`), puis la liste des conteneurs supprimés et l'espace récupéré.

> 📌 **À retenir** — Rappel du chapitre 4 : un conteneur `Exited` n'est jamais supprimé automatiquement à son arrêt. Cette commande est donc **la** manière normale de faire le ménage régulier des conteneurs de test accumulés au fil des laboratoires de ce manuel — un usage globalement sûr, tant qu'aucun conteneur arrêté n'était gardé intentionnellement pour consultation ultérieure de ses logs (chapitre 22, qui restent lisibles tant que le conteneur existe, même arrêté).

---

## 24.3 Images inutilisées

> ⚠️ **Ce que `docker image prune` (sans option) supprime** — Uniquement les images **"dangling"** : des couches intermédiaires devenues orphelines (généralement identifiables par un tag `<none>:<none>`), produites lors de reconstructions successives (chapitre 7, le cache de build) mais qui ne correspondent plus à aucune image finale nommée. **Aucune image portant un nom et un tag valides n'est touchée par cette forme de la commande.**

```bash
# [Terminal]
docker image prune
```

> ⚠️ **Ce que `docker image prune -a` supprime, DIFFÉREMMENT** — **Toutes** les images non utilisées par un conteneur existant (actif ou arrêté), pas seulement les images "dangling" — y compris des images parfaitement valides et nommées (`node:20`, une ancienne version d'une image de projet) simplement non référencées par un conteneur au moment présent.

```bash
# [Terminal] — DIFFÉRENT et plus large que la commande précédente
docker image prune -a
```

> 📌 **À retenir** — La différence entre les deux commandes est capitale : `docker image prune` seul est un nettoyage de "déchets" sans conséquence pratique ; `docker image prune -a` peut supprimer une image que tu comptais réutiliser prochainement (par exemple, une image de base téléchargée pour un projet non lancé cette semaine) — sa seule conséquence pratique est un nouveau téléchargement (chapitre 5) au prochain besoin, pas une perte de données, mais un temps d'attente à anticiper.

---

## 24.4 Volumes inutilisés — la commande la plus dangereuse de ce chapitre

> ⚠️⚠️ **Ce que `docker volume prune` supprime — LIRE ATTENTIVEMENT AVANT D'EXÉCUTER** — Tous les volumes nommés (chapitre 10) **non référencés par aucun conteneur, actif ou arrêté**, au moment de l'exécution — avec, pour chacun, **la perte définitive et irréversible de toutes les données qu'il contenait**. Si le volume d'une base de données de projet a été temporairement détaché d'un conteneur (par exemple pendant une phase de reconstruction), il peut être considéré "inutilisé" à cet instant précis et supprimé sans aucun avertissement supplémentaire.

```bash
# [Terminal] — à ne JAMAIS exécuter par réflexe, uniquement après vérification consciente
docker volume ls
docker volume prune
```

> ✅ **Bonne pratique, avant toute exécution de cette commande précise** — Toujours exécuter `docker volume ls` d'abord, lire **individuellement** chaque nom de volume listé comme candidat à la suppression, et se poser explicitement la question : *"Ce volume contient-il une donnée que je ne peux pas me permettre de perdre ?"* Ne jamais exécuter `docker volume prune` "par habitude" dans une routine automatisée sans cette vérification humaine consciente à chaque fois — contrairement aux commandes des sections 24.2 et 24.3, dont l'automatisation est globalement sûre.

---

## 24.5 Réseaux inutilisés

> ⚠️ **Ce que cette commande supprime** — Les réseaux personnalisés (chapitre 11) non utilisés par aucun conteneur actif. Sans conséquence sur des données (un réseau ne stocke rien), mais peut nécessiter de recréer un réseau si un projet momentanément arrêté en dépendait.

```bash
# [Terminal]
docker network prune
```

---

## 24.6 `docker system prune` : plusieurs nettoyages combinés

> ⚠️ **Ce que `docker system prune` (sans autre option) supprime** — La combinaison des sections 24.2 (conteneurs arrêtés), 24.3 première forme (images dangling uniquement) et 24.5 (réseaux inutilisés) — **mais jamais les volumes**, par choix de conception explicite de Docker : une commande "générale" ne doit pas, par défaut, risquer une perte de données.

```bash
# [Terminal]
docker system prune
```

> ⚠️⚠️ **Ce que `docker system prune -a --volumes` supprime — la commande la plus large et la plus destructrice de tout ce manuel** — Toutes les images non utilisées (pas seulement dangling, comme en 24.3), tous les conteneurs arrêtés, tous les réseaux inutilisés, **et tous les volumes non utilisés, avec perte de données définitive comme en 24.4**. C'est l'équivalent combiné de toutes les commandes de ce chapitre, en une seule.

```bash
# [Terminal] — l'option la plus destructrice, jamais à exécuter sans avoir lu l'avertissement ci-dessus
docker system prune -a --volumes
```

> 📌 **À retenir, en résumé de tout le chapitre** — Plus une commande de nettoyage est "large" (`-a`, `--volumes`), plus elle mérite une vérification consciente préalable, jamais un réflexe automatique. Le tableau suivant résume la portée exacte de chaque commande, pour référence rapide future :

| Commande | Portée | Risque de perte de données |
|---|---|---|
| `docker container prune` | Conteneurs arrêtés | Faible (couche inscriptible seulement, jamais un volume) |
| `docker image prune` | Images dangling (`<none>:<none>`) | Aucun |
| `docker image prune -a` | Toutes les images non utilisées, y compris nommées | Aucun (juste un re-téléchargement/reconstruction futur) |
| `docker network prune` | Réseaux personnalisés inutilisés | Aucun |
| `docker volume prune` | Volumes non utilisés | **Élevé, données définitivement perdues** |
| `docker system prune` | Conteneurs + images dangling + réseaux (jamais les volumes) | Faible |
| `docker system prune -a --volumes` | Tout, y compris les volumes | **Élevé, données définitivement perdues** |

---

## 24.7 Une routine de nettoyage raisonnable

```bash
# [Terminal] — sûr à automatiser (par exemple via une tâche planifiée, approfondie au chapitre 17 du Guide Ultime du Déploiement pour la partie Linux/cron)
docker container prune -f
docker image prune -f

# [Terminal] — JAMAIS automatisé sans supervision, toujours une décision manuelle consciente
# docker volume prune
```

**Explication :**
```text
-f
→ "force" : saute la confirmation interactive, nécessaire pour un usage automatisé/scripté
```

> ✅ **Bonne pratique** — Automatiser sans risque le nettoyage des conteneurs arrêtés et des images dangling (section 24.2 et la première forme de 24.3) sur une base régulière (hebdomadaire, par exemple). Réserver `docker volume prune` et `docker image prune -a` à une revue manuelle occasionnelle, jamais à une tâche planifiée sans supervision — la même philosophie de prudence qui structure tout ce chapitre.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Perte de données d'une base de données après un "simple nettoyage" | `docker volume prune` (ou `docker system prune --volumes`) exécuté sans vérification préalable | Toujours lister et vérifier individuellement (`docker volume ls`) avant toute suppression de volume |
| Une image qu'on comptait réutiliser a disparu | `docker image prune -a` confondu avec la forme sans `-a` | Vérifier systématiquement laquelle des deux formes est réellement nécessaire |
| Le nettoyage ne libère "presque rien" | Utilisation de la forme la plus restrictive (`docker system prune` sans `-a`) alors que l'espace occupé est dans des images nommées non dangling | Vérifier `docker system df -v` pour identifier où l'espace est réellement occupé avant de choisir la bonne commande |
| Un projet arrêté depuis un moment refuse de redémarrer après un nettoyage | Réseau ou volume qu'il utilisait supprimé entre-temps | Toujours redémarrer un projet peu après un nettoyage large pour vérifier son bon fonctionnement |

---

## Laboratoire pratique n°1 — Mesurer avant de nettoyer

**Objectifs :** exécuter la section 24.1 et interpréter le résultat.
**Prérequis :** Chapitre 23, plusieurs laboratoires précédents ayant accumulé des conteneurs/images de test.

**Étapes :** `docker system df` puis `docker system df -v`, identifie la catégorie qui occupe le plus d'espace sur ta machine.

**Résultat attendu :** une lecture correcte du tableau, avec une hypothèse sur l'origine de l'espace occupé (probablement le cache de build ou les images accumulées au fil des chapitres précédents).

---

## Laboratoire pratique n°2 — Nettoyage sûr, puis nettoyage risqué en sandbox

**Objectifs :** pratiquer les commandes des sections 24.2 à 24.4, en toute sécurité.
**Prérequis :** Laboratoire 1 complété.

**Étapes :**
1. `docker container prune` et `docker image prune` (sans `-a`) — vérifie l'espace récupéré avec un nouveau `docker system df`.
2. **Dans un environnement de test dédié, sans rapport avec les projets des chapitres précédents** : crée un volume de test, insère une donnée factice, détache-le de tout conteneur, puis exécute `docker volume prune` et confirme la perte de cette donnée factice précise — jamais sur `db-data` ou tout autre volume de projet réel.

**Résultat attendu :** une expérience directe et sans risque de la portée exacte de `docker volume prune`, sur des données dont la perte est délibérément sans conséquence.

---

## Laboratoire pratique n°3 — Construire sa propre routine de nettoyage

**Objectifs :** appliquer la section 24.7 à ta propre machine.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** écris un court script (`.sh` ou `.ps1`) qui exécute `docker container prune -f` et `docker image prune -f`, avec un commentaire explicite rappelant que `docker volume prune` en est délibérément absent.

**Résultat attendu :** un script prêt à être utilisé régulièrement, dont la portée exacte est documentée directement dans son propre code.

---

## Exercices

1. Pourquoi `docker system df` doit-il toujours précéder une commande de nettoyage, plutôt que de nettoyer directement ?
2. Quelle est la différence exacte entre `docker image prune` et `docker image prune -a` ?
3. Pourquoi `docker system prune` (sans `--volumes`) ne supprime-t-il jamais de volume, par choix de conception ?
4. Que devrait toujours faire un développeur avant d'exécuter `docker volume prune`, quel que soit son niveau de confiance ?
5. Pourquoi certaines commandes de ce chapitre sont-elles sûres à automatiser et d'autres non ?

---

## Quiz

**Question 1.** `docker container prune` supprime :
a) Tous les conteneurs, actifs compris
b) Uniquement les conteneurs à l'état `Exited`
c) Uniquement les conteneurs les plus récents
d) Rien, sans confirmation manuelle possible

**Question 2.** `docker image prune -a`, comparé à `docker image prune` seul :
a) Est strictement identique
b) Supprime en plus toutes les images nommées non utilisées par un conteneur existant
c) Ne supprime que les images dangling, comme l'autre forme
d) Supprime aussi les volumes

**Question 3.** `docker volume prune` peut entraîner :
a) Aucune conséquence, les volumes sont toujours sauvegardés automatiquement
b) Une perte de données définitive pour tout volume non utilisé au moment de son exécution
c) Uniquement la suppression de réseaux
d) Un simple renommage des volumes

**Question 4.** `docker system prune`, sans l'option `--volumes` :
a) Supprime aussi les volumes par défaut
b) Ne supprime jamais les volumes, par choix de conception explicite
c) Supprime tout sans distinction
d) Nécessite un mot de passe administrateur

**Question 5.** Dans une routine de nettoyage automatisée sûre, il est recommandé de :
a) Toujours inclure `docker volume prune` pour un nettoyage complet
b) Automatiser conteneurs arrêtés et images dangling, mais jamais les volumes sans supervision humaine
c) Ne jamais automatiser aucun nettoyage
d) Exécuter `docker system prune -a --volumes` chaque nuit sans exception

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- `docker system df` (et sa forme `-v`) mesure l'espace occupé par Docker et doit toujours précéder toute décision de nettoyage.
- `docker container prune` et `docker image prune` (sans `-a`) sont globalement sûrs : conteneurs arrêtés et images dangling uniquement, sans perte de données réelle.
- `docker image prune -a` élargit la suppression à toute image non utilisée, y compris nommée — sans perte de données, mais avec un coût de re-téléchargement futur.
- `docker volume prune` est la commande la plus dangereuse de ce chapitre : perte de données **définitive** pour tout volume non utilisé, jamais à exécuter sans vérification consciente préalable.
- `docker system prune` ne touche jamais aux volumes par défaut, un choix de conception délibéré de Docker ; seul `--volumes` explicite l'inclut, rendant la commande aussi dangereuse que `docker volume prune` seul.

## ✅ Checklist avant de passer à la Partie VII

- [ ] Je sais mesurer l'espace disque utilisé par Docker avant de nettoyer.
- [ ] Je sais expliquer la différence entre `docker image prune` et `docker image prune -a`.
- [ ] Je n'exécute jamais `docker volume prune` sans avoir vérifié individuellement chaque volume candidat.
- [ ] J'ai une routine de nettoyage qui automatise le sûr et exclut délibérément le dangereux.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Image dangling**
Définition simple : une couche d'image devenue orpheline, sans nom ni tag valide (`<none>:<none>`).
Voir : Chapitre 24, section 24.3.

**`docker system df`**
Définition simple : la commande qui mesure l'espace disque utilisé par Docker, par catégorie d'objet.
Voir : Chapitre 24, section 24.1.

---

## ❓ FAQ

**Le cache de build (chapitre 7) est-il concerné par ces commandes de nettoyage ?**
Partiellement — `docker system prune` inclut par défaut le nettoyage du cache de build inutilisé ; un nettoyage ciblé existe aussi (`docker builder prune`), non détaillé ici mais visible dans `docker system df` sous "Build Cache".

**Peut-on annuler un `docker volume prune` après coup ?**
Non, jamais — c'est une suppression définitive, sans corbeille ni récupération possible, d'où l'insistance de ce chapitre sur la vérification préalable plutôt que sur une correction après coup.

**Existe-t-il un moyen de "prévisualiser" ce qu'une commande de nettoyage supprimerait, sans l'exécuter réellement ?**
`docker volume ls` et `docker image ls -f dangling=true` (par exemple) permettent d'inspecter manuellement la liste des candidats avant toute suppression — le vrai réflexe de prudence recommandé dans ce chapitre, plutôt qu'une option `--dry-run` qui n'existe pas nativement sur ces commandes.

---

## Références officielles

- `docker system df` — [docs.docker.com/reference/cli/docker/system/df](https://docs.docker.com/reference/cli/docker/system/df/)
- `docker system prune` — [docs.docker.com/reference/cli/docker/system/prune](https://docs.docker.com/reference/cli/docker/system/prune/)
- `docker volume prune` — [docs.docker.com/reference/cli/docker/volume/prune](https://docs.docker.com/reference/cli/docker/volume/prune/)

---

## Conclusion

La Partie VI se termine avec un espace disque maîtrisé, sans avoir jamais sacrifié une donnée par réflexe. La Partie VII change de registre : au lieu de réagir au quotidien, elle construit les bonnes pratiques qui évitent les problèmes en amont — un Dockerfile professionnel, une vraie posture de sécurité, et des registries bien gérés.

---

⬅️ [Chapitre 23 — Debugging](23-debugging-inspect-exec-top-stats-events.md) · ➡️ **Suite : Chapitre 25 — Dockerfile professionnel : bonnes pratiques et optimisation**
