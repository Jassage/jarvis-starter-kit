<div class="chapitre-titre-num">CHAPITRE 56 · 🔴 PROFESSIONNEL</div>

# Projet final : panne, rollback et documentation

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Provoquer une vraie panne sur GestionTâches, effectuer un rollback, puis documenter l'infrastructure produite. Ce chapitre couvre les phases 17 à 19, les dernières du projet final — et referme la boucle ouverte au chapitre 50 : une application n'est jamais réellement "terminée" tant qu'elle n'a pas prouvé sa capacité à survivre à un incident réel, documentée pour que quelqu'un d'autre puisse la reprendre.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Six chapitres ont construit GestionTâches avec un soin méticuleux — mais aucune application construite avec soin n'est à l'abri d'un incident. Ce chapitre ne simule pas une panne pour "cocher une case" : il applique la méthode complète du chapitre 46, chronomètre le rollback du chapitre 29, et produit la documentation qui manquerait cruellement si tu devais reprendre ce projet dans six mois, ou si quelqu'un d'autre devait le faire à ta place.
</div>

## 56.1 Phase 17 — Provoquer une panne réelle

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Reprend directement l'atelier 46.1 et l'atelier 29.1</span>
Introduis un bug volontaire dans l'API — par exemple, une modification qui casse la route <code>POST /api/taches</code> (retirer accidentellement la validation du titre obligatoire, ou introduire une faute de syntaxe qui empêche le conteneur de démarrer). Commite, pousse sur <code>main</code>, laisse le pipeline du chapitre 55 déployer cette version défaillante — exactement comme le ferait une vraie erreur humaine.
</div>

```bash
git checkout -b test-panne-volontaire
# Introduire le bug dans api/taches.routes.js
git add . && git commit -m "TEST: bug volontaire pour l'exercice du chapitre 56"
git checkout main && git merge test-panne-volontaire
git push
```

**Résultat attendu** : selon la nature du bug, soit le job `qualite-et-tests` échoue immédiatement (si un test couvre ce cas, chapitre 50 section 50.5 — la première ligne de défense fonctionne), soit il passe et la panne n'est détectée qu'après déploiement, via le healthcheck (chapitre 51) ou l'alerte Prometheus (chapitre 54, section 54.3).

## 56.2 Phase 18 — Effectuer un rollback chronométré

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Reprend exactement le chapitre 29, section 29.3-29.4</span>

```bash
git log --oneline -5
```

