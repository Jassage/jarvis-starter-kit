<div class="chapitre-titre-num">CHAPITRE 31 · 🟠 AVANCÉ</div>

# Backup et restauration

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Construire une vraie stratégie de sauvegarde couvrant l'application, la base de données, les volumes et la configuration, avec une politique de fréquence et de rétention explicite, un stockage hors du serveur lui-même, et surtout une pratique systématique de test de restauration. Ce chapitre clôt la Partie IX avec le principe le plus important de tout ce chapitre, martelé depuis les premières lignes : une sauvegarde jamais testée en restauration n'est pas une stratégie fiable.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le chapitre 10 a construit `backup.sh`, un script qui archive un dossier. Ce chapitre transforme ce script isolé en une vraie **stratégie** : que sauvegarder exactement, à quelle fréquence, où stocker ces sauvegardes (jamais uniquement sur le serveur lui-même), combien de temps les garder, et surtout — la question que presque personne ne se pose avant qu'il ne soit trop tard — comment être certain qu'elles fonctionnent réellement.
</div>

## 31.1 Ce qu'il faut sauvegarder

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Quatre catégories à couvrir</span>

```text
Application     → le code lui-même (déjà couvert par Git, chapitre 7 — reproductible depuis le dépôt)
Database        → les données, jamais reproductibles autrement qu'en restaurant une sauvegarde
Volumes         → fichiers uploadés par les utilisateurs, non versionnés dans Git
Configuration   → .env, certificats, configuration Nginx (chapitre 15) — souvent oubliés
```
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 L'application elle-même n'a presque jamais besoin d'être sauvegardée séparément</span>
Contrairement aux trois autres catégories, le code applicatif est déjà versionné dans Git (chapitre 7) et reconstructible à l'identique depuis n'importe quel commit — sa "sauvegarde" est déjà assurée par la simple existence du dépôt distant (GitHub, chapitre 8). Les efforts de sauvegarde doivent se concentrer sur ce qui n'existe **nulle part ailleurs** que sur le serveur : les données.
</div>

## 31.2 Sauvegarder PostgreSQL

```bash
#!/bin/bash
set -e

DATE_DU_JOUR=$(date +%Y%m%d-%H%M%S)
FICHIER_SAUVEGARDE="/home/deploiement/sauvegardes/db-${DATE_DU_JOUR}.sql.gz"

docker exec ma-base pg_dump -U app app | gzip > "$FICHIER_SAUVEGARDE"
echo "Sauvegarde créée : $FICHIER_SAUVEGARDE"
ls -lh "$FICHIER_SAUVEGARDE"
```

**Explication :** `pg_dump` exporte l'intégralité du contenu de la base sous forme de commandes SQL rejouables ; le résultat est immédiatement compressé (`gzip`) pour réduire l'espace de stockage nécessaire — reprend directement la structure de `backup.sh` (chapitre 10, section 10.4), appliquée spécifiquement à une base PostgreSQL plutôt qu'à un simple dossier.

## 31.3 Sauvegarder volumes et configuration

```bash
#!/bin/bash
set -e

DATE_DU_JOUR=$(date +%Y%m%d-%H%M%S)
DOSSIER_SAUVEGARDES="/home/deploiement/sauvegardes"

docker run --rm -v donnees-uploads:/source -v "$DOSSIER_SAUVEGARDES":/destination \
  alpine tar -czf "/destination/volume-uploads-${DATE_DU_JOUR}.tar.gz" -C /source .

tar -czf "${DOSSIER_SAUVEGARDES}/config-${DATE_DU_JOUR}.tar.gz" \
  /home/deploiement/ton-projet/.env \
  /etc/nginx/sites-available/ \
  /etc/letsencrypt/
```

**Explication :** un conteneur temporaire et jetable (`alpine`, une image minimale) monte le volume Docker à sauvegarder (chapitre 11) en lecture, l'archive avec `tar` (chapitre 4), puis se supprime automatiquement (`--rm`) — une méthode qui fonctionne quel que soit le contenu du volume, sans dépendre d'un outil spécifique comme `pg_dump`.

## 31.4 Fréquence et rétention

<div class="encadre retenir">
<span class="encadre-titre">📌 Une politique explicite, pas un réflexe vague</span>

| Type de donnée | Fréquence recommandée | Rétention |
|---|---|---|
| Base de données (application active) | Quotidienne, voire plus fréquente selon la criticité | 7 quotidiennes + 4 hebdomadaires + 3 mensuelles |
| Volumes (fichiers uploadés) | Quotidienne | Identique à la base de données |
| Configuration | À chaque changement, plus une sauvegarde périodique de sécurité | 3 dernières versions |

