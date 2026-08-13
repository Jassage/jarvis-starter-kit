# Chapitre 41 — Projet 1 : premier contact (Nginx seul)

**Niveau : Débutant**

---

## Introduction

Ouverture de la Partie X : six projets progressifs, du plus simple au plus complet, chacun réutilisant explicitement les chapitres précédents plutôt que de réexpliquer. Ce premier projet ne contient **aucune notion nouvelle** — c'est un point de contrôle : si les Parties I et II sont acquises, ce projet se termine en quelques minutes.

---

## 🎯 Objectif du projet

Livrer une page d'accueil statique personnalisée, conteneurisée avec Nginx, accessible sur `http://localhost:8080`, avec une variante permettant de modifier son contenu sans reconstruire l'image.

## 📋 Prérequis

Parties I et II entières (chapitres 1 à 11), en particulier les chapitres 3, 4, 5, 6, 7, 8 et 10, directement réutilisés ici sans être réexpliqués.

## Pourquoi ce projet est important

Après onze chapitres de théorie et de pratique fragmentée commande par commande, ce projet est le premier à demander d'assembler, seul, une séquence complète — du dossier vide jusqu'à une page réellement accessible dans un navigateur.

---

## Cahier des charges

```text
1. Une page d'accueil HTML avec ton nom et une courte présentation
2. Une feuille de style CSS minimale
3. Conteneurisée avec l'image officielle Nginx (chapitre 5)
4. Accessible sur le port 8080 de la machine hôte (chapitre 8)
5. Une variante permettant de modifier le contenu sans reconstruire l'image (chapitre 10)
```

---

## 41.1 Arborescence

```text
projet-1-nginx/
├── index.html
├── style.css
└── Dockerfile
```

`index.html` :
```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Mon premier projet Docker</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Bonjour, je suis [ton nom]</h1>
  <p>Cette page est servie par Nginx, dans un conteneur Docker.</p>
</body>
</html>
```

`style.css` : à ta convenance — ce projet ne teste aucune notion de CSS.

---

## 41.2 Dockerfile (rappel des chapitres 6-7)

```dockerfile
FROM nginx:1.27-alpine
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
EXPOSE 80
```

**Rappel du chapitre 6 :** `EXPOSE 80` documente le port, sans le publier — c'est `-p` au lancement (chapitre 8) qui rendra la page réellement accessible.

---

## 41.3 Construire et lancer (rappel des chapitres 7-8)

```bash
# [Terminal] — depuis projet-1-nginx/
docker build -t projet1-nginx .
docker run -d --name projet1 -p 8080:80 projet1-nginx
```

```bash
# [Terminal] — vérification
curl http://localhost:8080/
```

**Résultat attendu :** le HTML de ta page personnalisée.

---

## 41.4 Variante : bind mount pour itérer sans reconstruire (rappel du chapitre 10)

```bash
# [Terminal]
docker run -d --name projet1-dev -p 8081:80 \
  -v "$(pwd):/usr/share/nginx/html" \
  nginx:1.27-alpine
```

**Rappel du chapitre 10, section 10.5 :** toute modification de `index.html` ou `style.css` sur l'hôte est immédiatement visible en rechargeant la page sur `http://localhost:8081`, sans reconstruire l'image ni redémarrer le conteneur.

---

## 41.5 Nettoyage (rappel des chapitres 4 et 24)

```bash
# [Terminal]
docker rm -f projet1 projet1-dev
docker rmi projet1-nginx
```

---

## Laboratoire pratique n°1 — Construire et vérifier le projet complet

**Objectifs :** exécuter les sections 41.1 à 41.3, seul, sans regarder la solution avant d'essayer.
**Prérequis :** Parties I-II.

**Résultat attendu :** la page personnalisée accessible sur `http://localhost:8080`.

---

## Laboratoire pratique n°2 — Itérer avec le bind mount

**Objectifs :** exécuter la section 41.4, puis modifier réellement le contenu.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** lance la variante bind mount, modifie le titre de la page directement dans `index.html`, recharge le navigateur sans aucune commande Docker supplémentaire.

**Résultat attendu :** le changement apparaît immédiatement.

---

## Laboratoire pratique n°3 — Nettoyer et reconstruire pour confirmer la reproductibilité

**Objectifs :** vérifier que le projet est entièrement reproductible depuis zéro.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** exécute le nettoyage complet de la section 41.5, puis reconstruis et relance tout depuis le début, sans consulter tes notes précédentes.

**Résultat attendu :** un résultat identique au premier essai — la preuve concrète que ce projet est reproductible, le principe central du chapitre 1.

---

## ✅ Checklist avant de passer au chapitre 42

- [ ] J'ai construit et lancé ce projet sans revoir les chapitres 6, 7 ou 8.
- [ ] Je sais expliquer pourquoi `EXPOSE` seul ne suffirait pas ici.
- [ ] J'ai utilisé la variante bind mount et modifié le contenu à chaud.
- [ ] J'ai nettoyé puis reconstruit le projet avec un résultat identique.

---

## Conclusion

Un premier projet complet, du dossier vide jusqu'à une page accessible, sans aucune notion nouvelle — la preuve que les Parties I et II sont acquises. Le chapitre 42 ajoute la première vraie complexité : une API Node.js connectée à MySQL.

---

⬅️ [Chapitre 40 — Django](40-etude-de-cas-django.md) · ➡️ **Suite : Chapitre 42 — Projet 2 : Node.js + MySQL**
