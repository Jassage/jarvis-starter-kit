# Chapitre 19 — Nginx comme reverse proxy devant plusieurs services

**Niveau : Intermédiaire**

---

## Introduction

Le `nginx.conf` du chapitre 13 fonctionnait, mais restait minimal. Ce chapitre le complète avec ce qu'une vraie configuration de production exige : les en-têtes qui informent le backend de la vraie origine d'une requête, la compression, le cache navigateur, et un piège de syntaxe Nginx qui casse silencieusement le routage de bien des débutants — le comportement du slash final dans `proxy_pass`.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- expliquer ce qu'est un reverse proxy et pourquoi il se place systématiquement devant les autres services ;
- transmettre au backend les en-têtes qui révèlent la vraie adresse IP et le vrai protocole du client d'origine ;
- activer la compression gzip et configurer le cache navigateur pour les fichiers statiques ;
- expliquer précisément l'effet du slash final dans `proxy_pass`, et corriger le bug classique qu'il cause ;
- ajouter des en-têtes de sécurité de base, en attendant le traitement complet du chapitre 26.

## 📋 Prérequis

Chapitres 6, 8 et 13 (le `nginx.conf` minimal de ce dernier est repris et enrichi ici).

## Pourquoi ce chapitre est important

Nginx est le point d'entrée unique de chaque architecture de ce manuel à partir du chapitre 13 — une configuration incomplète (en-têtes manquants, pas de compression) se répercute silencieusement sur toute l'application derrière lui, souvent sans erreur explicite qui alerterait un débutant.

---

## Concepts fondamentaux

1. **Le reverse proxy** — rappel et application concrète.
2. **En-têtes de proxy** — transmettre l'identité réelle du client.
3. **`proxy_pass` et le slash final** — un piège de syntaxe très répandu.
4. **Compression et cache** — deux optimisations à faible effort, fort impact.

---

## 19.1 Rappel : le rôle d'un reverse proxy

Rappel du chapitre 1 (section 1.6) : un reverse proxy reçoit toutes les requêtes entrantes et les redirige vers le bon service interne — comme une réceptionniste qui oriente un visiteur vers le bon bureau sans qu'il ait besoin de connaître le plan de l'immeuble. Depuis le chapitre 13, ce rôle est tenu par le seul service Nginx qui publie un port (chapitre 8, chapitre 11).

---

## 19.2 En-têtes de proxy : transmettre l'identité réelle du client

Sans configuration particulière, une requête qui traverse Nginx avant d'atteindre le backend **perd des informations** : le backend voit la requête comme venant de Nginx lui-même (son adresse IP interne sur le réseau Docker), pas du vrai client d'origine.

```nginx
location /api/ {
    proxy_pass http://backend:4000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Explication, en-tête par en-tête :**
```text
proxy_set_header Host $host
→ transmet le nom de domaine réellement demandé par le client
  (utile si plusieurs domaines pointent vers la même application)

proxy_set_header X-Real-IP $remote_addr
→ transmet la VRAIE adresse IP du client, sinon le backend
  ne verrait que l'IP interne de Nginx sur le réseau Docker (chapitre 11)

proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for
→ une variante qui accumule la chaîne complète des relais traversés
  (utile si plusieurs proxys se succèdent, rare dans ce manuel mais standard à inclure)

proxy_set_header X-Forwarded-Proto $scheme
→ transmet le protocole d'origine (http ou https) — essentiel une fois HTTPS
  activé au chapitre 30, pour que le backend sache que la connexion EST
  chiffrée même si, en interne, Nginx lui parle en http simple
