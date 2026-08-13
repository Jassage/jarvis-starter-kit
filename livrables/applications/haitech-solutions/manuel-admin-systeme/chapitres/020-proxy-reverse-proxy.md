<div class="chapitre-titre-num">PARTIE III · CHAPITRE 17</div>

# Proxy et Reverse Proxy

## Rôle du proxy et du reverse proxy

Un proxy (proxy direct) intermédie les requêtes **sortantes** d'un réseau interne vers Internet : les postes clients s'y connectent pour accéder au web, plutôt que de sortir directement. Un reverse proxy fait l'inverse : il intermédie les requêtes **entrantes** d'Internet vers un ou plusieurs serveurs internes, se présentant comme le seul point de contact visible depuis l'extérieur. Les deux servent des objectifs très différents malgré la parenté de nom, et les confondre est une source fréquente d'erreur de conception.

## Fonctionnement comparé

| Aspect | Proxy direct | Reverse proxy |
|---|---|---|
| Sens du trafic intermédié | Sortant (interne → Internet) | Entrant (Internet → interne) |
| Visible pour | Les clients internes (configuré explicitement) | Les clients externes (transparent, ils croient parler au serveur final) |
| Objectifs typiques | Filtrage web, cache, contrôle d'accès, anonymisation partielle | Répartition de charge, terminaison TLS, cache, masquage de l'architecture interne |
| Exemples de logiciels | Squid, PfSense (proxy transparent) | Nginx, HAProxy, Traefik, Apache (mod_proxy) |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Un reverse proxy est aujourd'hui quasiment systématique devant toute application web moderne, même sans besoin de répartition de charge à proprement parler : il centralise la terminaison TLS (un seul certificat à gérer plutôt qu'un par serveur applicatif), ajoute une couche de cache, et masque la topologie interne réelle (l'attaquant externe ne voit que le reverse proxy, jamais directement le serveur applicatif).
</div>

## Prérequis

- Pour un proxy direct : une politique claire de filtrage web (catégories autorisées/interdites) et un plan pour les exceptions
- Pour un reverse proxy : les serveurs backend déjà déployés et fonctionnels, un certificat TLS valide (Partie XI, PKI)
- Une compréhension des en-têtes HTTP transmis (X-Forwarded-For, X-Forwarded-Proto) pour préserver l'information du client d'origine

## Mise en place d'un reverse proxy

1. **Définir la correspondance domaine/chemin → serveur backend** — Quel nom de domaine ou chemin d'URL route vers quelle application interne.
2. **Configurer la terminaison TLS** — Le certificat est installé sur le reverse proxy, le trafic interne vers le backend peut rester en clair (réseau interne de confiance) ou être re-chiffré selon le niveau de sécurité requis.
3. **Transmettre les en-têtes d'origine** — `X-Forwarded-For` (IP réelle du client), `X-Forwarded-Proto` (http/https d'origine), indispensables pour que l'application backend journalise correctement l'origine des requêtes.
4. **Configurer les vérifications de santé (health checks)** — Le reverse proxy doit détecter un backend défaillant et cesser de lui envoyer du trafic (voir Chapitre 19, load balancing).
5. **Mettre en place la mise en cache si pertinent** — Pour les contenus statiques, réduisant la charge sur les serveurs applicatifs.

## Configuration : exemples

```
# Nginx — reverse proxy simple avec terminaison TLS
server {
  listen 443 ssl;
  server_name app.otela.ht;
  ssl_certificate     /etc/ssl/certs/app.otela.ht.crt;
  ssl_certificate_key /etc/ssl/private/app.otela.ht.key;

  location / {
    proxy_pass http://192.168.20.10:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# Squid — proxy direct, extrait de configuration (filtrage par catégorie)
acl bloque_reseaux_sociaux dstdomain .facebook.com .instagram.com
http_access deny bloque_reseaux_sociaux
http_access allow localnet
http_access deny all

# Traefik — reverse proxy déclaratif via labels Docker (docker-compose.yml)
labels:
  - "traefik.http.routers.app.rule=Host(`app.otela.ht`)"
  - "traefik.http.routers.app.tls=true"
  - "traefik.http.services.app.loadbalancer.server.port=3000"
```

