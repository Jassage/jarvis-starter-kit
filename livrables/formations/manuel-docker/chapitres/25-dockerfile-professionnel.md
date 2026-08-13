# Chapitre 25 — Dockerfile professionnel : bonnes pratiques et optimisation

**Niveau : Avancé**

---

## Introduction

Ce chapitre ouvre la Partie VII en rassemblant, dans un seul endroit, toutes les bonnes pratiques déjà appliquées séparément depuis le chapitre 6 — et en ajoute de nouvelles : réduire le nombre de couches, choisir la bonne image de base, étendre le multi-stage build au backend, épingler jusqu'au niveau du digest. À la fin, une checklist complète, réutilisable sur n'importe quel Dockerfile de ce manuel ou d'un projet réel.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- réduire le nombre de couches d'un Dockerfile en combinant intelligemment les instructions `RUN` ;
- choisir entre une image complète, `slim`, `alpine` ou distroless selon le besoin réel du projet ;
- appliquer un multi-stage build à un backend, pas seulement à un frontend (chapitre 15) ;
- épingler une image jusqu'à son digest, pour une reproductibilité absolue au-delà du simple tag ;
- auditer et comparer la taille d'une image avant/après optimisation.

## 📋 Prérequis

Chapitre 15 (multi-stage), et une lecture globale des chapitres 6, 7, 14 recommandée — ce chapitre les synthétise.

## Pourquoi ce chapitre est important

Chaque bonne pratique de ce chapitre a un coût réel si elle est ignorée : une image plus lourde à transférer (chapitre 27, 29), une surface d'attaque plus large (chapitre 26), un temps de build plus long (chapitre 31, CI/CD). Ce chapitre les rassemble une dernière fois avant les chapitres de sécurité et de production qui en dépendent directement.

---

## Concepts fondamentaux

1. **Récapitulatif** — ce qui est déjà acquis depuis les chapitres précédents.
2. **Réduire les couches** — combiner les `RUN`, nettoyer dans la même instruction.
3. **Choisir la bonne image de base** — complète, slim, alpine, distroless.
4. **Multi-stage pour un backend** — pas réservé au frontend.
5. **Épingler jusqu'au digest** — au-delà du simple tag de version.

---

## 25.1 Récapitulatif des acquis

| Bonne pratique | Déjà vue au chapitre |
|---|---|
| Jamais `latest`, toujours un tag précis | 5 |
| `COPY` plutôt qu'`ADD` sauf besoin explicite | 6 |
| Ordonner `COPY package.json` avant `COPY . .` pour préserver le cache | 7 |
| `.dockerignore` systématique | 7, 14 |
| `npm ci` plutôt que `npm install` | 14 |
| `--omit=dev` pour exclure les dépendances de développement | 14 |
| Multi-stage build pour ne livrer que le résultat, pas l'outillage | 15 |
| `USER` non-root | 6 |
| `HEALTHCHECK` | 6, 21 |

> 📌 **À retenir** — Ce chapitre n'invente rien de tout ce tableau — il l'assemble, l'explique une dernière fois de façon consolidée, et y ajoute ce qui manquait encore.

---

## 25.2 Réduire le nombre de couches

