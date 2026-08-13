# Chapitre 27 — Registries : Docker Hub et registry privé

**Niveau : Intermédiaire → Avancé**

---

## Introduction

Dernier chapitre de la Partie VII. Le chapitre 5 a expliqué ce qu'est un registry en théorie ; ce chapitre le rend concret dans les deux sens — publier une image sur Docker Hub, et installer son propre registry privé, sécurisé, pour un environnement qui ne doit rien à un tiers.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- publier une image sur Docker Hub avec `docker login`, `docker tag` et `docker push` ;
- organiser un repository selon la convention namespace/nom:tag ;
- installer un registry privé auto-hébergé avec l'image officielle `registry:2` ;
- expliquer pourquoi Docker refuse par défaut de communiquer avec un registry non chiffré, sauf `localhost` ;
- sécuriser un registry privé avec authentification.

## 📋 Prérequis

Chapitre 5.

## Pourquoi ce chapitre est important

Le chapitre 29 (déploiement VPS) et le chapitre 31 (CI/CD) supposent qu'une image construite en local (ou par une CI) puisse être transférée vers un serveur de production — un registry, public ou privé, est le mécanisme standard qui rend ce transfert possible sans reconstruire l'image directement sur le serveur cible.

---

## Concepts fondamentaux

1. **`docker login`/`tag`/`push`** — publier une image.
2. **Organisation d'un repository** — namespace/nom:tag.
3. **Registry privé** — pourquoi et comment en installer un.
4. **Sécurisation** — authentification, et la contrainte TLS de Docker.

---

## 27.1 Publier une image sur Docker Hub

```bash
# [Terminal] — se connecter avec un compte Docker Hub existant
docker login
```

```bash
# [Terminal] — retagger l'image locale selon la convention Docker Hub
docker tag mon-image:1.0 mon-pseudo/mon-image:1.0
```

**Explication :**
```text
docker tag ANCIEN_NOM NOUVEAU_NOM
→ crée un nouveau nom (tag) pointant vers la MÊME image (même Image ID,
  chapitre 5, section 5.1) — ne duplique jamais les données sur le disque

mon-pseudo/mon-image:1.0
→ convention Docker Hub : "namespace/repository:tag", où le namespace
  est ton nom d'utilisateur (ou celui d'une organisation)
```

```bash
# [Terminal]
docker push mon-pseudo/mon-image:1.0
```

**Résultat attendu :** un envoi par couches (chapitre 1, section 1.3), similaire en apparence à un `docker pull` mais dans le sens inverse.

```bash
# [Terminal] — depuis n'importe quelle autre machine, avec Docker installé
docker pull mon-pseudo/mon-image:1.0
```

> 📌 **À retenir** — `docker push` n'envoie que les couches **absentes** du registry distant — si une image partage des couches avec une version précédente déjà publiée (le cas typique après une modification mineure du code, rappel du cache de build au chapitre 7), seule la différence est réellement transférée.

---

## 27.2 Visibilité : repository public ou privé

Sur Docker Hub, un repository peut être créé **public** (visible et téléchargeable par quiconque) ou **privé** (accès restreint aux comptes autorisés) — un choix fait au moment de la création du repository sur l'interface de Docker Hub, avant le premier `push`.

> ⚠️ **Attention** — Un repository public expose non seulement l'image, mais potentiellement des indices sur l'architecture d'une application (noms de services, versions de dépendances visibles dans `docker history`, chapitre 5) — un repository privé est le choix par défaut recommandé pour toute image liée à un projet client réel, réservant le public aux images explicitement destinées au partage.

---

## 27.3 Pourquoi un registry privé auto-hébergé ?

| Raison | Détail |
|---|---|
| Contrôle total | Aucune dépendance à la disponibilité ou aux conditions d'un tiers |
| Données sensibles | Des images contenant des éléments internes à une entreprise, jamais destinées à quitter son infrastructure |
| Coût à grande échelle | Au-delà d'un certain volume d'images privées, un registry auto-hébergé peut devenir plus économique qu'un plan payant tiers |
| Environnement de laboratoire/formation | Comme celui construit dans ce chapitre — comprendre le mécanisme sous-jacent à Docker Hub lui-même |

