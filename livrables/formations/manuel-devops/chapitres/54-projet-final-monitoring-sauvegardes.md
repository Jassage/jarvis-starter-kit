<div class="chapitre-titre-num">CHAPITRE 54 · 🔴 PROFESSIONNEL</div>

# Projet final : monitoring et sauvegardes

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Donner à GestionTâches une vraie observabilité (Prometheus, Grafana) et une stratégie de sauvegarde complète et testée. Ce chapitre couvre les phases 14-15 du projet final, appliquant intégralement les chapitres 32 et 31 à l'application déployée au chapitre 52 et automatisée au chapitre 53.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
GestionTâches est en production, déployée automatiquement à chaque changement. Mais personne ne sait, à cet instant, si l'application fonctionne réellement bien, ni si ses données seraient récupérables en cas de problème. Ce chapitre comble ces deux lacunes avant d'aborder la sécurisation (chapitre 55) — voir ce qui se passe, et pouvoir revenir en arrière si les données sont perdues, sont deux prérequis à tout le reste.
</div>

## 54.1 Instrumenter l'API avec des métriques

```javascript
// api/metrics.js
const client = require('prom-client');
client.collectDefaultMetrics();

const compteurTaches = new client.Counter({
  name: 'gestiontaches_taches_creees_total',
  help: 'Nombre total de tâches créées',
});

module.exports = { client, compteurTaches };
```

```javascript
// api/index.js, extrait
const { client, compteurTaches } = require('./metrics');

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Dans la route POST /api/taches, après création réussie :
compteurTaches.inc();
```

**Explication :** reprend exactement le chapitre 32 (section 32.3) — `collectDefaultMetrics()` capture automatiquement des métriques système génériques (mémoire, CPU du processus Node.js) ; `compteurTaches` est une métrique **métier** spécifique à GestionTâches, illustrant la différence entre métriques génériques et métriques applicatives propres au domaine.

## 54.2 Prometheus et Grafana pour GestionTâches

```yaml
# Ajout au compose.yaml de production (chapitre 51)
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - donnees-prometheus:/prometheus

  grafana:
    image: grafana/grafana:latest
    volumes:
      - donnees-grafana:/var/lib/grafana

volumes:
  donnees-prometheus:
  donnees-grafana:
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: "gestiontaches-api"
    static_configs:
      - targets: ["api:3000"]
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — ni Prometheus ni Grafana ne devraient être exposés publiquement</span>
Rappel direct du chapitre 32 (section "Sécurité") : ces deux services ne publient <strong>aucun</strong> port dans <code>compose.yaml</code> — un accès se ferait uniquement via un tunnel SSH (<code>ssh -L 3001:localhost:3001 deploiement@serveur</code>) ou une authentification supplémentaire dédiée, jamais un accès public direct sur ce projet.
</div>

## 54.3 Une alerte simple et actionnable

```yaml
# alert_rules.yml
groups:
  - name: gestiontaches
    rules:
      - alert: APIIndisponible
        expr: up{job="gestiontaches-api"} == 0
        for: 1m
        annotations:
          resume: "L'API GestionTâches ne répond plus aux vérifications Prometheus"
```

**Explication :** cette règle (chapitre 32, section 32.5) exploite la métrique `up`, automatiquement générée par Prometheus pour chaque cible surveillée (`1` si joignable, `0` sinon) — la vérification de disponibilité la plus fondamentale possible, avec un seuil de persistance (`for: 1m`) pour éviter une fausse alerte sur un redémarrage bref et normal (comme celui déclenché par le pipeline du chapitre 53).

## 54.4 Sauvegarder GestionTâches

```bash
#!/bin/bash
# scripts/backup-db.sh, sur le serveur de production
set -e

DATE_DU_JOUR=$(date +%Y%m%d-%H%M%S)
DOSSIER="/home/deploiement/sauvegardes"
FICHIER="${DOSSIER}/gestiontaches-db-${DATE_DU_JOUR}.sql.gz"

mkdir -p "$DOSSIER"
docker compose exec -T db pg_dump -U gestiontaches gestiontaches | gzip > "$FICHIER"
echo "Sauvegarde créée : $FICHIER"

find "$DOSSIER" -name "gestiontaches-db-*.sql.gz" -mtime +7 -delete
```

**Explication :** reprend exactement le chapitre 31 (section 31.2), avec la politique de rétention de 7 jours (section 31.4) intégrée directement au script.

```bash
crontab -e
```
```text
0 2 * * * /home/deploiement/gestiontaches/scripts/backup-db.sh >> /var/log/backup-gestiontaches.log 2>&1
```

## 54.5 Tester la restauration, sans exception

<div class="encadre securite">
<span class="encadre-titre">🔒 Le principe le plus important du chapitre 31, appliqué concrètement ici</span>
Une sauvegarde jamais testée en restauration n'est pas une garantie — ce principe s'applique à GestionTâches exactement comme à n'importe quel autre projet de ce manuel, sans exception pour un "simple projet pédagogique".
</div>

```bash
# Sur une base de test SÉPARÉE, jamais la production
docker run --rm -e POSTGRES_PASSWORD=test -e POSTGRES_DB=gestiontaches_restauration \
  --name pg-test -d postgres:16