Cette rotation ("7 quotidiennes + 4 hebdomadaires + 3 mensuelles", un schéma classique appelé <em>grandfather-father-son</em>) équilibre la capacité de revenir à un point récent précis avec un espace de stockage maîtrisé, plutôt que de garder indéfiniment chaque sauvegarde quotidienne.
</div>

```bash
# Nettoyage selon la politique de rétention (rappel du chapitre 10, cleanup.sh)
find /home/deploiement/sauvegardes -name "db-*.sql.gz" -mtime +7 -delete
```

## 31.5 Stockage hors du serveur

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une sauvegarde sur le même disque que les données originales n'est pas une vraie sauvegarde</span>
Si le serveur entier tombe en panne (disque défaillant, VPS supprimé par erreur, compromission complète), une sauvegarde stockée sur ce même serveur disparaît avec les données qu'elle était censée protéger. Une vraie stratégie de sauvegarde exige un stockage <strong>physiquement séparé</strong> — un service de stockage objet (S3 ou équivalent, chapitre 40), un second serveur dédié, ou au minimum un transfert régulier vers un emplacement distinct.
</div>

```bash
# Exemple avec un stockage compatible S3 (AWS CLI ou équivalent, approfondi au chapitre 40)
aws s3 cp "$FICHIER_SAUVEGARDE" s3://mon-bucket-sauvegardes/db/
```

## 31.6 Automatiser avec cron

```bash
crontab -e
```
```text
0 2 * * * /home/deploiement/scripts/backup-db.sh >> /var/log/backup.log 2>&1
0 3 * * * /home/deploiement/scripts/backup-volumes.sh >> /var/log/backup.log 2>&1
0 4 * * 0 /home/deploiement/scripts/cleanup-sauvegardes.sh >> /var/log/backup.log 2>&1
```