---

## 27.4 Installer un registry privé minimal

```bash
# [Terminal] — rappel du chapitre 10 : le registry lui-même a besoin d'un volume !
docker volume create registry-data
docker run -d -p 5000:5000 --name registry \
  -v registry-data:/var/lib/registry \
  registry:2
```

> ⚠️ **Attention — un piège qui rappelle directement le chapitre 10** — L'image officielle `registry:2` stocke les images qu'elle héberge dans `/var/lib/registry`, **à l'intérieur de sa propre couche inscriptible** sans configuration particulière — exactement le même risque de perte totale qu'un MySQL sans volume (chapitre 10, section 10.1). Le volume `-v registry-data:/var/lib/registry` n'est pas optionnel pour un usage sérieux : sans lui, supprimer le conteneur du registry supprimerait **toutes les images qu'il hébergeait**.

```bash
# [Terminal] — publier vers ce registry local
docker tag mon-image:1.0 localhost:5000/mon-image:1.0
docker push localhost:5000/mon-image:1.0
docker pull localhost:5000/mon-image:1.0
```

**Résultat attendu :** le push et le pull réussissent, sans configuration supplémentaire, **précisément parce que** l'adresse utilisée est `localhost`.

---

## 27.5 La contrainte TLS de Docker, et pourquoi `localhost` fait exception

> ⚠️ **Attention — un piège fréquent en dehors de `localhost`** — Docker refuse, par défaut, de communiquer avec un registry qui n'est pas protégé par HTTPS (TLS) — **sauf** exception explicite accordée à `localhost` (et `127.0.0.1`), considéré par défaut comme suffisamment sûr pour un usage local. Dès qu'un registry est accessible via une autre adresse — même sur un réseau local privé et de confiance, comme `192.168.1.50:5000` — Docker refuse la connexion avec une erreur explicite : `http: server gave HTTP response to HTTPS client`.

```json
// [/etc/docker/daemon.json, Linux — solution de LABORATOIRE uniquement, jamais en production]
{
  "insecure-registries": ["192.168.1.50:5000"]
}
```

> ⚠️ **Attention** — Ajouter une adresse à `insecure-registries` est une solution acceptable pour un **environnement de laboratoire fermé et de confiance**, jamais pour un registry accessible depuis un réseau non maîtrisé — les échanges resteraient alors en clair, sans la protection normalement apportée par TLS (rappel du chapitre 1, section 1.7 du vocabulaire général). Ce réglage nécessite un redémarrage du service Docker (`sudo systemctl restart docker`, chapitre 3) pour prendre effet.

> 📌 **À retenir, la vraie solution de production** — Plutôt que de configurer TLS directement sur le registry, l'approche recommandée (cohérente avec le reste de ce manuel) est de placer un **reverse proxy Nginx** (chapitre 19) devant le registry, avec un certificat HTTPS réel obtenu via Let's Encrypt (chapitre 30) — le registry lui-même continue de parler HTTP en interne, uniquement joignable via le proxy chiffré, exactement le même patron déjà appliqué à toute application web de ce manuel depuis le chapitre 13.

---

## 27.6 Sécuriser avec authentification

```bash
# [Terminal] — générer un fichier d'authentification (htpasswd)
mkdir auth
docker run --rm --entrypoint htpasswd httpd:2 -Bbn admin motdepasse_solide > auth/htpasswd
```

```bash
# [Terminal] — relancer le registry avec authentification activée
docker rm -f registry
docker run -d -p 5000:5000 --name registry \
  -v registry-data:/var/lib/registry \
  -v "$(pwd)/auth:/auth" \
  -e REGISTRY_AUTH=htpasswd \
  -e REGISTRY_AUTH_HTPASSWD_REALM="Registry privé" \
  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  registry:2
```

**Explication :**
```text
--entrypoint htpasswd httpd:2 -Bbn admin motdepasse_solide
→ réutilise l'image officielle httpd, qui embarque l'utilitaire "htpasswd",
  pour générer un fichier de mots de passe hachés SANS avoir à l'installer
  séparément sur la machine hôte — un exemple concret d'usage ponctuel
  d'une image Docker comme simple outil en ligne de commande

REGISTRY_AUTH=htpasswd / REGISTRY_AUTH_HTPASSWD_*
→ variables d'environnement (rappel chapitre 9) qui activent
  et configurent l'authentification du registry
```

