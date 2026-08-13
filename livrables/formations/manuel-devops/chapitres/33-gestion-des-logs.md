<div class="chapitre-titre-num">CHAPITRE 33 · 🟡 INTERMÉDIAIRE</div>

# Gestion des logs

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre les logs applicatifs, Nginx et Docker, mettre en place une rotation qui évite qu'ils ne saturent le disque, et présenter les solutions de centralisation pertinentes quand plusieurs sources de logs doivent être consultées ensemble. Ce chapitre approfondit le second pilier du monitoring introduit au chapitre 32.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Une métrique (chapitre 32) dit "le taux d'erreur a augmenté à 14h32" — un log dit précisément **pourquoi** : quelle requête, quel utilisateur, quel message d'erreur exact, quelle pile d'appels. Les métriques détectent qu'un problème existe ; les logs permettent de comprendre lequel. Ce chapitre organise ce qui, jusqu'ici dans ce manuel, a été consulté au coup par coup avec `docker logs` (chapitre 11) et `journalctl` (chapitre 4).
</div>

## 33.1 Logs applicatifs : format structuré plutôt que texte libre

```javascript
// Log non structuré (à éviter)
console.log('Utilisateur ' + email + ' connecté à ' + new Date());

// Log structuré (JSON, recommandé)
const logger = require('pino')();
logger.info({ evenement: 'connexion_utilisateur', email, horodatage: new Date().toISOString() });
```

<div class="encadre retenir">
<span class="encadre-titre">📌 Pourquoi structurer les logs (JSON) plutôt que du texte libre</span>
Un log en texte libre ("Utilisateur test@exemple.com connecté à...") est lisible par un humain mais très difficile à interroger automatiquement ("combien de connexions par heure ?", "quels emails ont échoué à se connecter ?"). Un log structuré (JSON, avec des champs nommés) reste lisible tout en étant directement exploitable par un outil d'agrégation (section 33.4) — chaque champ devient filtrable et agrégeable sans analyse de texte fragile.
</div>

