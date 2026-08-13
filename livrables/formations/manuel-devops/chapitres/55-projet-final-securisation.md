<div class="chapitre-titre-num">CHAPITRE 55 · 🔴 PROFESSIONNEL</div>

# Projet final : sécurisation

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Appliquer la checklist DevSecOps complète du chapitre 35 à GestionTâches : audit des dépendances, scan de secrets, scan d'images Docker, durcissement final. Ce chapitre couvre la phase 16 du projet final — la dernière étape de construction avant que le chapitre 56 ne teste volontairement la résilience de tout ce qui a été bâti.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
GestionTâches fonctionne, se déploie automatiquement, est surveillée et sauvegardée. Mais la sécurité, comme le chapitre 35 l'a établi, ne s'ajoute jamais en une seule étape finale isolée — ce chapitre vérifie plutôt que chaque pratique de sécurité déjà appliquée silencieusement depuis le chapitre 50 (requêtes paramétrées, utilisateur non-root, secrets jamais versionnés) forme un ensemble cohérent, puis comble les derniers manques.
</div>

## 55.1 Audit de sécurité complet du projet

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Ce qui est déjà en place, vérifié une dernière fois</span>

```text
✅ Requêtes SQL paramétrées (chapitre 50, section 50.4)
✅ Utilisateur non-root dans les Dockerfiles (chapitre 51, section 51.1)
✅ Secrets jamais versionnés, .env vérifié (chapitres 50-53)
✅ Seul le point d'entrée exposé publiquement (chapitre 51, section 51.3)
✅ SSH durci, pare-feu configuré (chapitre 52)
✅ Prometheus/Grafana jamais exposés publiquement (chapitre 54)
```

Ce chapitre ajoute ce qui manque encore : audit des dépendances, scan de secrets automatisé, scan d'images, et une dernière vérification d'ensemble.
</div>

## 55.2 Ajouter le job sécurité au pipeline

```yaml
# Ajout à .github/workflows/deploy.yml (chapitre 53)
jobs:
  securite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scanner les secrets
        uses: gitleaks/gitleaks-action@v2

      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - name: Audit des dépendances API
        working-directory: api
        run: npm audit --audit-level=high
      - name: Audit des dépendances frontend
        working-directory: frontend
        run: npm audit --audit-level=high

  build-and-push:
    needs: [qualite-et-tests, securite]
    # ... reste inchangé (chapitre 53)
```

**Explication :** ce job reprend exactement le chapitre 35 (section 35.6) — `gitleaks` détecte tout secret introduit par erreur (chapitre 25), `npm audit` sur **les deux** `package.json` distincts du projet (rappel du chapitre 53, section "Erreurs fréquentes", erreur n°2) ; `needs: [qualite-et-tests, securite]` sur `build-and-push` (modifié par rapport au chapitre 53) fait désormais dépendre la construction des images de la réussite **des deux** jobs, exécutés en parallèle (chapitre 21, section 21.4) pour ne pas ralentir le pipeline.

## 55.3 Scanner les images de GestionTâches

```yaml
  scan-images:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Scanner l'image API
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: "${{ env.IMAGE_API }}:${{ github.sha }}"
          severity: "HIGH,CRITICAL"
          exit-code: "1"
      - name: Scanner l'image frontend
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: "${{ env.IMAGE_FRONTEND }}:${{ github.sha }}"
          severity: "HIGH,CRITICAL"
          exit-code: "1"

  migrer-la-base:
    needs: scan-images
    # ... reste inchangé (chapitre 53)
```

**Explication :** reprend exactement le chapitre 36 (section 36.3) — chaque image est scannée **après** sa construction mais **avant** tout déploiement, `exit-code: "1"` bloquant le pipeline si une vulnérabilité grave est détectée dans l'image de base (`node:20-slim`, `nginx:1.27-alpine`) ou les dépendances qu'elle embarque.

## 55.4 Sauvegardes hors serveur

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Complète le chapitre 54 avec le principe du chapitre 31</span>
Le chapitre 54 (section 54.4) a mis en place une sauvegarde locale au serveur. Le chapitre 31 (section 31.5) rappelle qu'une sauvegarde sur le même serveur que les données originales n'est pas une vraie protection — ce chapitre ajoute le transfert vers un stockage séparé, la dernière pièce manquante de la stratégie de sauvegarde.
</div>

```bash
# scripts/backup-db.sh, complété
docker compose exec -T db pg_dump -U gestiontaches gestiontaches | gzip > "$FICHIER"
aws s3 cp "$FICHIER" s3://sauvegardes-gestiontaches/db/ --storage-class STANDARD_IA
```

## 55.5 Durcissement final

<div class="encadre securite">
<span class="encadre-titre">🔒 Dernière vérification avant la mise en résilience du chapitre 56</span>