```bash
# [Terminal] — tentative sans authentification
docker push localhost:5000/mon-image:1.0
```

**Résultat attendu :** rejet (`no basic auth credentials` ou équivalent).

```bash
# [Terminal] — avec authentification
docker login localhost:5000
# saisir : admin / motdepasse_solide
docker push localhost:5000/mon-image:1.0
```

**Résultat attendu :** succès.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| "http: server gave HTTP response to HTTPS client" | Registry accessible via une adresse autre que `localhost`, sans TLS ni exception explicite | Ajouter à `insecure-registries` (laboratoire uniquement) ou mettre en place un reverse proxy HTTPS (production) |
| Perte de toutes les images d'un registry après `docker rm` | Registry lancé sans volume monté sur `/var/lib/registry` | Toujours monter un volume, comme pour toute donnée persistante (rappel chapitre 10) |
| "no basic auth credentials" | Authentification activée sur le registry, mais `docker login` non effectué | `docker login` avant tout `push`/`pull` sur ce registry |
| Un `docker push` échoue avec "denied: requested access to the resource is denied" sur Docker Hub | Namespace du tag ne correspond pas au compte connecté | Vérifier que le tag commence bien par ton propre nom d'utilisateur Docker Hub |

---

## Laboratoire pratique n°1 — Publier une image sur Docker Hub

**Objectifs :** exécuter la section 27.1 de bout en bout.
**Prérequis :** Chapitre 5, un compte Docker Hub.

**Étapes :** reproduis la section 27.1 avec une image de test (par exemple `hello-docker` du chapitre 7), en repository **privé**.

**Résultat attendu :** un `docker pull` réussi depuis une autre session (ou après un `docker rmi` local suivi d'un nouveau `pull`), confirmant que l'image est réellement disponible à distance.

---

## Laboratoire pratique n°2 — Installer et utiliser un registry privé

**Objectifs :** exécuter les sections 27.4 de bout en bout.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** lance le registry privé avec volume, publie une image, supprime-la localement (`docker rmi`), puis retélécharge-la depuis `localhost:5000`.

**Résultat attendu :** un cycle complet push/pull fonctionnel sur une infrastructure entièrement auto-hébergée.

---

## Laboratoire pratique n°3 — Sécuriser le registry avec authentification

**Objectifs :** exécuter et vérifier la section 27.6.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** active l'authentification, confirme qu'un push échoue sans connexion préalable, puis réussit après `docker login`.

**Résultat attendu :** un registry qui refuse tout accès anonyme, exactement comme attendu d'un registry destiné à un usage réel au-delà d'un simple laboratoire local.

---

## Exercices

1. Explique la convention de nommage `namespace/repository:tag` sur Docker Hub.
2. Pourquoi `docker push` ne retransmet-il pas systématiquement toutes les couches d'une image ?
3. Pourquoi le registry officiel `registry:2` nécessite-t-il impérativement un volume pour un usage sérieux ?
4. Pourquoi Docker fait-il une exception à sa contrainte TLS pour `localhost`, mais pas pour une autre adresse locale comme `192.168.1.50` ?
5. Quelle est l'approche recommandée par ce manuel pour sécuriser un registry privé en production, plutôt que de configurer TLS directement dessus ?

---

## Quiz

**Question 1.** `docker tag ancien-nom nouveau-nom` :
a) Duplique les données de l'image sur le disque
b) Crée un nouveau nom pointant vers la même image, sans dupliquer les données
c) Supprime l'ancien nom
d) Envoie automatiquement l'image sur Docker Hub

**Question 2.** Un registry `registry:2` lancé sans volume :
a) Persiste automatiquement ses données ailleurs
b) Perd toutes les images hébergées si son conteneur est supprimé
c) Refuse de démarrer
d) Chiffre automatiquement les images

**Question 3.** Docker refuse par défaut de communiquer avec un registry non chiffré, sauf :
a) Si le registry utilise le port 5000
b) `localhost`/`127.0.0.1`
c) Si l'image fait moins de 100 Mo
d) Aucune exception n'existe