```

> ⚠️ **Attention** — Sans `X-Real-IP`/`X-Forwarded-For`, toute fonctionnalité backend qui dépend de l'adresse IP du client (limitation de débit par IP, géolocalisation approximative, journal d'audit) enregistrerait systématiquement l'IP interne de Nginx — une donnée fausse et inutilisable, une erreur silencieuse qui ne casse rien visiblement mais fausse toute donnée qui en dépend.

**Côté backend Express**, lire ces en-têtes :
```javascript
app.get("/api/qui-suis-je", (req, res) => {
  res.json({
    ip: req.headers["x-real-ip"] || req.socket.remoteAddress,
    protocole: req.headers["x-forwarded-proto"] || req.protocol,
  });
});
```

---

## 19.3 `proxy_pass` et le piège du slash final

C'est l'un des comportements Nginx les plus mal compris, et une source réelle de bugs "l'API renvoie 404 alors qu'elle fonctionne en direct".

| Configuration `location` + `proxy_pass` | Requête entrante | URL réellement envoyée au backend |
|---|---|---|
| `location /api/ { proxy_pass http://backend:4000/api/; }` | `/api/tasks` | `http://backend:4000/api/tasks` (préfixe remplacé par un préfixe identique — transparent ici) |
| `location /api/ { proxy_pass http://backend:4000/; }` | `/api/tasks` | `http://backend:4000/tasks` (**le préfixe `/api/` est retiré**) |
| `location /api/ { proxy_pass http://backend:4000; }` **(sans slash final, sans aucun chemin)** | `/api/tasks` | `http://backend:4000/api/tasks` (l'URL complète d'origine est conservée telle quelle) |

> ⚠️ **Attention — la règle exacte** — Dès que `proxy_pass` contient un **chemin** après l'hôte (même un simple `/`), Nginx **remplace** la portion de l'URL qui a matché le `location` par ce chemin. Si `proxy_pass` ne contient **aucun chemin du tout** (juste `http://hôte:port`, sans rien après, pas même un `/`), Nginx transmet l'URL **entière et inchangée** telle que reçue. C'est un détail de syntaxe facile à mal recopier d'un projet à l'autre, avec un effet radicalement différent selon un seul caractère (`/`) présent ou non.

> 📌 **À retenir, pour ce manuel** — La configuration du chapitre 13 (`proxy_pass http://backend:4000/api/;`, un préfixe identique au `location`) fonctionne parce que les routes backend sont elles-mêmes déjà préfixées `/api/...` (chapitre 14) — le remplacement est donc transparent (`/api/` → `/api/`). **Toujours vérifier, en cas de 404 inattendu derrière un reverse proxy, si ce comportement de remplacement est la cause réelle** (approfondi comme scénario complet au chapitre 48).

---

## 19.4 Compression gzip

```nginx
http {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1024;
    gzip_comp_level 6;
}
```

**Explication :**
```text
gzip on
→ active la compression des réponses avant leur envoi au client

gzip_types
→ limite la compression aux types de contenu qui en bénéficient réellement
  (texte, JSON, JavaScript, CSS) — compresser une image déjà compressée
  (JPEG, PNG) n'apporte rien et gaspille du CPU inutilement

gzip_min_length 1024
→ ignore les réponses trop petites (moins d'1 Ko), où le coût de compression
  dépasserait le gain de taille réel

gzip_comp_level 6
→ niveau de compromis entre taux de compression et charge CPU (1 = rapide/peu
  compressé, 9 = lent/très compressé ; 6 est un choix par défaut raisonnable)
```

> 📌 **À retenir** — La compression réduit directement le temps de chargement perçu par l'utilisateur, en particulier pour le JavaScript compilé d'une application React (chapitre 15) — souvent plusieurs centaines de kilooctets non compressés, réduits significativement avec gzip activé.

---

## 19.5 Cache navigateur pour les fichiers statiques

```nginx
location /assets/ {
    root /usr/share/nginx/html;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    proxy_pass http://backend:4000/api/;
    add_header Cache-Control "no-store";
}
```

**Explication :**
```text
expires 1y / Cache-Control "public, immutable"
→ indique au navigateur de conserver ce fichier en cache pendant un an,
  sans même revérifier auprès du serveur — pertinent pour des fichiers dont
  le nom change à chaque nouvelle version (un hash dans le nom de fichier,
  généré automatiquement par les outils de build modernes comme Vite)

Cache-Control "no-store" (sur les réponses API)
→ interdit explicitement toute mise en cache d'une réponse dynamique,
  qui doit toujours refléter l'état actuel des données
```

> ⚠️ **Attention** — Appliquer un cache d'un an à un fichier dont le nom **ne change jamais** entre deux versions (comme `index.html` lui-même) empêcherait les utilisateurs de recevoir une mise à jour de l'application avant l'expiration du cache — une erreur classique. La règle : mettre en cache longuement ce qui a un nom versionné (`app.a1b2c3.js`), jamais `index.html` lui-même ni les réponses d'API.

---

## 19.6 En-têtes de sécurité de base

```nginx
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

**Explication rapide** (détail complet des en-têtes de sécurité au chapitre 26) :
```text
X-Content-Type-Options "nosniff"
→ empêche le navigateur de deviner un type de fichier différent de celui déclaré

X-Frame-Options "SAMEORIGIN"
→ empêche le site d'être affiché dans une <iframe> d'un autre domaine
  (protection de base contre le clickjacking)

Referrer-Policy "strict-origin-when-cross-origin"
→ limite les informations envoyées dans l'en-tête Referer vers d'autres domaines
```

---

## 19.7 Configuration complète, application à l'architecture du chapitre 13

```nginx
server {
    listen 80;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1024;

    location /api/ {
        proxy_pass http://backend:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store";
    }

    location /assets/ {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        add_header X-Content-Type-Options "nosniff";
        add_header X-Frame-Options "SAMEORIGIN";
    }
}
```

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Toutes les requêtes semblent venir de la même IP côté backend | `X-Real-IP`/`X-Forwarded-For` absents | Ajouter les en-têtes de la section 19.2 |
| 404 sur des routes qui fonctionnent en accès direct au backend | Mauvaise gestion du slash final dans `proxy_pass` (section 19.3) | Vérifier la correspondance exacte entre le `location` et le chemin de `proxy_pass` |
| Chargement lent malgré une bonne connexion | Compression gzip non activée | Ajouter `gzip on;` et les types pertinents |
| Un utilisateur voit une ancienne version de l'application après un déploiement | Cache trop agressif sur `index.html` ou un fichier non versionné | Ne jamais appliquer `expires 1y` à un fichier dont le nom ne change pas entre versions |

---

## Laboratoire pratique n°1 — Vérifier les en-têtes de proxy transmis

**Objectifs :** exécuter et vérifier la section 19.2.
**Prérequis :** Chapitre 13.

**Étapes :** ajoute la route `/api/qui-suis-je` de la section 19.2 au backend du chapitre 13, mets à jour `nginx.conf`, reconstruis, puis `curl http://localhost:8080/api/qui-suis-je`.

**Résultat attendu :** l'adresse IP retournée n'est pas celle interne de Nginx sur le réseau Docker, mais reflète la présence effective des en-têtes transmis.

---

## Laboratoire pratique n°2 — Reproduire puis corriger le bug du slash final

**Objectifs :** vivre concrètement le piège de la section 19.3.
**Prérequis :** Laboratoire 1 complété.

**Étapes :**
1. Modifie temporairement `proxy_pass` en `http://backend:4000/;` (un seul slash, sans `api`).
2. Reconstruis, puis `curl http://localhost:8080/api/tasks` et observe l'échec (probablement une 404, le backend cherchant `/tasks` au lieu de `/api/tasks`).
3. Restaure `proxy_pass http://backend:4000/api/;` et confirme la correction.

**Résultat attendu :** compréhension vécue et non plus seulement lue du comportement de remplacement de préfixe.

---

## Laboratoire pratique n°3 — Mesurer l'effet de la compression gzip

**Objectifs :** vérifier concrètement le bénéfice de la section 19.4.
**Prérequis :** Laboratoires 1 et 2 complétés, frontend React du chapitre 15 disponible.

**Étapes :**
1. `curl -H "Accept-Encoding: gzip" -I http://localhost:8080/assets/nom-du-fichier.js` et note la présence de l'en-tête `Content-Encoding: gzip`.
2. Compare avec `curl -I http://localhost:8080/assets/nom-du-fichier.js` (sans l'en-tête `Accept-Encoding`) — Nginx ne compresse jamais si le client n'annonce pas le supporter.
3. Compare la taille annoncée (`Content-Length`) dans les deux cas.

**Résultat attendu :** une taille de réponse nettement réduite quand la compression est effectivement négociée.

---

## Exercices

1. Explique pourquoi `X-Real-IP` est nécessaire, malgré le fait que la connexion TCP elle-même contient déjà une adresse IP source.
2. Dans `location /api/ { proxy_pass http://backend:4000; }` (sans rien après le port), que devient une requête vers `/api/tasks` ?
3. Pourquoi ne faut-il jamais appliquer un cache d'un an à `index.html` lui-même ?
4. Pourquoi compresser une image déjà au format JPEG n'apporte-t-il généralement aucun bénéfice ?
5. Cite un en-tête de sécurité de base vu dans ce chapitre, et explique ce qu'il protège.

---

## Quiz

**Question 1.** `X-Forwarded-Proto` transmis par Nginx au backend sert à :
a) Chiffrer la connexion
b) Indiquer au backend le protocole (http/https) réellement utilisé par le client d'origine
c) Compresser la réponse
d) Bloquer les requêtes non sécurisées