Identifie le SHA du dernier commit fonctionnel (avant l'introduction du bug), puis :

```bash
docker pull ghcr.io/ton-compte/gestiontaches-api:<sha-precedent>
docker pull ghcr.io/ton-compte/gestiontaches-frontend:<sha-precedent>
```

Sur le serveur, via le workflow de rollback manuel (adapté du chapitre 29, section 29.4, avec `workflow_dispatch` et un `input` pour le SHA à restaurer) :

```yaml
name: Rollback GestionTâches
on:
  workflow_dispatch:
    inputs:
      sha_a_restaurer: { description: "SHA du commit à restaurer", required: true }
jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: { name: production }
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVEUR_IP }}
          username: ${{ secrets.SERVEUR_UTILISATEUR }}
          key: ${{ secrets.SERVEUR_CLE_SSH }}
          script: |
            cd /home/deploiement/gestiontaches
            docker pull ghcr.io/${{ github.repository }}-api:${{ github.event.inputs.sha_a_restaurer }}
            docker pull ghcr.io/${{ github.repository }}-frontend:${{ github.event.inputs.sha_a_restaurer }}
            sed -i "s|image: .*api.*|image: ghcr.io/${{ github.repository }}-api:${{ github.event.inputs.sha_a_restaurer }}|" docker-compose.override.yml
            sed -i "s|image: .*frontend.*|image: ghcr.io/${{ github.repository }}-frontend:${{ github.event.inputs.sha_a_restaurer }}|" docker-compose.override.yml
            docker compose up -d
            sleep 5
            curl -f https://gestiontaches.exemple.com/api/health
```
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Chronomètre chaque étape, exactement comme à l'atelier 29.1</span>
Note l'heure de détection du problème, l'heure de déclenchement du rollback, et l'heure de confirmation du retour à un état sain — ce chronométrage est directement comparable à la métrique DORA "temps moyen de rétablissement" (chapitre 1, rappelée au chapitre 29).
</div>

## 56.3 Phase 19 — Documenter l'infrastructure produite

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Le `DEPLOIEMENT.md` recommandé depuis le chapitre 26, enfin rédigé en entier</span>

```markdown
# DEPLOIEMENT.md — GestionTâches

## Architecture
[Schéma repris du chapitre 45, adapté à GestionTâches : DNS → HTTPS → Nginx natif →
conteneur frontend (Nginx + React) → conteneur api → conteneur db (PostgreSQL)]

## Provisionnement initial (une seule fois, chapitre 52)
1. VPS Ubuntu 24.04 LTS, utilisateur "deploiement", SSH durci, UFW (80/443/22 uniquement)
2. Docker Engine installé, utilisateur ajouté au groupe docker
3. Nginx natif installé, configuration dans /etc/nginx/sites-available/gestiontaches.conf
4. Certificat Let's Encrypt via Certbot, renouvellement automatique vérifié

## Déploiement (automatique à chaque push sur main, chapitre 53)
Pipeline : qualite-et-tests → securite → build-and-push → scan-images →
migrer-la-base → deploy → vérification santé publique

## Secrets nécessaires (GitHub Secrets, chapitre 25)
- SERVEUR_IP, SERVEUR_UTILISATEUR, SERVEUR_CLE_SSH
- DB_PASSWORD (fichier .env sur le serveur, jamais versionné)

## Sauvegardes (chapitre 54-55)
- Quotidienne à 2h (cron), rétention 7 jours, transférée vers S3
- Dernière restauration testée : [date]

## Monitoring (chapitre 54)
- Grafana accessible via tunnel SSH : ssh -L 3001:localhost:3001 deploiement@[IP]
- Alerte de disponibilité : Prometheus, seuil 1 minute

## Rollback (chapitre 56)
- Workflow "Rollback GestionTâches", déclenchable manuellement avec le SHA à restaurer
- Dernier test réel : [date], temps de rétablissement mesuré : [durée]

## Incidents connus et leur résolution
[Référence au chapitre 46 pour la méthode générale ; lister ici tout incident
réellement rencontré sur ce projet, avec sa cause et sa correction]
```
</div>

**Explication :** ce document reprend et synthétise ce que sept chapitres ont construit, dans un format directement actionnable — exactement le principe déjà recommandé au chapitre 26 (section "Maintenabilité") et au chapitre 45 (section "En entreprise", les schémas d'architecture comme documents vivants).

## Atelier — Le cycle complet du projet final, de bout en bout

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 56.1 — La dernière boucle complète</span>

**Objectif** : exécuter réellement les trois phases de ce chapitre sur GestionTâches, et produire un `DEPLOIEMENT.md` complet et honnête.

**Étapes détaillées** :

1. Introduis un bug volontaire (section 56.1), observe où il est détecté (tests, healthcheck, ou alerte).
2. Effectue le rollback (section 56.2), chronomètre chaque étape.
3. Rédige le `DEPLOIEMENT.md` complet (section 56.3), en remplissant chaque section avec les vraies informations de ton propre déploiement — pas un modèle vide.
4. Fais relire ce document par quelqu'un qui n'a jamais touché au projet (un camarade, un collègue) : peut-il comprendre, à partir de ce seul document, comment redéployer ou diagnostiquer un problème sur GestionTâches ?

**Résultat attendu** : la preuve, mesurée et documentée, que GestionTâches peut survivre à un incident réel et que le savoir nécessaire pour la maintenir n'existe pas uniquement dans ta mémoire — la conclusion opérationnelle du projet final complet.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Ne jamais avoir réellement testé un rollback avant cet exercice</span>
Rappel du chapitre 29 (section "Erreurs fréquentes", erreur n°3) — ce chapitre est précisément l'occasion de vérifier que la procédure fonctionne, plutôt que d'espérer qu'elle fonctionnerait le jour où elle serait réellement nécessaire.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Une documentation écrite de mémoire, après coup, plutôt qu'au fil de l'eau</span>
Rédiger `DEPLOIEMENT.md` en essayant de se souvenir de choix faits sept chapitres plus tôt produit une documentation moins précise qu'une documentation tenue à jour à chaque étape — un rappel que la maintenabilité (répétée à chaque chapitre de ce manuel) se pratique en continu, pas en une seule session finale.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Une documentation jamais relue par personne d'autre que son auteur</span>
Une documentation qui n'a de sens que pour la personne qui l'a écrite échoue à son objectif principal — la relecture externe de l'atelier 56.1 (étape 4) est ce qui révèle réellement les lacunes invisibles à son propre auteur.
</div>

## En entreprise

**Réalité répandue** : les entreprises matures organisent des "post-mortems sans blâme" (chapitre 2, section 2.3) après chaque incident réel, y compris pour des exercices délibérés comme celui de ce chapitre — la même discipline qu'un incident réel non planifié, appliquée volontairement pour s'entraîner sans le stress d'une vraie crise.

**Bonne pratique répandue** : la documentation d'infrastructure (comme `DEPLOIEMENT.md`) est souvent versionnée dans le même dépôt Git que le code (chapitre 7), révisée par pull request comme n'importe quel autre changement — jamais un document séparé, oublié, sur un wiki externe jamais synchronisé avec la réalité du code.

**Erreur classique observée** : des projets réels, y compris dans le portefeuille de Jaslin documenté dans ce workspace, où le rollback n'a jamais été testé et où la documentation d'architecture reste incomplète des mois après le lancement — ce chapitre applique, dès la fin de ce manuel, la discipline complète que ces projets réels ont parfois manquée.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Raconte un incident que tu as géré ou simulé, de la détection à la résolution."**
Réponse attendue : reprendre la structure de ce chapitre — introduction/détection du problème, décision de rollback plutôt que correctif rapide (chapitre 29, section 29.1), exécution chronométrée, vérification, documentation a posteriori (sections 56.1-56.3).

**Q2. "Pourquoi documenter une infrastructure au fil de sa construction plutôt qu'à la toute fin du projet ?"**
Réponse attendue : une documentation écrite au fur et à mesure reste plus précise et complète qu'une reconstruction de mémoire après coup, qui omet souvent des détails importants oubliés entre-temps (section "Erreurs fréquentes", erreur n°2).

**Q3. "Comment sais-tu qu'une documentation technique est réellement utile ?"**
Réponse attendue : une personne extérieure au projet doit pouvoir l'utiliser pour comprendre ou reproduire une action (redéploiement, diagnostic) sans avoir à interroger l'auteur original — vérifié par une relecture externe réelle (section "Erreurs fréquentes", erreur n°3).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes de ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le `DEPLOIEMENT.md` documente la procédure et les secrets **nécessaires**, jamais leurs valeurs réelles (chapitre 25) — un document opérationnel utile, sans jamais devenir lui-même une fuite de sécurité.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Ce chapitre entier est un exercice de maintenabilité appliquée — le principe répété à chaque chapitre de ce manuel ("documente X", "vérifie Y avant d'en avoir besoin") trouve ici sa mise en pratique complète et concrète.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le temps de rétablissement mesuré à la section 56.2 est l'aboutissement concret de tout ce que ce manuel a construit pour le réduire — versionnage par SHA (chapitre 14), healthchecks (chapitre 12), rollback automatisable (chapitre 29), observabilité (chapitre 54).
</div>

## Résumé du chapitre

- Une panne volontaire, réellement déployée via le pipeline complet, teste la résilience réelle de GestionTâches.
- Le rollback, chronométré, applique directement la procédure du chapitre 29 à un vrai projet construit de bout en bout.
- `DEPLOIEMENT.md` synthétise l'architecture, le provisionnement, le déploiement, les secrets nécessaires, les sauvegardes, le monitoring et la procédure de rollback en un seul document actionnable.
- La documentation doit être écrite au fil de l'eau et relue par une personne extérieure, jamais reconstituée de mémoire en fin de projet.
- Ce chapitre referme la boucle ouverte au chapitre 50 : GestionTâches est désormais une application réellement production-ready, pas seulement fonctionnelle.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La panne de ce chapitre est provoquée :
   - a) En modifiant directement la production sans passer par le pipeline
   - b) En introduisant un bug via le processus normal (commit, push, pipeline)
   - c) En supprimant le serveur
   - d) Elle n'est jamais réellement provoquée, seulement discutée