**Niveaux de log**, du plus au moins verbeux : `debug` (détail technique fin, utile en développement, généralement désactivé en production) → `info` (événements normaux notables) → `warn` (anormal mais non bloquant) → `error` (une erreur réelle) → `fatal` (l'application ne peut plus continuer).

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — ajuster le niveau selon l'environnement (rappel du chapitre 18)</span>
`debug` en développement, `info` ou `warn` en production — exactement l'exemple donné au chapitre 18 (section 18.4) de ce qui doit légitimement différer entre environnements. Un niveau `debug` laissé actif en production noie l'information réellement utile sous un volume excessif.
</div>

## 33.2 Logs Nginx

```nginx
log_format detaille '$remote_addr - $remote_user [$time_local] '
                     '"$request" $status $body_bytes_sent '
                     '"$http_referer" "$http_user_agent" $request_time';

access_log /var/log/nginx/access.log detaille;
error_log /var/log/nginx/error.log warn;
```

**Explication :** `access_log` enregistre chaque requête reçue (adresse IP, requête exacte, code de statut, temps de réponse `$request_time` — une métrique de performance précieuse) ; `error_log` enregistre les problèmes rencontrés par Nginx lui-même (pas les erreurs applicatives, celles-ci vivent dans les logs de l'application, section 33.1).

```bash
tail -f /var/log/nginx/access.log
grep " 500 " /var/log/nginx/access.log | tail -20
```

**Cas pratique DevOps :** ce filtre (chapitre 4, `grep`) retrouve rapidement les 20 dernières requêtes ayant échoué avec une erreur serveur — un premier réflexe de diagnostic avant de creuser dans les logs applicatifs plus détaillés.

## 33.3 Logs Docker

```bash
docker logs --tail 100 -f mon-conteneur
docker logs --since 30m mon-conteneur
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les logs Docker par défaut ne tournent PAS automatiquement</span>
Sans configuration explicite, le pilote de log par défaut de Docker (`json-file`) peut accumuler indéfiniment, remplissant progressivement le disque du serveur — un scénario de panne classique ("disque plein" du chapitre 4, section 4.5) directement causé par des logs jamais nettoyés.
</div>

```yaml
services:
  api:
    image: mon-api:1.0.0
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Explication :** `max-size: "10m"` limite chaque fichier de log à 10 Mo ; `max-file: "3"` conserve au maximum 3 fichiers (le plus ancien étant supprimé automatiquement dès qu'un nouveau se crée) — un plafond total de 30 Mo par conteneur, jamais une croissance illimitée.

## 33.4 Rotation des logs système

```bash
# /etc/logrotate.d/mon-application
/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

**Explication :** `logrotate` (déjà installé par défaut sur Ubuntu Server, orchestrant la rotation de nombreux services système) archive quotidiennement (`daily`) les logs Nginx, garde 14 jours d'historique (`rotate 14`), compresse les anciens fichiers (`compress`, avec un délai d'un jour avant compression via `delaycompress`, pour ne jamais compresser le fichier activement écrit), sans erreur si le fichier n'existe pas encore (`missingok`) ni s'il est vide (`notifempty`).

## 33.5 Centralisation : quand plusieurs sources deviennent difficiles à croiser

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Pourquoi centraliser devient nécessaire</span>
Avec une seule application sur un seul serveur, consulter `docker logs` suffit. Dès que plusieurs services (chapitre 13) ou plusieurs serveurs entrent en jeu, reconstituer manuellement une chronologie à partir de logs dispersés devient rapidement impraticable — un système de centralisation regroupe tous les logs dans un seul endroit interrogeable.
</div>

| Solution | Caractéristique |
|---|---|
| **Loki** (Grafana Loki) | Léger, s'intègre nativement avec Grafana (chapitre 32), indexe uniquement les labels, pas le contenu complet |
| **ELK / OpenSearch** | Plus complet (Elasticsearch, Logstash, Kibana), plus lourd à opérer, recherche plein texte puissante |
| **Solutions cloud managées** | CloudWatch Logs (AWS), Azure Monitor Logs — approfondi au chapitre 40 |

```yaml
# Extrait Compose : Loki + Promtail (agent de collecte)
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
```

**Explication :** `promtail` collecte automatiquement les logs de tous les conteneurs Docker du serveur (en lisant directement les fichiers gérés par Docker) et les transmet à `loki`, consultable ensuite directement depuis Grafana (chapitre 32) — les métriques et les logs réunis dans une seule interface.

## Atelier — Configurer une rotation complète et vérifier son fonctionnement

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 33.1 — Empêcher un disque plein causé par des logs</span>

**Objectif** : appliquer les protections de rotation à l'architecture du chapitre 13, et vérifier qu'elles fonctionnent réellement.

**Étapes détaillées** :

1. Ajoute la configuration `logging` (section 33.3) à chaque service du fichier Compose du chapitre 13.
2. Génère volontairement un volume important de logs (une boucle qui appelle l'API de façon répétée), observe la taille des fichiers de log Docker (`docker inspect --format='{{.LogPath}}' nom_conteneur`) rester plafonnée malgré ce volume.
3. Installe et configure `logrotate` pour les logs Nginx (section 33.4), force une rotation manuelle (`sudo logrotate -f /etc/logrotate.d/mon-application`) et vérifie qu'un fichier compressé apparaît bien.

**Résultat attendu** : la preuve, en conditions contrôlées, qu'un volume de logs important ne peut pas saturer le disque du serveur, grâce aux deux mécanismes de rotation appliqués.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Aucune limite sur les logs Docker</span>
Rappel de la section 33.3 : sans `max-size`/`max-file` explicites, les logs Docker peuvent croître indéfiniment — un des scénarios de panne les plus fréquents et les plus évitables du chapitre 46.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Niveau `debug` laissé actif en production</span>
Comme signalé en section 33.1, un niveau de log trop verbeux en production noie l'information réellement utile et accélère la croissance du volume de logs, sans bénéfice proportionné une fois le développement terminé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Logs non structurés difficiles à interroger a posteriori</span>
Des logs en texte libre, sans structure cohérente, deviennent très pénibles à analyser une fois centralisés (section 33.5) — impossible de filtrer proprement sans une analyse de texte fragile et sujette à erreur.
</div>

## En entreprise

**Réalité répandue** : la rétention des logs est souvent contrainte par des exigences réglementaires (conservation minimale pour un audit de sécurité) autant que par des considérations de coût de stockage — un équilibre à documenter explicitement plutôt qu'à laisser au hasard d'une configuration par défaut.

**Bonne pratique répandue** : les logs incluent systématiquement un **identifiant de corrélation** (un identifiant unique généré au début de chaque requête, propagé à travers tous les logs qu'elle génère) — permettant de reconstituer précisément le parcours complet d'une requête même à travers plusieurs services, une préfiguration directe des traces distribuées du chapitre 34.

**Erreur classique observée** : des logs contenant des données personnelles ou sensibles en clair (mots de passe accidentellement loggés lors d'un débogage, données personnelles de clients) — une pratique risquée en matière de conformité et de sécurité, à éviter systématiquement en excluant ces champs explicitement des logs.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi préférer des logs structurés (JSON) à des logs en texte libre ?"**
Réponse attendue : les logs structurés restent lisibles tout en étant directement filtrables et agrégeables par un outil, sans analyse de texte fragile — essentiel dès qu'un système de centralisation entre en jeu (section 33.1 et 33.5).

**Q2. "Comment empêcher les logs Docker de saturer le disque d'un serveur ?"**
Réponse attendue : configurer `max-size` et `max-file` dans les options de logging du service, limitant explicitement le volume conservé par conteneur (section 33.3).

**Q3. "Quand devient-il nécessaire de centraliser les logs plutôt que de les consulter directement sur chaque serveur ?"**
Réponse attendue : dès que plusieurs services ou serveurs entrent en jeu, reconstituer manuellement une chronologie devient impraticable — un système comme Loki ou ELK regroupe tous les logs dans une interface unique interrogeable (section 33.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne jamais logger un secret (mot de passe, jeton, clé API, chapitre 25) même accidentellement lors d'un débogage temporaire — un log contenant un secret le rend potentiellement consultable par quiconque a accès au système de logs, souvent plus de personnes qu'à la base de données elle-même.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Adopte un format de log structuré cohérent dès le début d'un projet, plutôt que de le retrofitter plus tard sur des milliers de lignes de `console.log` existantes — le coût de migration grandit avec le temps, pas l'inverse.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un logging excessif (niveau `debug` en production, section "Erreurs fréquentes") a un coût réel en performance (écriture disque, sérialisation) en plus du coût de stockage — un réglage à ajuster consciemment selon l'environnement, jamais laissé par défaut sans réflexion.
</div>

## Résumé du chapitre

- Les logs structurés (JSON) restent lisibles par un humain tout en étant directement exploitables par un outil, contrairement au texte libre.
- Les logs Nginx (access/error) et applicatifs répondent à des questions différentes et complémentaires.
- Sans limite explicite (`max-size`/`max-file`), les logs Docker peuvent saturer le disque d'un serveur.
- `logrotate` gère la rotation des logs système, avec compression et rétention configurables.
- La centralisation (Loki, ELK) devient nécessaire dès que plusieurs services ou serveurs rendent la consultation manuelle impraticable.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un log structuré (JSON), par rapport à un log en texte libre :
   - a) Est toujours moins lisible
   - b) Reste lisible tout en étant directement filtrable et agrégeable par un outil
   - c) Ne peut jamais être centralisé
   - d) Prend systématiquement moins de place

2. Sans configuration explicite de `max-size`/`max-file`, les logs Docker :
   - a) Sont automatiquement limités à 10 Mo
   - b) Peuvent croître indéfiniment et saturer le disque
   - c) Sont supprimés après chaque redémarrage
   - d) Ne sont jamais écrits sur le disque

3. La centralisation des logs devient particulièrement utile :
   - a) Uniquement pour une application avec un seul service sur un seul serveur
   - b) Dès que plusieurs services ou serveurs rendent la consultation manuelle impraticable
   - c) Jamais, elle est toujours superflue
   - d) Uniquement en environnement de développement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un niveau de log `debug` devrait rester actif en production pour ne rien manquer. — **Faux** (section 33.1, erreur fréquente n°2).
2. Les logs Nginx `error_log` enregistrent les erreurs applicatives du code métier. — **Faux** (ils enregistrent les problèmes de Nginx lui-même, section 33.2).
3. Un identifiant de corrélation permet de reconstituer le parcours complet d'une requête à travers plusieurs services. — **Vrai** (section "En entreprise").

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 33.1</span>

Un serveur de production tombe en panne pour cause de disque plein. L'investigation révèle que `/var/lib/docker/containers/` occupe 40 Go. Explique la cause la plus probable et la correction à appliquer.
</div>

**Corrigé :** la cause la plus probable est l'absence de configuration `logging` (`max-size`/`max-file`, section 33.3) sur un ou plusieurs conteneurs, dont les logs accumulés sans limite depuis un temps prolongé (section "Erreurs fréquentes", erreur n°1) ont progressivement rempli le disque. La correction immédiate consiste à identifier les conteneurs responsables (`du -sh /var/lib/docker/containers/*`, chapitre 4), tronquer ou nettoyer leurs logs existants, puis ajouter la configuration `logging` manquante à chaque service du fichier Compose pour empêcher toute récidive.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais structurer mes logs applicatifs en JSON, avec des niveaux appropriés selon l'environnement.</li>
<li>☐ Je sais distinguer les logs Nginx access/error et leur usage respectif.</li>
<li>☐ J'ai configuré `max-size`/`max-file` sur mes conteneurs Docker.</li>
<li>☐ J'ai configuré `logrotate` pour les logs système, avec rétention et compression.</li>
<li>☐ Je sais quand la centralisation des logs devient nécessaire, et je connais au moins une solution (Loki ou ELK).</li>
<li>☐ Je ne logge jamais de secret, même accidentellement lors d'un débogage.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Loki ou ELK : lequel choisir pour débuter ?</dt>
<dd>Loki, plus léger et déjà intégré nativement avec Grafana (déjà en place depuis le chapitre 32), est généralement plus simple à mettre en place pour un premier projet — ELK devient pertinent pour des besoins de recherche plein texte plus poussés, à une échelle plus importante.</dd>

<dt>Combien de temps conserver les logs ?</dt>
<dd>Il n'existe pas de règle universelle — un compromis entre besoin réel de diagnostic historique, contraintes réglementaires éventuelles, et coût de stockage ; 30 jours est un point de départ raisonnable pour beaucoup de projets, ajustable selon le contexte.</dd>

<dt>Faut-il logger chaque requête HTTP en détail ?</dt>
<dd>Les logs `access_log` de Nginx (section 33.2) couvrent déjà cette granularité pour toutes les requêtes ; les logs applicatifs plus détaillés (section 33.1) devraient plutôt se concentrer sur les événements métier significatifs et les erreurs, pour éviter un volume excessif sans valeur ajoutée proportionnée.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Grafana Loki : [https://grafana.com/docs/loki/latest/](https://grafana.com/docs/loki/latest/)
- Documentation officielle Docker — configuration des logs : [https://docs.docker.com/engine/logging/configure/](https://docs.docker.com/engine/logging/configure/)
- `logrotate` — page de manuel officielle : [https://linux.die.net/man/8/logrotate](https://linux.die.net/man/8/logrotate)

*Chapitre suivant : observabilité — les trois piliers (logs, métriques, traces) réunis en une seule discipline, avec une introduction progressive à OpenTelemetry, qui clôt la Partie X.*