**Question 2.** `location /api/ { proxy_pass http://backend:4000/; }` (avec un slash final, sans rien d'autre) transforme une requête `/api/tasks` en :
a) `http://backend:4000/api/tasks`
b) `http://backend:4000/tasks`
c) Une erreur systématique
d) `http://backend:4000/api/`

**Question 3.** `gzip_min_length 1024` sert à :
a) Compresser uniquement les fichiers de plus d'1 Ko
b) Bloquer les fichiers de plus d'1 Ko
c) Fixer un délai d'expiration du cache
d) Limiter le nombre de connexions simultanées

**Question 4.** Appliquer `Cache-Control: public, immutable` à une réponse d'API dynamique serait :
a) Une bonne pratique recommandée
b) Une erreur, car les données changent et ne doivent jamais être mises en cache aveuglément
c) Sans aucun effet
d) Obligatoire pour la sécurité

**Question 5.** `X-Frame-Options: SAMEORIGIN` protège contre :
a) Les attaques par force brute
b) L'affichage du site dans une iframe d'un autre domaine (clickjacking)
c) Les fuites de variables d'environnement
d) La perte de données d'un volume

> 🔑 **Corrigé** — 1: b · 2: b · 3: a · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Un reverse proxy sans en-têtes correctement transmis fait perdre au backend la vraie identité du client — `X-Real-IP`, `X-Forwarded-For` et `X-Forwarded-Proto` corrigent ça.
- Le comportement de `proxy_pass` selon la présence ou l'absence d'un chemin après l'hôte est un piège de syntaxe classique : avec chemin, remplacement de préfixe ; sans aucun chemin, transmission intégrale de l'URL d'origine.
- La compression gzip et le cache navigateur (bien ciblé, jamais sur du contenu dynamique ni sur `index.html`) réduisent significativement les temps de chargement perçus.
- Quelques en-têtes de sécurité de base (`X-Content-Type-Options`, `X-Frame-Options`) s'ajoutent à faible coût, en attendant le traitement complet du chapitre 26.