2. Le rollback de ce chapitre restaure :
   - a) Une version arbitraire de l'application
   - b) Le SHA du dernier commit fonctionnel connu, identifié via `git log`
   - c) Toujours la toute première version du projet
   - d) Rien, seulement les logs sont consultés

3. Un document comme `DEPLOIEMENT.md` devrait être considéré réellement utile si :
   - a) Seul son auteur peut le comprendre
   - b) Une personne extérieure au projet peut l'utiliser pour comprendre ou reproduire une action
   - c) Il ne contient que des captures d'écran
   - d) Il est écrit une seule fois et jamais mis à jour

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Ce chapitre recommande de documenter l'infrastructure uniquement à la toute fin du projet, de mémoire. — **Faux** (section "Erreurs fréquentes", erreur n°2).
2. Le temps de rétablissement mesuré à ce chapitre est comparable à la métrique DORA du même nom. — **Vrai** (section 56.2).
3. `DEPLOIEMENT.md` devrait contenir les vraies valeurs des secrets pour être complet. — **Faux** (section "Sécurité").

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 56.1</span>

Après avoir exécuté l'atelier 56.1, rédige un court post-mortem sans blâme (chapitre 2, section 2.3) de la panne volontaire : chronologie, impact, cause racine, actions correctives.
</div>