```text
☐ npm audit --audit-level=high : 0 vulnérabilité grave non traitée
☐ gitleaks : 0 secret détecté dans tout l'historique du dépôt
☐ Scan Trivy des deux images : 0 vulnérabilité HIGH/CRITICAL non traitée
☐ Certificat TLS valide, renouvellement automatique vérifié (chapitre 52, rappel chapitre 16)
☐ SSH : mot de passe désactivé, root désactivé, clé dédiée pour le pipeline (chapitre 52)
☐ Sauvegardes transférées vers un stockage hors serveur, restauration testée (section 55.4, chapitre 54)
```
</div>

## Atelier — L'audit de sécurité complet, sans complaisance

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 55.1 — Zéro vulnérabilité connue non traitée</span>

**Objectif** : appliquer intégralement la checklist de ce chapitre à GestionTâches, en corrigeant réellement chaque problème détecté plutôt que de l'ignorer.

**Étapes détaillées** :

1. Ajoute le job `securite` (section 55.2) et le job `scan-images` (section 55.3) au pipeline du chapitre 53.
2. Exécute `npm audit` localement sur les deux `package.json`, corrige toute vulnérabilité de sévérité haute ou critique.
3. Exécute `gitleaks detect` sur l'historique complet du dépôt local — si un secret de test a été introduit par mégarde pendant les chapitres précédents, traite-le selon la procédure du chapitre 25 (section 25.6, révocation, pas seulement suppression).
4. Configure le transfert de sauvegarde hors serveur (section 55.4).
5. Coche, un par un, tous les points de la checklist de la section 55.5.

**Résultat attendu** : un pipeline avec deux nouveaux jobs de sécurité, tous deux verts, et une checklist entièrement cochée — GestionTâches prête pour l'épreuve du chapitre 56.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Ajouter les scans de sécurité sans jamais traiter leurs résultats</span>
Rappel du chapitre 35 (section "Erreurs fréquentes", erreur n°2) — un job de sécurité qui échoue systématiquement, ignoré par habitude, perd tout son intérêt pratique.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Scanner les images avant leur publication effective plutôt qu'après</span>
Le job `scan-images` (section 55.3) dépend de `build-and-push`, pas l'inverse — scanner une image qui n'existe pas encore sur le registre échouerait systématiquement ; l'ordre logique reste toujours construire, publier, puis scanner l'artefact réellement produit.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Considérer la sécurité "terminée" après ce chapitre</span>
Rappel du chapitre 35 (section 35.1) — la sécurité est un effort continu, jamais un état atteint définitivement. Ce chapitre pose une base solide, pas un aboutissement final.
</div>

## En entreprise

**Réalité répandue** : un audit de sécurité formel précède souvent la mise en production officielle d'un projet, même modeste — ce chapitre reproduit cette pratique à l'échelle de GestionTâches, avant la simulation d'incident du chapitre 56.

**Bonne pratique répandue** : les scans de sécurité (dépendances, secrets, images) tournent en continu sur le pipeline principal, pas seulement lors d'un audit ponctuel — exactement l'approche adoptée dans ce chapitre, intégrée durablement au pipeline plutôt qu'exécutée une seule fois.

**Erreur classique observée** : une "revue de sécurité" effectuée une seule fois avant un lancement, jamais répétée par la suite malgré l'évolution constante des dépendances et des vulnérabilités découvertes après coup — un rappel direct du chapitre 36 (section "Erreurs fréquentes", erreur n°1, une image jamais reconstruite accumule les vulnérabilités).

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Décris l'ensemble des contrôles de sécurité que tu intégrerais à un pipeline CI/CD."**
Réponse attendue : reprendre la structure de ce chapitre — scan de secrets, audit de dépendances, scan d'images après construction, le tout intégré comme jobs bloquants du pipeline principal (sections 55.2-55.3).

**Q2. "Pourquoi le scan d'images doit-il se produire après la publication de l'image, pas avant ?"**
Réponse attendue : le scanner analyse l'artefact réellement construit et publié, pas une hypothèse — scanner avant que l'image n'existe serait techniquement impossible (section "Erreurs fréquentes", erreur n°2).

**Q3. "Comment t'assurerais-tu qu'une sauvegarde protège réellement contre une panne totale du serveur ?"**
Réponse attendue : un transfert vers un stockage physiquement séparé du serveur d'origine (section 55.4), avec une restauration réellement testée (chapitre 31, section 31.7, déjà appliquée au chapitre 54).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes de ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ce chapitre entier est une checklist de sécurité — la synthèse concrète des chapitres 24, 25, 35, 36, appliquée à un vrai projet construit de bout en bout dans ce manuel.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente, dans le `DEPLOIEMENT.md` du projet, les vulnérabilités volontairement acceptées après examen (s'il en reste, avec justification) plutôt que silencieusement ignorées — le même principe déjà recommandé au chapitre 35 (section "Maintenabilité").
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Les deux nouveaux jobs de sécurité (`securite`, `scan-images`) s'exécutent en parallèle avec les autres étapes quand c'est possible (chapitre 21, section 21.4), limitant leur impact sur le temps total du pipeline malgré le renforcement significatif de couverture qu'ils apportent.
</div>