**Question 4.** L'approche recommandée pour sécuriser un registry privé en production est :
a) Toujours ajouter l'adresse à `insecure-registries`
b) Placer un reverse proxy HTTPS (Nginx + Let's Encrypt) devant le registry
c) Désactiver totalement l'authentification pour simplifier
d) Utiliser uniquement `localhost` en production

**Question 5.** Sans `docker login` préalable, un `docker push` vers un registry authentifié :
a) Réussit quand même si l'image est petite
b) Échoue avec un refus d'accès
c) Crée automatiquement un compte
d) Redirige vers Docker Hub

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Publier sur Docker Hub suit un cycle simple : `docker login`, `docker tag` (convention namespace/repository:tag), `docker push`.
- Un repository peut être public ou privé — le privé étant le choix par défaut recommandé pour tout projet client réel.
- Un registry privé auto-hébergé (`registry:2`) offre un contrôle total, mais nécessite un volume comme n'importe quelle donnée persistante (rappel du chapitre 10).
- Docker refuse par défaut tout registry non chiffré, sauf `localhost` — une contrainte à respecter en production via un reverse proxy HTTPS, pas en la contournant par `insecure-registries`.
- L'authentification (`htpasswd`, entre autres méthodes possibles) protège un registry privé contre tout accès anonyme.

## ✅ Checklist avant de passer à la Partie VIII

- [ ] J'ai publié et retéléchargé une image sur Docker Hub.
- [ ] J'ai installé un registry privé avec volume persistant.
- [ ] Je sais pourquoi `localhost` est une exception à la contrainte TLS de Docker.
- [ ] J'ai sécurisé un registry privé avec authentification.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Namespace (registry)**
Définition simple : la partie du nom d'un repository qui identifie son propriétaire (utilisateur ou organisation).
Voir : Chapitre 27, section 27.1.

**Registry privé**
Définition simple : un registry auto-hébergé, hors de Docker Hub, sous contrôle total de son opérateur.
Voir : Chapitre 27, sections 27.3-27.6.

**`insecure-registries`**
Définition simple : le paramètre Docker qui autorise explicitement la communication non chiffrée avec un registry précis — solution de laboratoire, jamais de production.
Voir : Chapitre 27, section 27.5.

---

## ❓ FAQ

**Peut-on utiliser un registry privé et Docker Hub simultanément pour un même projet ?**
Oui, sans conflit — une image peut être taguée et poussée vers plusieurs registries différents, chacun avec son propre nom de tag complet.

**Le registry officiel `registry:2` a-t-il une interface graphique ?**
Non, par défaut il n'expose qu'une API — des interfaces graphiques tierces existent (comme Harbor, une solution plus complète que ce chapitre ne couvre pas) pour qui a besoin d'une gestion visuelle des images hébergées.

**Faut-il toujours choisir un registry privé plutôt que Docker Hub ?**
Non — pour un projet open source ou une image destinée à être largement partagée, Docker Hub public reste pertinent. Le choix dépend de la confidentialité réellement requise (section 27.3), pas d'une préférence par défaut.

---

## Références officielles

- Registry Docker officiel — [hub.docker.com/_/registry](https://hub.docker.com/_/registry)
- Documentation du Distribution Registry — [distribution.github.io/distribution](https://distribution.github.io/distribution/)
- Registres non sécurisés — [docs.docker.com/engine/daemon/#insecure-registries](https://docs.docker.com/engine/daemon/#insecure-registries)

---

## Conclusion

La Partie VII se termine avec des images non seulement bien construites (chapitre 25) et sécurisées (chapitre 26), mais aussi correctement distribuables, publiquement ou en interne. La Partie VIII s'attaque maintenant à la production elle-même — environnements, déploiement VPS, HTTPS, CI/CD, jusqu'à la supervision et la sauvegarde d'une application réellement en ligne.

---

⬅️ [Chapitre 26 — Sécurité Docker](26-securite-docker.md) · ➡️ **Suite : Chapitre 28 — Environnements dev/test/prod et gestion des `.env`**