```dockerfile
# ❌ Trois couches, et le cache du gestionnaire de paquets RESTE dans l'image
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

> ⚠️ **Attention — un piège sur les couches, non couvert jusqu'ici** — Rappel du chapitre 1 (section 1.3) : les couches d'une image sont **additives et immuables**. Un `rm -rf /var/lib/apt/lists/*` exécuté dans une instruction `RUN` **séparée** ne réduit **pas** la taille de l'image : le cache supprimé existait déjà dans la couche précédente (`apt-get install`), qui reste présente et occupe toujours son espace — seul le résultat final visible dans le conteneur change, pas la taille cumulée de l'image.

```dockerfile
# ✅ Une seule couche : le cache n'est jamais persisté dans une couche séparée
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

```dockerfile
# ✅ Équivalent sur une image Alpine (chapitre 5), avec une option dédiée
RUN apk add --no-cache curl
```

**Explication :**
```text
apt-get install -y --no-install-recommends
→ évite d'installer des paquets "recommandés" mais non strictement nécessaires,
  souvent une source significative de poids inutile

apk add --no-cache
→ équivalent Alpine qui évite d'écrire le cache du gestionnaire de paquets
  sur le disque en premier lieu, sans avoir besoin d'un "rm" séparé après coup
```

> 📌 **À retenir** — La règle générale : **toute commande de nettoyage doit se trouver dans la même instruction `RUN` que ce qu'elle nettoie**, jamais dans une instruction séparée, sous peine d'être inefficace sur la taille finale de l'image malgré une apparence de "propreté" du système de fichiers visible à l'exécution.

---

## 25.3 Choisir la bonne image de base

| Variante | Taille typique | Contenu | Cas d'usage |
|---|---|---|---|
| Image complète (`node:20`) | Grande (souvent 900 Mo+) | Système Debian complet, nombreux outils préinstallés | Développement, débogage occasionnel nécessitant des outils système variés |
| `slim` (`node:20-slim`) | Moyenne | Debian réduit à l'essentiel | Compromis entre compatibilité Debian et taille |
| `alpine` (`node:20-alpine`) | Petite (souvent 150-200 Mo) | Alpine Linux, `musl` plutôt que `glibc` (chapitre 48 pour un scénario de compatibilité lié à cette différence) | Le choix par défaut de ce manuel pour la production |
| Distroless (`gcr.io/distroless/nodejs20`) | Très petite | Aucun shell, aucun gestionnaire de paquets, juste le runtime strictement nécessaire | Sécurité maximale (surface d'attaque minimale, chapitre 26) — mentionné ici pour référence, non utilisé dans les projets de ce manuel par souci de simplicité de débogage (pas de `docker exec ... sh` possible, chapitre 23) |

> ⚠️ **Attention** — `alpine` utilise `musl libc` plutôt que la `glibc` standard des distributions comme Debian/Ubuntu — l'écrasante majorité des paquets npm fonctionnent identiquement, mais de rares paquets avec des dépendances natives compilées peuvent se comporter différemment ou nécessiter une recompilation. Un scénario de dépannage complet lié à cette différence est traité au chapitre 48.

---

## 25.4 Multi-stage pour un backend (pas seulement un frontend)

Le chapitre 15 a appliqué le multi-stage build à React, où la distinction "outillage de build" vs "résultat final" est évidente. Le même principe s'applique à un backend qui a une étape de compilation (TypeScript, par exemple) :

```dockerfile
# Étape 1 : compiler TypeScript, avec toutes les devDependencies
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : ne garder que le résultat compilé et les dépendances de PRODUCTION
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]
```

**Explication :** la première étape a besoin du compilateur TypeScript (une `devDependency`) et de tout le code source non compilé ; la seconde n'installe que les dépendances de production (`--omit=dev`, chapitre 14) et ne copie que `dist/`, le résultat compilé — ni le compilateur TypeScript, ni le code source `.ts` original ne se retrouvent dans l'image finale.

> 📌 **À retenir** — Le multi-stage build n'est pas une technique "réservée au frontend" — c'est un principe général applicable à **tout** processus de construction qui produit un résultat plus petit que son outillage : compilation, minification, tests exécutés pendant le build (dont le résultat — un rapport — n'a pas sa place dans l'image de production).

---

## 25.5 Épingler jusqu'au digest

Rappel du chapitre 5 : un tag (`node:20-alpine`) est plus stable que `latest`, mais reste en théorie modifiable — un mainteneur pourrait, rarement mais légalement, republier une image sous le même tag (par exemple pour corriger une faille de sécurité urgente dans l'image de base elle-même). Pour une reproductibilité **absolue**, un digest peut être utilisé à la place :

```dockerfile
FROM node:20-alpine@sha256:a1b2c3d4e5f6...
```

```bash
# [Terminal] — obtenir le digest exact d'une image locale
docker inspect --format "{{.RepoDigests}}" node:20-alpine
```

> ⚠️ **Attention** — Épingler par digest garantit une reproductibilité totale, mais **gèle aussi totalement les mises à jour de sécurité automatiques** de l'image de base — un digest ne se met jamais à jour tout seul, contrairement à un tag qui peut recevoir un correctif à la même version. C'est un compromis, pas une amélioration universelle : approprié pour des contextes de conformité stricte ou de reproductibilité contractuelle (CI/CD avancée, chapitre 31), pas nécessairement pour la majorité des projets de ce manuel qui préfèrent bénéficier des correctifs de sécurité d'un tag de version stable.

---

## 25.6 Auditer la taille d'une image

```bash
# [Terminal] — rappel du chapitre 5, réutilisé ici comme outil d'audit final
docker history nom-image
docker images nom-image
```

> ✅ **Bonne pratique** — Avant de considérer un Dockerfile "terminé", comparer sa taille et ses couches à une version antérieure (ou à une approche naïve, comme au laboratoire 2 du chapitre 15) est le seul moyen fiable de confirmer qu'une optimisation a réellement un effet mesurable, plutôt que de se fier à une impression.

---

## 25.7 Checklist Dockerfile professionnel

- [ ] Image de base épinglée à une version précise (jamais `latest`), variante `alpine` privilégiée sauf besoin contraire justifié.
- [ ] `.dockerignore` présent et à jour (`node_modules`, `.git`, `.env`, fichiers de build locaux).
- [ ] `COPY` des fichiers de dépendances (`package.json`...) avant `COPY` du reste du code, pour préserver le cache de build.
- [ ] `npm ci` (ou équivalent strict du gestionnaire de paquets utilisé) plutôt qu'une installation permissive.
- [ ] `--omit=dev` (ou équivalent) sur l'image finale de production.
- [ ] Toute commande de nettoyage combinée dans la même instruction `RUN` que ce qu'elle nettoie.
- [ ] Multi-stage build si une étape de compilation/construction produit un résultat plus petit que son outillage.
- [ ] `USER` non-root avant le `CMD`/`ENTRYPOINT` final.
- [ ] `HEALTHCHECK` défini, cohérent avec une vraie route de santé applicative.
- [ ] Aucun secret en dur dans `ARG`/`ENV` du Dockerfile.
- [ ] `EXPOSE` documenté pour chaque port réellement utilisé par l'application.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Nettoyage du cache sans effet sur la taille finale | Commande de nettoyage dans une instruction `RUN` séparée | Combiner installation et nettoyage dans la même instruction |
| Image "optimisée" toujours volumineuse | Multi-stage build non appliqué à une étape de compilation présente | Séparer l'étape de build de l'étape finale |
| Comportement différent entre développement (Debian) et production (Alpine) | Incompatibilité `glibc`/`musl` sur une dépendance native | Approfondi au chapitre 48 ; en attendant, tester sur la même variante d'image en développement et en production |
| Mise à jour de sécurité de l'image de base jamais appliquée | Digest figé sans processus de révision périodique | Réserver l'épinglage par digest aux contextes qui en ont réellement besoin, avec un processus de mise à jour délibéré |

---

## Laboratoire pratique n°1 — Réduire les couches d'un Dockerfile existant

**Objectifs :** appliquer la section 25.2 et mesurer son effet.
**Prérequis :** Chapitre 24.

**Étapes :** prends un Dockerfile avec des instructions `apt-get`/`apk` séparées (crée-le volontairement pour ce laboratoire si aucun de tes projets n'en a), compare sa taille (`docker history`) avant et après regroupement en une seule instruction avec nettoyage inclus.

**Résultat attendu :** une taille mesurablement réduite après regroupement.

---

## Laboratoire pratique n°2 — Multi-stage pour un backend TypeScript

**Objectifs :** appliquer la section 25.4 sur un cas concret.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** convertis un petit projet Node.js avec une étape de compilation (TypeScript, ou à défaut simule une étape de build quelconque) en Dockerfile multi-stage, et confirme que le compilateur/les `devDependencies` n'apparaissent pas dans l'image finale (`docker exec -it ... sh` puis recherche de l'outil de build, absent).

**Résultat attendu :** une image finale sans aucune trace de l'outillage de construction.

---

## Laboratoire pratique n°3 — Appliquer la checklist complète

**Objectifs :** auditer un Dockerfile réel du manuel (chapitre 20 ou 21) selon la checklist de la section 25.7.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** reprends le `backend/Dockerfile` du chapitre 20, coche chaque point de la checklist, corrige ce qui manquerait éventuellement.

**Résultat attendu :** un Dockerfile conforme à l'intégralité de la checklist, avec une justification pour chaque point vérifié.

---

## Exercices

1. Pourquoi un `rm -rf` dans une instruction `RUN` séparée ne réduit-il pas la taille finale de l'image ?
2. Dans quel cas une image distroless serait-elle préférable à `alpine`, et quel inconvénient cela introduirait-il pour le débogage (chapitre 23) ?
3. Pourquoi le multi-stage build ne se limite-t-il pas aux applications frontend ?
4. Quel est le compromis exact d'un épinglage par digest plutôt que par tag ?
5. Pourquoi comparer `docker history` avant/après est-il plus fiable qu'une simple impression visuelle de "Dockerfile plus propre" ?

---

## Quiz

**Question 1.** Pour réduire réellement la taille d'une image, une commande de nettoyage doit être :
a) Placée dans une instruction `RUN` séparée, après l'installation
b) Combinée dans la MÊME instruction `RUN` que l'installation qu'elle nettoie
c) Placée en tout début de Dockerfile
d) Sans importance sur la taille finale

**Question 2.** Une image distroless :
a) Contient un shell complet et un gestionnaire de paquets
b) Ne contient ni shell ni gestionnaire de paquets, réduisant la surface d'attaque au minimum
c) Est toujours plus grande qu'une image complète
d) Est incompatible avec Docker

**Question 3.** Le multi-stage build s'applique :
a) Uniquement aux applications frontend comme React
b) À tout processus de construction dont le résultat est plus petit que l'outillage utilisé pour le produire
c) Uniquement aux images basées sur Alpine
d) Jamais aux backends

**Question 4.** Épingler une image par digest plutôt que par tag :
a) Garantit une reproductibilité absolue, mais gèle aussi les mises à jour de sécurité automatiques de l'image de base
b) N'a aucun impact réel
c) Rend l'image plus volumineuse
d) Est obligatoire pour toute image de production

**Question 5.** `apk add --no-cache` sur une image Alpine :
a) Installe le paquet sans jamais écrire de cache sur le disque, évitant un nettoyage séparé
b) Désactive complètement le gestionnaire de paquets
c) Force une réinstallation de tous les paquets existants
d) N'a aucun rapport avec la taille de l'image

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: a · 5: a

---

## 📝 Résumé du chapitre

- Les couches d'une image sont additives : nettoyer dans une instruction `RUN` séparée de l'installation ne réduit jamais la taille finale — tout doit être combiné.
- Le choix entre image complète, `slim`, `alpine` et distroless est un compromis entre taille, compatibilité et facilité de débogage — `alpine` reste le choix par défaut de ce manuel.
- Le multi-stage build s'applique à tout processus de construction, backend compris dès qu'une étape de compilation existe, pas seulement au frontend du chapitre 15.
- Épingler par digest offre une reproductibilité absolue au prix de mises à jour de sécurité gelées — un compromis à choisir consciemment, pas un défaut universel.
- La checklist de la section 25.7 synthétise toutes les bonnes pratiques du manuel jusqu'ici, réutilisable sur tout Dockerfile futur.

## ✅ Checklist avant de passer au chapitre 26

- [ ] Je sais pourquoi une commande de nettoyage doit être combinée avec l'installation qu'elle nettoie.
- [ ] Je sais choisir entre les variantes d'images de base selon le besoin réel.
- [ ] J'ai appliqué un multi-stage build à un cas backend, pas seulement frontend.
- [ ] Je sais expliquer le compromis d'un épinglage par digest.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Distroless**
Définition simple : une image de base sans shell ni gestionnaire de paquets, réduite au strict runtime nécessaire.
Voir : Chapitre 25, section 25.3.

**Digest**
Définition simple : l'identifiant cryptographique exact et immuable d'une image précise, plus strict qu'un tag.
Voir : Chapitre 25, section 25.5.

---

## ❓ FAQ

**Faut-il toujours utiliser `alpine` par défaut ?**
C'est le choix par défaut de ce manuel, mais pas une règle absolue — un projet avec des dépendances natives problématiques sous `musl` (chapitre 48) peut légitimement préférer `slim`, un compromis raisonnable entre `alpine` et une image complète.

**Le multi-stage build ralentit-il la construction ?**
Non — au contraire, une étape de build mise en cache (chapitre 7) peut être réutilisée indépendamment de l'étape finale, et l'étape finale, plus légère, se construit généralement plus vite qu'une image monolithique équivalente.

**Cette checklist est-elle suffisante pour la sécurité d'une image ?**
Non, volontairement incomplète sur ce plan — elle couvre l'optimisation et les bonnes pratiques structurelles ; la sécurité proprement dite (scan de vulnérabilités, capabilities, socket Docker) est le sujet complet du chapitre 26.

---

## Références officielles

- Bonnes pratiques de construction d'images — [docs.docker.com/build/building/best-practices](https://docs.docker.com/build/building/best-practices/)
- Images distroless (Google) — [github.com/GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless)
- Alpine Linux et musl libc — [alpinelinux.org/about](https://www.alpinelinux.org/about/)

---

## Conclusion

Un Dockerfile professionnel est maintenant un ensemble de réflexes déjà connus, assemblés et complétés. Le chapitre 26 s'attaque à ce que ce chapitre a volontairement laissé de côté : la sécurité, dans toute sa profondeur — utilisateurs, capabilities, secrets, images vulnérables, et le socket Docker lui-même.

---

⬅️ [Chapitre 24 — Nettoyage de l'espace disque](24-nettoyage-de-lespace-disque.md) · ➡️ **Suite : Chapitre 26 — Sécurité Docker**