## Résumé du chapitre

- Ce chapitre vérifie et complète toutes les pratiques de sécurité déjà appliquées silencieusement depuis le début du projet final.
- Deux nouveaux jobs de pipeline (`securite`, `scan-images`) bloquent le déploiement en cas de secret détecté ou de vulnérabilité grave dans les dépendances ou les images.
- Les sauvegardes sont désormais transférées vers un stockage hors serveur, complétant la stratégie du chapitre 54.
- Une checklist finale de durcissement confirme l'état de sécurité global du projet, sans complaisance.
- La sécurité reste un effort continu, jamais un état terminé une fois pour toutes.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le job `scan-images` de ce chapitre dépend de :
   - a) `qualite-et-tests` uniquement
   - b) `build-and-push`, car il scanne l'image réellement construite et publiée
   - c) Rien, il s'exécute en premier
   - d) `deploy`

2. `npm audit --audit-level=high` dans le pipeline sert à :
   - a) Installer toutes les dépendances
   - b) Faire échouer le pipeline si des vulnérabilités graves ou critiques sont détectées
   - c) Supprimer le fichier `package.json`
   - d) Chiffrer le code source

3. Une sauvegarde protège réellement contre une panne totale du serveur uniquement si :
   - a) Elle reste stockée sur le même serveur
   - b) Elle est transférée vers un stockage physiquement séparé et sa restauration est testée
   - c) Elle est créée une seule fois au lancement du projet
   - d) Elle n'est jamais nécessaire pour un projet pédagogique

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. La sécurité d'un projet est un état terminé une fois ce chapitre appliqué. — **Faux** (section "Erreurs fréquentes", erreur n°3).
2. Les jobs de sécurité de ce chapitre s'exécutent en parallèle avec d'autres étapes du pipeline pour limiter l'impact sur le temps total. — **Vrai** (section "Performance").
3. Un job de sécurité qui échoue systématiquement, jamais traité, garde toute sa valeur pratique. — **Faux** (section "Erreurs fréquentes", erreur n°1).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 55.1</span>

Le scan Trivy de l'image API révèle une vulnérabilité critique dans l'image de base `node:20-slim`, corrigée dans une version plus récente du correctif de sécurité de cette même version majeure. Décris la correction à appliquer.
</div>

**Corrigé :** reconstruire l'image en s'assurant que la version de base la plus récente du correctif est utilisée — si le Dockerfile épingle une version précise avec un tag flottant sur la version mineure (`node:20-slim`, qui pointe automatiquement vers le dernier correctif de la branche 20), un simple rebuild sans modification de code récupère souvent déjà la version corrigée (chapitre 36, section "Erreurs fréquentes", erreur n°1, sur l'importance de la reconstruction périodique) ; si le Dockerfile épingle une version exacte plus ancienne, il faut explicitement mettre à jour ce tag vers une version plus récente, reconstruire, rescanner pour confirmer la résolution avant de considérer le correctif appliqué.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai ajouté un job `securite` (secrets + audit dépendances) au pipeline.</li>
<li>☐ J'ai ajouté un job `scan-images` qui bloque le déploiement en cas de vulnérabilité grave.</li>
<li>☐ Mes sauvegardes sont transférées vers un stockage hors serveur.</li>
<li>☐ J'ai coché entièrement la checklist de durcissement final de la section 55.5.</li>
<li>☐ Je comprends que la sécurité reste un effort continu, pas un état terminé.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il un compte AWS réel pour le transfert de sauvegarde de la section 55.4 ?</dt>
<dd>Non, n'importe quel service de stockage objet compatible S3 (ou même un second serveur simple avec `rsync`, une alternative plus légère) convient — le principe de séparation physique compte davantage que le service précis choisi.</dd>

<dt>Que faire si une vulnérabilité détectée n'a encore aucun correctif disponible ?</dt>
<dd>Documenter explicitement la décision d'acceptation temporaire (chapitre 35, section "Maintenabilité"), avec une date de réexamen prévue, plutôt que de la laisser silencieusement ignorée dans le pipeline.</dd>

<dt>Ce chapitre couvre-t-il tous les aspects de sécurité possibles pour ce projet ?</dt>
<dd>Non — il couvre les fondamentaux essentiels déjà enseignés dans ce manuel. Des audits plus poussés (tests d'intrusion, revue de code de sécurité approfondie) existent et dépassent le périmètre introductif de ce manuel.</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 24, 25, 31, 35, 36.

*Chapitre suivant : projet final, panne, rollback et documentation — provoquer une vraie panne, effectuer un rollback, et documenter l'infrastructure produite. Le dernier chapitre du projet final.*