sleep 5
gunzip -c gestiontaches-db-20260810-020000.sql.gz | docker exec -i pg-test psql -U postgres -d gestiontaches_restauration
docker exec pg-test psql -U postgres -d gestiontaches_restauration -c "SELECT COUNT(*) FROM taches;"
docker rm -f pg-test
```

**Cas pratique DevOps :** ce test, reprenant exactement l'atelier 31.1, confirme que la sauvegarde contient réellement les données attendues, avant de considérer la stratégie de sauvegarde fiable.

## Atelier — Observabilité et sauvegarde complètes pour GestionTâches

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 54.1 — Voir et pouvoir restaurer, pas seulement espérer</span>

**Objectif** : instrumenter, surveiller et sauvegarder GestionTâches de bout en bout, avec vérification réelle de chaque mécanisme.

**Étapes détaillées** :

1. Ajoute les métriques de la section 54.1 à l'API, redéploie via le pipeline du chapitre 53.
2. Ajoute Prometheus et Grafana au `compose.yaml` de production (section 54.2), sans exposer aucun port publiquement.
3. Construis un tableau de bord Grafana simple : disponibilité de l'API (`up`), nombre de tâches créées, temps de réponse.
4. Configure l'alerte de la section 54.3, provoque volontairement une indisponibilité (arrête le conteneur `api`) pour vérifier son déclenchement.
5. Configure la sauvegarde automatisée (section 54.4), exécute-la manuellement une première fois, puis teste réellement sa restauration (section 54.5) avec des données de test identifiables.

**Résultat attendu** : GestionTâches observable en continu et sauvegardée de façon vérifiée — les deux prérequis, désormais réellement satisfaits, avant la sécurisation du chapitre 55.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Exposer Prometheus ou Grafana publiquement "pour un accès plus simple"</span>
Rappel de la section 54.2 — un accès via tunnel SSH reste la méthode recommandée pour ce projet, jamais un port publié directement dans `compose.yaml`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Une sauvegarde automatisée jamais testée en restauration</span>
Rappel du principe central du chapitre 31 (section 31.7) — mettre en place le script de sauvegarde ne suffit jamais seul, la restauration doit être réellement vérifiée.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Une alerte sans seuil de persistance, déclenchée à chaque redéploiement</span>
Sans `for: 1m` (section 54.3), l'alerte se déclencherait à chaque redémarrage normal du conteneur API pendant un déploiement (chapitre 53) — un bruit constant qui finirait par être ignoré, exactement le piège déjà signalé au chapitre 32 (section "Erreurs fréquentes", erreur n°2).
</div>

## En entreprise

**Réalité répandue** : même un projet de taille modeste comme GestionTâches bénéficie d'un monitoring et d'une sauvegarde de base dès sa mise en production réelle — ces deux disciplines ne sont jamais "réservées aux grands projets", elles sont proportionnées mais présentes dès le premier déploiement en conditions réelles.

**Bonne pratique répandue** : le test de restauration (section 54.5) est souvent automatisé lui-même, dans un pipeline séparé qui s'exécute périodiquement — une évolution naturelle une fois la procédure manuelle bien maîtrisée, comme elle l'est désormais pour ce projet.

**Erreur classique observée** : dans plusieurs projets réels du portefeuille de Jaslin, une stratégie de sauvegarde a été mise en place puis jamais vérifiée pendant des mois — un rappel que ce chapitre applique dès maintenant la discipline complète, immédiatement, plutôt que de la reporter.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment as-tu instrumenté ce projet pour le monitoring ?"**
Réponse attendue : des métriques génériques (via `collectDefaultMetrics`) et une métrique métier spécifique, exposées sur `/metrics`, collectées par Prometheus et visualisées dans Grafana, sans exposition publique (sections 54.1-54.2).

**Q2. "Pourquoi une alerte de disponibilité a-t-elle besoin d'un seuil de persistance (`for:`) ?"**
Réponse attendue : éviter qu'un redémarrage normal et bref (comme celui d'un déploiement) ne déclenche une fausse alerte — attendre une indisponibilité réellement persistante avant de notifier (section 54.3).

**Q3. "Comment as-tu vérifié que ta stratégie de sauvegarde fonctionne réellement ?"**
Réponse attendue : une restauration réelle sur une base séparée, avec des données de test identifiables vérifiées après restauration — jamais une simple confiance dans le message "succès" du script de sauvegarde (section 54.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les sauvegardes de GestionTâches méritent le même niveau de protection que la base de données originale (chapitre 31, section "Sécurité") — un stockage hors serveur (approfondi au chapitre 55) reste la prochaine étape logique une fois cette base établie.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente le tableau de bord Grafana construit à l'atelier 54.1 (quelles métriques, pourquoi) dans le `DEPLOIEMENT.md` du projet — un tableau de bord non documenté perd de sa valeur pour quiconque le découvre après toi.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
La métrique de temps de réponse (déjà exposée automatiquement par `collectDefaultMetrics` combiné à un middleware de mesure, non détaillé ici par souci de concision) permettrait d'appliquer directement les principes du chapitre 47 (p95/p99) à GestionTâches, si un besoin de performance se manifestait un jour.
</div>

## Résumé du chapitre

- GestionTâches expose désormais des métriques génériques et métier via `/metrics`, jamais accessible publiquement.
- Prometheus et Grafana, déjà utilisés au chapitre 32, sont appliqués concrètement à ce projet, avec un tableau de bord et une alerte de disponibilité.
- Une sauvegarde quotidienne automatisée, avec politique de rétention, protège les données de la base.
- Le principe central du chapitre 31 — tester réellement la restauration — est appliqué sans exception à ce projet.
- Ces deux disciplines (observabilité, sauvegarde) sont des prérequis, pas des raffinements optionnels, avant la sécurisation du chapitre 55.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Prometheus et Grafana, pour ce projet, devraient être :
   - a) Exposés publiquement pour un accès facile
   - b) Accessibles uniquement via un tunnel SSH ou un mécanisme équivalent, jamais publics
   - c) Supprimés en production
   - d) Fusionnés en un seul conteneur

2. L'alerte de disponibilité de ce chapitre utilise :
   - a) Une métrique personnalisée complexe
   - b) La métrique `up`, générée automatiquement par Prometheus pour chaque cible surveillée
   - c) Uniquement les logs Nginx
   - d) Une vérification manuelle quotidienne

3. Une sauvegarde automatisée mais jamais testée en restauration est :
   - a) Une garantie suffisante
   - b) Un risque non prouvé, potentiellement inexploitable en cas de besoin réel
   - c) Toujours fiable par défaut
   - d) Inutile à mettre en place

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un projet pédagogique comme GestionTâches n'a pas besoin d'une vraie stratégie de sauvegarde. — **Faux** (section "En entreprise").
2. L'alerte de ce chapitre inclut un seuil de persistance pour éviter les fausses alertes lors d'un redéploiement normal. — **Vrai** (section 54.3).
3. Le test de restauration de ce chapitre s'effectue directement sur la base de production. — **Faux** (section 54.5, toujours sur une base séparée).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 54.1</span>

Propose une seconde métrique métier pertinente pour GestionTâches, au-delà du compteur de tâches créées de la section 54.1, et explique ce qu'elle révélerait.
</div>

**Corrigé (exemple de réponse) :** un compteur `gestiontaches_taches_terminees_total`, incrémenté dans la route `PATCH /taches/:id/terminer` (chapitre 50, section 50.4) — combiné au compteur de créations déjà en place, le ratio entre tâches créées et terminées sur une période donnée révélerait un indicateur d'usage réel de l'application (les utilisateurs terminent-ils effectivement leurs tâches, ou les accumulent-ils sans les traiter), une information à la fois technique et produit, illustrant que les métriques (chapitre 32) servent autant à comprendre l'usage réel qu'à diagnostiquer une panne.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ L'API de GestionTâches expose des métriques génériques et au moins une métrique métier.</li>
<li>☐ Prometheus et Grafana sont en place, sans aucun port exposé publiquement.</li>
<li>☐ J'ai un tableau de bord Grafana avec au moins deux graphiques utiles.</li>
<li>☐ J'ai une alerte de disponibilité fonctionnelle, testée en conditions réelles.</li>
<li>☐ J'ai une sauvegarde automatisée quotidienne avec politique de rétention.</li>
<li>☐ J'ai testé une restauration réelle, avec des données de test vérifiées après coup.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il un stockage hors serveur pour les sauvegardes de ce projet dès maintenant ?</dt>
<dd>C'est fortement recommandé et abordé concrètement au chapitre suivant (55, sécurisation) — ce chapitre pose la mécanique de sauvegarde locale, le chapitre 55 renforce la protection globale du projet, incluant potentiellement ce point.</dd>

<dt>Combien de métriques métier faut-il exposer ?</dt>
<dd>Il n'existe pas de nombre requis — commencer par une ou deux métriques réellement utiles (comme dans ce chapitre) vaut mieux qu'une instrumentation exhaustive mais jamais consultée, le même principe de progressivité déjà appliqué à travers ce manuel.</dd>

<dt>Le monitoring de ce chapitre remplace-t-il le healthcheck déjà en place depuis le chapitre 51 ?</dt>
<dd>Non, ils sont complémentaires — le healthcheck Docker (chapitre 12, 51) permet le redémarrage automatique local d'un conteneur défaillant ; Prometheus/Grafana (ce chapitre) offrent une visibilité historique et des alertes externes, une couche d'observation plus large.</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 31, 32.

*Chapitre suivant : projet final, sécurisation — appliquer la doctrine complète de sécurité DevSecOps à GestionTâches, phase 16 du projet.*
