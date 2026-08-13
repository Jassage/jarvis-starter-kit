<div class="chapitre-titre-num">PARTIE III · CHAPITRE 19</div>

# Load Balancing : répartition de charge

## Rôle du load balancing

La répartition de charge (load balancing) distribue le trafic entrant entre plusieurs serveurs backend identiques, poursuivant simultanément deux objectifs : la performance (aucun serveur unique n'absorbe toute la charge) et la haute disponibilité (la panne d'un serveur backend n'interrompt pas le service, le répartiteur cesse simplement de lui envoyer du trafic). C'est un complément direct du reverse proxy (Chapitre 17), souvent porté par le même composant logiciel.

## Fonctionnement : niveaux et algorithmes

| Niveau | Couche OSI | Principe | Cas d'usage |
|---|---|---|---|
| L4 (transport) | 4 | Répartit selon IP/port, sans lire le contenu applicatif | Trafic générique TCP/UDP, très haute performance |
| L7 (application) | 7 | Répartit selon le contenu HTTP (chemin d'URL, en-têtes, cookies) | Applications web, routage fin par service |

### Algorithmes de répartition courants

| Algorithme | Principe | Cas d'usage |
|---|---|---|
| Round robin | Distribution cyclique, un serveur après l'autre | Backends de capacité homogène |
| Least connections | Envoie vers le serveur ayant le moins de connexions actives | Charges de durée variable (certaines requêtes plus longues que d'autres) |
| IP hash | La même IP source est toujours dirigée vers le même serveur | Sessions applicatives sans état partagé entre serveurs (sticky session) |
| Pondéré (weighted) | Distribution proportionnelle à une capacité déclarée par serveur | Backends de capacités matérielles différentes |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Une « sticky session » (session collante) force toutes les requêtes d'un même utilisateur vers le même serveur backend pendant la durée de sa session, généralement via un cookie ou l'IP hash. C'est une solution pragmatique quand l'état de session est stocké localement sur chaque serveur plutôt que partagé (Redis, base de données) — mais elle limite l'efficacité de la répartition et complique la bascule en cas de panne du serveur concerné. La solution structurellement plus robuste est une application sans état (stateless), où n'importe quel serveur peut traiter n'importe quelle requête.
</div>

## Prérequis

- Au moins deux instances backend identiques et interchangeables
- Une stratégie claire sur l'état applicatif : partagé (session en base/cache commun) ou local (nécessitant des sticky sessions)
- Un mécanisme de vérification de santé (health check) fiable pour chaque backend

## Mise en place d'un répartiteur de charge

1. **Déployer au moins deux instances backend identiques** — Version, configuration et accès aux mêmes données strictement identiques.
2. **Choisir le niveau et l'algorithme** — L7 avec least connections pour la majorité des applications web modernes.
3. **Configurer les vérifications de santé** — Un endpoint dédié (`/healthz`) que le répartiteur interroge périodiquement, retirant automatiquement un backend en échec.
4. **Décider de la gestion de session** — Stateless recommandé ; sticky sessions en solution de repli si nécessaire.
5. **Tester la bascule** — Arrêter volontairement un backend et vérifier que le service reste disponible sans interruption perceptible.

## Configuration : exemples

```
# HAProxy — répartition L7 avec vérification de santé
frontend front_web
  bind *:443 ssl crt /etc/ssl/certs/app.pem
  default_backend back_web

backend back_web
  balance leastconn
  option httpchk GET /healthz
  server app1 192.168.20.10:3000 check
  server app2 192.168.20.11:3000 check
  server app3 192.168.20.12:3000 check backup

# Nginx — répartition simple round robin avec health check passif
upstream backend_pool {
  least_conn;
  server 192.168.20.10:3000 max_fails=3 fail_timeout=30s;
  server 192.168.20.11:3000 max_fails=3 fail_timeout=30s;
}
server {
  listen 443 ssl;
  location / {
    proxy_pass http://backend_pool;
  }
}
```

## Administration courante

- Surveiller la distribution réelle de charge entre backends, un déséquilibre persistant indique souvent un problème de configuration ou un backend sous-dimensionné
- Vérifier périodiquement que les health checks reflètent réellement l'état de santé applicatif (pas seulement « le port répond », mais « le service fonctionne »)
- Tester régulièrement la procédure de retrait planifié d'un backend (pour maintenance), sans coupure de service

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Concevoir les applications de façon stateless dès que possible, plutôt que de compenser par des sticky sessions
- Utiliser un endpoint de health check applicatif réel (vérifiant la connectivité base de données, par exemple), pas uniquement une réponse HTTP 200 statique
- Tester la bascule automatique en environnement de pré-production avant de faire confiance à la haute disponibilité en production
- Dimensionner le nombre de backends avec une marge permettant d'absorber la perte d'au moins une instance sans dégradation perceptible (N+1 minimum)
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Un health check qui vérifie uniquement que le port TCP répond, sans jamais détecter qu'un service est bloqué ou en erreur applicative
- Déployer des backends avec des versions de code différentes entre eux, provoquant un comportement incohérent selon le serveur qui répond
- Ignorer la latence introduite par le répartiteur lui-même, qui devient à son tour un point de défaillance unique s'il n'est pas redondé (Partie IX)
- Confondre répartition de charge et haute disponibilité complète : répartir la charge entre plusieurs instances applicatives ne protège pas automatiquement une base de données unique en amont
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Un utilisateur perd sa session en cours de navigation | Absence de sticky session alors que l'état est stocké localement sur chaque serveur | Vérifier la stratégie de gestion d'état, envisager un état partagé (Redis) |
| Un backend continue de recevoir du trafic malgré une panne | Health check insuffisant, ou intervalle de vérification trop long | Resserrer l'intervalle de vérification, approfondir le contenu du health check |
| La charge reste concentrée sur un seul backend | Algorithme mal choisi (IP hash avec peu de clients distincts), ou poids mal configuré | Revoir l'algorithme de répartition et les poids déclarés |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le répartiteur de charge, en position frontale, est un point naturel pour appliquer une limitation de débit (rate limiting) et un filtrage de base contre les attaques par déni de service applicatif, en complément du pare-feu périmétrique (Chapitre 16). Comme pour le reverse proxy, sa propre disponibilité doit être assurée (Partie IX) : sa panne rend indisponible l'ensemble des backends qu'il dessert, même s'ils fonctionnent tous parfaitement.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
REYINYON a été testé avec deux instances backend Socket.io séparées derrière un adapter Redis pour le scaling horizontal, une architecture directement comparable à un déploiement multi-backend derrière un répartiteur de charge : l'état des connexions temps réel (qui est connecté à quelle réunion) est partagé via Redis plutôt que stocké localement sur chaque instance, permettant à n'importe quelle instance de traiter n'importe quel client — exactement le principe stateless recommandé dans ce chapitre plutôt que de dépendre de sticky sessions.
</div>

## Résumé du chapitre

- Le load balancing répartit le trafic entre plusieurs backends identiques, pour la performance et la haute disponibilité simultanément.
- L4 répartit sans lire le contenu applicatif ; L7 permet un routage fin selon le contenu HTTP.
- Une architecture stateless est structurellement plus robuste qu'une dépendance aux sticky sessions.
- Le répartiteur de charge lui-même doit être redondé, sous peine de devenir un nouveau point de défaillance unique.

*Ceci conclut la Partie III. Partie suivante : identité, annuaire et contrôle d'accès (Active Directory, Entra ID, LDAP, GPO, Kerberos).*