**Explication :** ce planning reprend exactement la syntaxe cron du chapitre 5 (section 5.5) — base de données à 2h, volumes à 3h (décalés pour ne pas saturer les ressources simultanément), nettoyage hebdomadaire le dimanche à 4h, toutes redirigées vers un fichier de log (rappel de l'erreur fréquente du chapitre 5 sur les tâches cron silencieuses).

## 31.7 Le principe le plus important : tester la restauration

<div class="encadre securite">
<span class="encadre-titre">🔒 Une sauvegarde jamais restaurée n'est pas une garantie</span>
Répété volontairement à travers ce manuel comme dans d'autres manuels du portefeuille : une tâche de sauvegarde peut se terminer "avec succès" indéfiniment sans que personne n'ait jamais vérifié qu'un fichier de sauvegarde peut réellement être restauré — corruption silencieuse, format incompatible, permissions manquantes au moment de la restauration, autant de défaillances invisibles tant qu'aucune restauration réelle n'a été tentée.
</div>

```bash
# Test de restauration, sur une base de test SÉPARÉE, jamais la production
docker exec -i ma-base-test psql -U app -d app_test < <(gunzip -c db-20260810-020000.sql.gz)
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — un test de restauration planifié, pas seulement "un jour peut-être"</span>
Planifier un test de restauration réel (sur un environnement séparé, jamais directement sur la production) à intervalle régulier — mensuel est un minimum raisonnable pour la plupart des projets — plutôt que de se fier uniquement au statut "succès" affiché par le script de sauvegarde lui-même, qui ne garantit que l'écriture du fichier, jamais sa validité réelle.
</div>

## Atelier — Sauvegarde et restauration complètes, vérifiées

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 31.1 — Le cycle complet, jusqu'à la preuve de restauration</span>

**Objectif** : construire et vérifier, de bout en bout, une stratégie de sauvegarde réelle sur l'architecture du chapitre 13.

**Étapes détaillées** :

1. Écris et teste le script de sauvegarde PostgreSQL (section 31.2), planifie-le avec cron (section 31.6).
2. Insère des données de test identifiables dans la base (par exemple, un utilisateur avec un nom précis et daté).
3. Exécute une sauvegarde manuelle, note son emplacement.
4. **Supprime délibérément** ces données de test de la base (pas toute la base, juste la ligne insérée à l'étape 2).
5. Restaure la sauvegarde sur une base de test **séparée** (jamais directement par-dessus la production), vérifie que les données de test de l'étape 2 y sont bien présentes.

**Résultat attendu** : la preuve concrète et vérifiée qu'une sauvegarde réelle peut être restaurée avec succès — pas une simple confiance dans un message "succès" jamais mis à l'épreuve.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Sauvegarde stockée uniquement sur le serveur d'origine</span>
Rappel de la section 31.5 : une panne totale du serveur emporte alors la sauvegarde en même temps que les données originales — toujours un stockage physiquement séparé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Aucun test de restauration jamais réalisé</span>
L'erreur la plus coûteuse et la plus documentée de ce chapitre (section 31.7) — un incident réel est le pire moment possible pour découvrir qu'une sauvegarde est inutilisable.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier la configuration et les certificats dans le périmètre de sauvegarde</span>
Se concentrer uniquement sur la base de données en oubliant `.env`, la configuration Nginx et les certificats TLS (section 31.1) peut transformer une restauration en plusieurs heures de reconfiguration manuelle, même si les données elles-mêmes sont intactes.
</div>

## En entreprise

**Réalité répandue** : les entreprises soumises à des obligations réglementaires (données financières, données de santé) documentent formellement leur politique de sauvegarde et de restauration (RPO — *Recovery Point Objective*, combien de données au maximum peut-on se permettre de perdre ; RTO — *Recovery Time Objective*, combien de temps au maximum la restauration peut-elle prendre) plutôt que de s'appuyer sur une pratique informelle.

**Bonne pratique répandue** : des solutions de sauvegarde plus avancées (Restic, BorgBackup) ajoutent la déduplication (ne stocker qu'une fois les blocs de données identiques entre plusieurs sauvegardes successives) et le chiffrement de bout en bout — pertinentes à mesure que le volume de données grandit au-delà de simples scripts `pg_dump`/`tar`.

**Erreur classique observée** : une sauvegarde automatisée mise en place avec enthousiasme au lancement d'un projet, jamais revue ni testée pendant des années — jusqu'au jour où un incident révèle qu'elle a silencieusement cessé de fonctionner des mois plus tôt, sans que personne ne s'en aperçoive faute de surveillance sur la tâche elle-même (approfondi à la Partie X, monitoring).

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi dit-on qu'une sauvegarde jamais testée en restauration n'est pas une garantie fiable ?"**
Réponse attendue : un script de sauvegarde peut se terminer "avec succès" tout en produisant un fichier corrompu, incomplet ou dans un format inutilisable — seule une restauration réelle, testée régulièrement, confirme que la sauvegarde fonctionne effectivement (section 31.7).

**Q2. "Pourquoi une sauvegarde stockée sur le même serveur que les données originales est-elle insuffisante ?"**
Réponse attendue : une panne totale ou une compromission du serveur emporte alors la sauvegarde en même temps que les données qu'elle devait protéger — un stockage physiquement séparé est nécessaire (section 31.5).

**Q3. "Que couvre une stratégie de sauvegarde complète, au-delà de la seule base de données ?"**
Réponse attendue : les volumes de fichiers uploadés et la configuration (`.env`, Nginx, certificats) — le code applicatif lui-même est déjà couvert par Git et n'a généralement pas besoin d'une sauvegarde séparée (section 31.1).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les sauvegardes contiennent souvent des données aussi sensibles que la production elle-même (voire plus, si elles accumulent un historique) — elles méritent le même niveau de protection (chiffrement, accès restreint, chapitre 25) que les données originales, jamais un stockage moins protégé "parce que ce n'est qu'une sauvegarde".
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente la politique de sauvegarde (quoi, quand, où, combien de temps) dans le même document de référence que le déploiement (chapitre 26) — une politique non documentée devient rapidement une pratique connue d'une seule personne, un risque de "bus factor" déjà évoqué ailleurs dans ce manuel.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Une sauvegarde de base de données volumineuse peut avoir un impact temporaire sur les performances pendant son exécution — planifier les sauvegardes aux heures de plus faible trafic (section 31.6, 2h du matin) réduit cet impact pour les utilisateurs réels.
</div>

## Résumé du chapitre

- Une stratégie de sauvegarde complète couvre la base de données, les volumes et la configuration — le code applicatif est déjà couvert par Git.
- Une politique de fréquence et de rétention explicite (par exemple, 7 quotidiennes + 4 hebdomadaires + 3 mensuelles) équilibre granularité et espace de stockage.
- Les sauvegardes doivent être stockées physiquement séparées du serveur d'origine, jamais uniquement sur celui-ci.
- Le principe le plus important de ce chapitre : une sauvegarde jamais testée en restauration n'est pas une garantie fiable — tester régulièrement, sur un environnement séparé.
- Les sauvegardes méritent le même niveau de protection de sécurité que les données originales qu'elles protègent.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le code applicatif lui-même nécessite-t-il généralement une sauvegarde séparée ?
   - a) Oui, systématiquement, en plus de Git
   - b) Non, il est déjà couvert par le dépôt Git versionné et distant
   - c) Uniquement le vendredi
   - d) Jamais, il est impossible à perdre

2. Une sauvegarde stockée uniquement sur le serveur d'origine :
   - a) Est une stratégie complète et suffisante
   - b) Ne protège pas contre une panne totale ou une compromission de ce serveur
   - c) Est plus rapide à restaurer et donc toujours préférable
   - d) N'a aucun rapport avec la sécurité

3. Le principe central de ce chapitre concernant les tests de restauration est :
   - a) Ils ne sont nécessaires qu'une seule fois, à la mise en place
   - b) Une sauvegarde jamais testée en restauration n'est pas une garantie fiable
   - c) Ils ralentissent inutilement la production
   - d) Ils remplacent le besoin de sauvegardes régulières

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Les sauvegardes méritent le même niveau de protection de sécurité que les données originales. — **Vrai** (section "Sécurité").
2. Un message "succès" affiché par un script de sauvegarde garantit que le fichier produit est réellement restaurable. — **Faux** (section 31.7).
3. La configuration (`.env`, certificats, Nginx) devrait être incluse dans le périmètre de sauvegarde. — **Vrai** (section 31.1).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 31.1</span>

Une équipe découvre, en pleine crise, que ses sauvegardes des six derniers mois sont toutes corrompues à cause d'un bug dans le script de compression jamais détecté. Explique comment un test de restauration régulier (section 31.7) aurait évité cette situation, et propose une fréquence de test adaptée à une application critique.
</div>

**Corrigé :** un test de restauration mensuel (ou plus fréquent pour une application critique) aurait détecté le bug de compression dès la première ou deuxième sauvegarde suivant son introduction, limitant la période de sauvegardes inutilisables à quelques semaines plutôt que six mois complets. Pour une application critique, un test hebdomadaire, voire un test automatisé après chaque sauvegarde (une restauration automatique vers un environnement de test, suivie d'une vérification de cohérence des données), réduirait ce risque à son minimum — l'investissement en automatisation se justifie par le coût potentiellement catastrophique d'une perte de données totale et irrémédiable.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais identifier les quatre catégories à sauvegarder (application, base de données, volumes, configuration).</li>
<li>☐ Je sais écrire un script de sauvegarde pour PostgreSQL et pour des volumes Docker.</li>
<li>☐ J'ai défini une politique explicite de fréquence et de rétention.</li>
<li>☐ Mes sauvegardes sont stockées physiquement séparées du serveur d'origine.</li>
<li>☐ Mes sauvegardes sont automatisées via cron, avec les logs redirigés correctement.</li>
<li>☐ J'ai testé au moins une fois une restauration réelle, sur un environnement séparé, avec des données vérifiables.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il chiffrer les sauvegardes ?</dt>
<dd>Oui, particulièrement si elles sont stockées sur un service tiers (section 31.5) — des outils comme Restic ou BorgBackup (section "En entreprise") intègrent ce chiffrement nativement, réduisant la complexité par rapport à une solution construite manuellement.</dd>

<dt>Combien coûte réellement une stratégie de sauvegarde correcte ?</dt>
<dd>Pour la majorité des projets de ce manuel, le coût de stockage (quelques Go à quelques dizaines de Go sur un service de stockage objet) reste modeste comparé au coût potentiel d'une perte de données totale — un calcul de proportionnalité qui penche presque toujours en faveur d'investir dans une vraie stratégie.</dd>

<dt>Une réplication de base de données en temps réel remplace-t-elle le besoin de sauvegardes ?</dt>
<dd>Non — une réplication protège contre une panne matérielle du serveur principal, mais réplique aussi instantanément une erreur humaine (une suppression accidentelle) vers la réplique. Les sauvegardes ponctuelles et la réplication répondent à des risques différents et se complètent, elles ne se substituent pas l'une à l'autre.</dd>
</dl>

## Références et pour aller plus loin

- PostgreSQL — documentation officielle sur `pg_dump` et la sauvegarde : [https://www.postgresql.org/docs/current/backup.html](https://www.postgresql.org/docs/current/backup.html)
- Restic — outil de sauvegarde chiffrée et dédupliquée : [https://restic.net](https://restic.net)
- BorgBackup — alternative mature avec des fonctionnalités similaires : [https://www.borgbackup.org](https://www.borgbackup.org)

*Chapitre suivant : monitoring — la Partie X s'ouvre. Métriques, logs, traces, alertes et disponibilité, pour savoir en permanence si tout ce qui a été construit depuis le chapitre 1 fonctionne réellement bien, pas seulement "tourne".*