## Administration courante

- Surveiller les journaux d'accès du reverse proxy, première source de visibilité sur le trafic entrant réel (Partie X)
- Renouveler les certificats TLS avant expiration, idéalement via un mécanisme automatisé (Let's Encrypt/ACME, Partie XI)
- Vérifier périodiquement que les règles de filtrage du proxy direct restent alignées avec la politique de sécurité de l'entreprise

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Toujours transmettre les en-têtes `X-Forwarded-*` au backend, pour préserver la traçabilité de l'origine réelle des requêtes
- Centraliser la gestion des certificats TLS au niveau du reverse proxy plutôt que de les dupliquer sur chaque serveur applicatif
- Masquer les en-têtes révélant la technologie backend (version de serveur, framework) au niveau du reverse proxy
- Automatiser le renouvellement des certificats plutôt que de compter sur une procédure manuelle
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Oublier de transmettre `X-Forwarded-For`, rendant tous les journaux applicatifs backend inutilisables pour l'attribution d'une requête (tout apparaît comme venant du reverse proxy)
- Exposer directement un serveur applicatif backend sur Internet en parallèle du reverse proxy, contournant tout le filtrage prévu
- Laisser expirer un certificat TLS faute de suivi, provoquant une interruption de service visible et alarmante pour les utilisateurs
- Confondre proxy direct et reverse proxy dans la conception, créant une architecture qui ne répond ni à l'un ni à l'autre besoin
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| L'application backend journalise l'IP du reverse proxy pour toutes les requêtes | En-tête X-Forwarded-For non transmis ou non lu par l'application | Vérifier la configuration du reverse proxy et le middleware applicatif backend |
| Erreur de certificat côté client malgré un certificat valide sur le reverse proxy | DNS pointant vers le mauvais serveur, ou cache navigateur | Vérifier la résolution DNS réelle, tester en navigation privée |
| Le reverse proxy renvoie une erreur 502/504 | Backend indisponible ou health check défaillant | Vérifier l'état du serveur backend directement, les logs du reverse proxy |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le reverse proxy est un point de centralisation naturel pour la sécurité applicative : limitation de débit (rate limiting), blocage géographique si pertinent, masquage des détails techniques du backend (version, stack). C'est aussi un point de défaillance unique critique s'il n'est pas redondé (Partie IX) — sa panne rend tous les services qu'il dessert inaccessibles simultanément, même si les backends eux-mêmes fonctionnent parfaitement.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le rate limiting appliqué sur les endpoints d'authentification de plusieurs projets du portefeuille (POSTA, LAKAY, GESCOM) illustre une fonctionnalité que ce chapitre recommande de centraliser au niveau du reverse proxy plutôt que de la réimplémenter dans chaque application : sur POSTA, le rate limiter est actuellement en mémoire applicative, ce qui signifie qu'il se réinitialise à chaque redémarrage du processus — un reverse proxy dédié (Nginx avec `limit_req`, ou Traefik) offrirait une limitation de débit persistante et cohérente sur l'ensemble des applications de Haitech Solutions, sans dupliquer cette logique dans chaque backend.
</div>

## Résumé du chapitre

- Un proxy direct intermédie le trafic sortant ; un reverse proxy intermédie le trafic entrant vers des serveurs internes.
- Le reverse proxy centralise la terminaison TLS, le cache et le masquage de l'architecture interne.
- Transmettre les en-têtes X-Forwarded-* est indispensable pour préserver la traçabilité des requêtes.
- Le reverse proxy, souvent point de défaillance unique, doit être redondé dès que sa criticité le justifie.

*Chapitre suivant : le VPN, accès distant sécurisé.*