## ✅ Checklist avant de passer au chapitre 20

- [ ] Mon reverse proxy transmet les bons en-têtes au backend.
- [ ] Je sais expliquer précisément l'effet du slash final dans `proxy_pass`.
- [ ] J'ai activé la compression gzip et vérifié son effet.
- [ ] Je sais où appliquer un cache long, et où ne jamais le faire.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**`X-Forwarded-For` / `X-Real-IP`**
Définition simple : les en-têtes qui transmettent la vraie adresse IP du client à travers un reverse proxy.
Voir : Chapitre 19, section 19.2.

**Compression gzip**
Définition simple : la réduction de la taille d'une réponse HTTP avant son envoi, pour les types de contenu qui en bénéficient.
Voir : Chapitre 19, section 19.4.

---

## ❓ FAQ

**Pourquoi ne pas toujours transmettre l'URL complète avec `proxy_pass` sans aucun chemin, pour éviter le piège du slash ?**
C'est une option valable et parfois recommandée pour simplifier le raisonnement — mais elle exige alors que les routes backend correspondent exactement aux chemins publics exposés par Nginx, sans distinction possible entre eux, ce qui limite la flexibilité de réorganiser les routes publiques indépendamment des routes internes.

**Brotli (une alternative à gzip) est-il couvert par ce manuel ?**
Non — Brotli offre généralement une meilleure compression que gzip mais nécessite un module Nginx additionnel non présent par défaut dans l'image officielle. gzip, universellement disponible, est le choix par défaut de ce manuel.

**Ces en-têtes doivent-ils être répétés dans chaque `location` ?**
Certaines directives (comme `gzip`) se placent au niveau `http`/`server` et s'appliquent globalement ; d'autres (`add_header`, `proxy_set_header`) doivent être répétées par `location` si Nginx ne les hérite pas automatiquement selon leur contexte — un point de configuration Nginx plus avancé, à vérifier au cas par cas au-delà de ce chapitre.

---

## Références officielles

- Module ngx_http_proxy_module (`proxy_pass`, `proxy_set_header`) — [nginx.org/en/docs/http/ngx_http_proxy_module.html](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- Module de compression gzip — [nginx.org/en/docs/http/ngx_http_gzip_module.html](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
- En-têtes de sécurité HTTP (MDN) — [developer.mozilla.org/fr/docs/Web/HTTP/Headers](https://developer.mozilla.org/fr/docs/Web/HTTP/Headers)

---

## Conclusion

Nginx est maintenant configuré comme un vrai reverse proxy de production — en-têtes corrects, compression, cache ciblé. Le chapitre 20 assemble enfin toutes les briques de la Partie IV — React, Nginx, Node.js, PostgreSQL, Redis — dans une seule application full stack complète.

---

⬅️ [Chapitre 18 — Redis avec Docker](18-redis-avec-docker.md) · ➡️ **Suite : Chapitre 20 — Assembler une application full stack complète**