**Corrigé (structure attendue, contenu propre à chaque exécution réelle) :** **Chronologie** — heure d'introduction du bug (push sur `main`), heure de détection (échec de test, healthcheck, ou alerte Prometheus selon le scénario choisi), heure de déclenchement du rollback, heure de confirmation du retour à un état sain. **Impact** — durée totale d'indisponibilité ou de dysfonctionnement, fonctionnalités affectées (ex. impossible de créer une nouvelle tâche). **Cause racine** — le bug précis introduit délibérément, et pourquoi il n'a pas été intercepté plus tôt (test manquant sur ce cas précis, par exemple). **Actions correctives** — ajouter le test manquant qui aurait intercepté ce bug avant même le déploiement (chapitre 23), documenté et implémenté, complétant ainsi la couverture de test pour éviter une répétition future de ce type précis d'incident.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai provoqué une panne réelle via le pipeline normal, pas une modification directe de production.</li>
<li>☐ J'ai identifié où cette panne a été détectée (tests, healthcheck, ou alerte).</li>
<li>☐ J'ai effectué et chronométré un rollback réel vers la dernière version fonctionnelle.</li>
<li>☐ J'ai rédigé un `DEPLOIEMENT.md` complet, avec les vraies informations de mon déploiement.</li>
<li>☐ Ce document a été relu par une personne extérieure au projet, qui a confirmé pouvoir le suivre.</li>
<li>☐ J'ai rédigé un post-mortem sans blâme de l'incident volontaire.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Ce chapitre marque-t-il la fin du projet GestionTâches ?</dt>
<dd>De ce manuel, oui — mais un vrai projet ne "finit" jamais réellement : de nouvelles fonctionnalités, une évolution de l'architecture (scalabilité, chapitre 48 ; Kubernetes, chapitres 41-44) restent des extensions naturelles si le projet devait continuer au-delà de ce manuel.</dd>

<dt>Faut-il refaire cet exercice de panne/rollback régulièrement sur un vrai projet en production ?</dt>
<dd>Oui, c'est fortement recommandé — les exercices de "chaos engineering" du chapitre 49 (section "En entreprise") appliquent exactement ce principe de façon récurrente, pas seulement une fois en fin de construction initiale.</dd>

<dt>Comment savoir si ma documentation est "suffisamment bonne" ?</dt>
<dd>Le test le plus fiable reste la relecture externe de l'atelier 56.1 — si une personne extérieure parvient à comprendre et suivre le document sans assistance supplémentaire, c'est un bon indicateur de qualité suffisante.</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 2, 26, 29, 45, 46.
- Ce chapitre clôt la Partie XV et le corps principal de ce manuel. Les annexes suivantes (checklists compilées, cheat sheet, architectures comparées, glossaire, examen final) complètent cette référence pour un usage continu au-delà de ce manuel.

*Fin de la Partie XV. Suivent les annexes : A) Checklists professionnelles compilées, B) Cheat sheet des commandes, C) Neuf architectures comparées, D) Glossaire complet, E) Examen final pratique.*
