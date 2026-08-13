# Chapitre 33 — Sauvegarder les données Docker

**Niveau : Avancé**

---

## Introduction

Le chapitre 32 a montré comment revenir en arrière sur l'**application**. Ce chapitre s'attaque à ce qu'un rollback ne protège jamais : les **données**. Un volume (chapitre 10) protège contre la suppression d'un conteneur — il ne protège ni contre une panne de disque, ni contre une suppression accidentelle du volume lui-même, ni contre une erreur humaine (`DROP TABLE` malencontreux). Ce chapitre construit une vraie stratégie de sauvegarde, avec la règle la plus importante de tout le chapitre : **une sauvegarde jamais restaurée n'est pas une sauvegarde, c'est un espoir.**

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- sauvegarder un volume Docker complet avec un conteneur utilitaire jetable ;
- réaliser un dump propre d'une base de données (`pg_dump`/`mysqldump`), et expliquer pourquoi c'est souvent préférable à une simple copie de volume pour une base ;
- automatiser des sauvegardes régulières avec un script et une tâche planifiée ;
- appliquer le principe qu'une sauvegarde jamais stockée hors du serveur d'origine n'est pas une vraie sauvegarde ;
- restaurer réellement une sauvegarde, la seule preuve qu'elle fonctionne.

## 📋 Prérequis

Chapitre 10 (volumes).

## Pourquoi ce chapitre est important

Un volume Docker donne un faux sentiment de sécurité, précisément parce qu'il résout déjà le problème le plus visible (la suppression d'un conteneur, chapitre 10). Ce chapitre couvre les problèmes moins visibles, mais tout aussi réels, contre lesquels un volume seul ne protège absolument pas.

---

## Concepts fondamentaux

1. **Ce qu'un volume ne protège pas** — rappel et extension du chapitre 10.
2. **Sauvegarder un volume** — le conteneur utilitaire jetable.
3. **Dump de base de données** — souvent préférable à une copie brute.
4. **Automatisation et rétention** — un script, une tâche planifiée.
5. **Hors du serveur** — la règle non négociable.
6. **Restaurer, réellement** — la seule vérification qui compte.

---

## 33.1 Ce qu'un volume ne protège jamais

> ⚠️ **Attention — extension directe du chapitre 10** — Un volume nommé protège des données contre la suppression du **conteneur** qui les utilise (chapitre 10, section 10.7). Il ne protège **pas** contre : une panne du disque physique de l'hôte, une suppression accidentelle du volume lui-même (`docker volume rm`, chapitre 24), une erreur humaine dans l'application (une requête `DELETE`/`DROP TABLE` mal ciblée), ou une compromission du serveur entier (chapitre 26). **Un volume est une protection contre le cycle de vie des conteneurs, jamais une stratégie de sauvegarde à lui seul.**

---

## 33.2 Sauvegarder un volume avec un conteneur utilitaire

```bash
# [Terminal]
mkdir -p backups
docker run --rm \
  -v db-data:/data:ro \
  -v "$(pwd)/backups:/backup" \
  alpine \
  tar czf /backup/db-data-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

**Explication :**
```text
docker run --rm
→ un conteneur JETABLE (chapitre 9, rappel), supprimé automatiquement
  après son exécution — il ne sert qu'une seule fois, comme outil ponctuel

-v db-data:/data:ro
→ monte le volume À SAUVEGARDER en LECTURE SEULE ("ro" — read-only) :
  aucune commande de sauvegarde ne devrait jamais pouvoir modifier
  les données qu'elle est en train de protéger

-v "$(pwd)/backups:/backup"
→ un BIND MOUNT (chapitre 10) vers un dossier de l'hôte, où le fichier
  de sauvegarde final sera réellement écrit et conservé

alpine tar czf /backup/....tar.gz -C /data .
→ utilise l'image "alpine" (minimale, chapitre 5) comme simple OUTIL
  ponctuel — exactement le même principe que "htpasswd" au chapitre 27 —
  pour compresser tout le contenu du volume en une archive unique
```

> 📌 **À retenir** — Ce patron réutilise un réflexe déjà vu au chapitre 27 : une image Docker peut servir d'**outil en ligne de commande jetable**, sans jamais avoir besoin d'installer `tar` ou quoi que ce soit d'autre directement sur la machine hôte.

**Restaurer ce volume** (vérifié en détail à la section 33.6) :
```bash
# [Terminal]
docker volume create db-data-restaure
docker run --rm \
  -v db-data-restaure:/data \
  -v "$(pwd)/backups:/backup" \
  alpine \
  tar xzf /backup/db-data-20260101-030000.tar.gz -C /data
```

---

## 33.3 Dump de base de données : souvent préférable à une copie brute

| | Copie brute du volume (tar) | Dump logique (`pg_dump`/`mysqldump`) |
|---|---|---|
| Risque de capturer une écriture en cours | Réel, si la base tourne pendant la copie (fichiers potentiellement incohérents) | Très faible — l'outil de dump gère la cohérence transactionnelle en interne |
| Portabilité entre versions mineures | Limitée (format de fichiers interne au moteur) | Bonne — un fichier SQL standard, rejouable sur une version différente |
| Lisibilité/vérifiabilité | Illisible (fichiers binaires internes) | Un fichier texte SQL, lisible et auditable |
| Taille | Peut être plus grande (inclut les index, structures internes) | Souvent plus compacte, surtout compressée |
| Cas d'usage recommandé | Sauvegarde complète d'urgence, restauration rapide à l'identique | Sauvegarde régulière, portable, la méthode par défaut recommandée |

```bash
# [Terminal] — PostgreSQL (rappel chapitre 17)
docker compose exec -T db pg_dump -U app_user app | gzip > backups/app-$(date +%Y%m%d).sql.gz

# [Terminal] — MySQL (rappel chapitre 16)
docker compose exec -T db mysqldump -u root -p"$DB_ROOT_PASSWORD" app | gzip > backups/app-$(date +%Y%m%d).sql.gz
```

**Explication :**
```text
docker compose exec -T
→ "-T" désactive l'allocation d'un pseudo-terminal (contrairement à "-it"
  du chapitre 23) — nécessaire ici car la sortie de la commande est
  REDIRIGÉE vers un fichier ("|"), pas affichée dans un terminal interactif

pg_dump / mysqldump
→ les outils NATIFS des moteurs de base de données, conçus précisément
  pour produire un export cohérent et portable, fournis par leurs
  images officielles respectives (chapitres 16-17)
```

> 📌 **À retenir** — Pour la majorité des sauvegardes régulières d'une base de données, un dump logique est le choix par défaut recommandé. La copie brute du volume (section 33.2) reste utile pour une sauvegarde complète incluant des fichiers non couverts par un dump SQL (des uploads utilisateur stockés sur disque, par exemple).

**Restaurer un dump SQL :**
```bash
# [Terminal] — PostgreSQL
gunzip -c backups/app-20260101.sql.gz | docker compose exec -T db psql -U app_user app

# [Terminal] — MySQL
gunzip -c backups/app-20260101.sql.gz | docker compose exec -T db mysql -u root -p"$DB_ROOT_PASSWORD" app
```

---

## 33.4 Automatiser avec un script et une tâche planifiée

```bash
# [backup.sh, sur le serveur]
#!/bin/bash
set -e
DATE=$(date +%Y%m%d-%H%M%S)
DOSSIER_BACKUP=/home/jaslin/backups

mkdir -p "$DOSSIER_BACKUP"
docker compose -f /home/jaslin/mon-projet/compose.yaml exec -T db \
  pg_dump -U app_user app | gzip > "$DOSSIER_BACKUP/app-$DATE.sql.gz"

# Rétention : ne garder que les 30 derniers jours de sauvegardes locales
find "$DOSSIER_BACKUP" -name "*.sql.gz" -mtime +30 -delete
```

```bash
# [Terminal, sur le serveur] — rendre exécutable, puis planifier
chmod +x backup.sh
crontab -e
```

```cron
0 3 * * * /home/jaslin/backup.sh
```

**Explication :**
```text
set -e
→ arrête immédiatement le script à la première commande qui échoue,
  plutôt que de continuer aveuglément (et potentiellement écraser
  une sauvegarde valide par une commande partiellement ratée)

find ... -mtime +30 -delete
→ supprime les sauvegardes locales de plus de 30 jours, une politique
  de rétention simple pour éviter une croissance illimitée du disque
  (rappel indirect du chapitre 24, appliqué ici aux sauvegardes elles-mêmes)
```

---

## 33.5 Hors du serveur : la règle non négociable

> ⚠️ **Attention** — Une sauvegarde stockée **uniquement** sur le même disque, la même machine, ou le même hébergeur que les données d'origine ne protège contre **aucun** scénario où ce disque, cette machine ou cet hébergeur devient inaccessible — exactement le scénario le plus grave qu'une sauvegarde est censée couvrir. Une vraie stratégie de sauvegarde suit la règle dite "3-2-1" (détaillée en profondeur au Guide Ultime du Déploiement, chapitre 16) : **3** copies des données, sur **2** supports différents, dont **1** hors site.

```bash
# [Terminal, sur le serveur] — exemple minimal : synchroniser vers un second serveur/stockage distant
rsync -avz "$DOSSIER_BACKUP/" utilisateur@serveur-de-sauvegarde:/backups/mon-projet/
```

> Pour l'automatisation complète vers un stockage objet distant (type S3-compatible), les outils dédiés (`restic`, `rclone`) et la stratégie 3-2-1 dans toute sa profondeur, voir le **Guide Ultime du Déploiement, chapitre 16** — ce chapitre se limite au mécanisme Docker (dump, conteneur utilitaire), la destination finale de la copie hors site suivant les mêmes principes que pour toute sauvegarde, conteneurisée ou non.

> ⚠️ **Attention — précaution sur `.env.production`** — Rappel des chapitres 9 et 28 : `.env.production` contient de vrais secrets. S'il fait partie d'une sauvegarde (ce qu'il devrait, pour une restauration complète), il doit être **chiffré** avant tout transfert ou stockage hors du serveur d'origine (par exemple avec `gpg`), jamais copié en clair vers un support de sauvegarde potentiellement moins sécurisé que le serveur de production lui-même.

```bash
# [Terminal] — chiffrer .env.production avant de l'inclure dans une sauvegarde transférée
gpg --symmetric --cipher-algo AES256 .env.production
# produit .env.production.gpg, seul fichier à transférer hors du serveur
```

---

## 33.6 Restaurer, réellement : la seule vérification qui compte

> 📌 **À retenir, la règle la plus importante de ce chapitre** — Une sauvegarde qui n'a **jamais** été restaurée avec succès, au moins une fois en conditions de test, n'offre **aucune** garantie réelle. Un fichier de sauvegarde corrompu, un script qui a silencieusement échoué depuis des mois, un mot de passe qui a changé sans mise à jour du script : tous ces problèmes restent invisibles jusqu'au jour où une vraie restauration est tentée — le pire moment possible pour les découvrir.

```bash
# [Terminal] — test de restauration périodique, dans un environnement ISOLÉ (jamais sur la production)
docker volume create db-data-test-restauration
docker run -d --name db-test -v db-data-test-restauration:/var/lib/postgresql/data -e POSTGRES_PASSWORD=test postgres:16
gunzip -c backups/app-20260101.sql.gz | docker exec -i db-test psql -U postgres
docker exec db-test psql -U postgres -c "SELECT COUNT(*) FROM tasks;"
docker rm -f db-test
docker volume rm db-data-test-restauration
```

> ✅ **Bonne pratique** — Planifier un test de restauration **régulier** (mensuel, par exemple), pas seulement au moment de la mise en place initiale de la stratégie de sauvegarde — un script de sauvegarde peut cesser de fonctionner silencieusement (un changement de mot de passe non répercuté, une modification de schéma qui casse l'automatisation) sans qu'aucune alerte n'apparaisse tant qu'aucune restauration n'est réellement tentée.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Sauvegarde corrompue découverte uniquement lors d'un vrai incident | Aucun test de restauration périodique | Planifier des tests de restauration réguliers (section 33.6) |
| Sauvegarde inutile après une panne totale du serveur | Sauvegarde stockée uniquement sur ce même serveur | Toujours répliquer hors site (section 33.5) |
| Base de données incohérente dans une sauvegarde brute | Copie du volume pendant que la base était activement en écriture | Préférer un dump logique (`pg_dump`/`mysqldump`) pour les bases de données actives |
| Secret exposé dans une sauvegarde transférée en clair | `.env.production` inclus sans chiffrement | Toujours chiffrer avant tout transfert hors du serveur d'origine |
| Disque saturé par des sauvegardes jamais nettoyées | Absence de politique de rétention | Ajouter une suppression automatique des sauvegardes trop anciennes |

---

## Laboratoire pratique n°1 — Sauvegarder un volume complet

**Objectifs :** exécuter la section 33.2.
**Prérequis :** Chapitre 10, un projet avec un volume de données (chapitres 20-21).

**Étapes :** sauvegarde le volume `db-data` avec le conteneur utilitaire, vérifie la taille et le contenu de l'archive obtenue.

**Résultat attendu :** un fichier `.tar.gz` cohérent, contenant bien les fichiers du volume.

---

## Laboratoire pratique n°2 — Dump SQL et comparaison

**Objectifs :** exécuter la section 33.3, et comparer les deux approches.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** réalise un dump SQL de la même base de données, compare sa taille et sa lisibilité à l'archive du volume brut du laboratoire 1.

**Résultat attendu :** une compréhension pratique, pas seulement théorique, des différences du tableau de la section 33.3.

---

## Laboratoire pratique n°3 — Le test qui compte : restaurer réellement

**Objectifs :** exécuter la section 33.6, la seule vérification qui compte selon ce chapitre.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** reproduis intégralement la section 33.6, dans un environnement isolé, jusqu'à confirmer que les données restaurées correspondent exactement aux données d'origine.

**Résultat attendu :** une restauration réussie et vérifiée, transformant une sauvegarde théorique en une garantie réellement testée.

---

## Exercices

1. Explique pourquoi un volume Docker seul n'est pas une stratégie de sauvegarde.
2. Pourquoi un dump logique (`pg_dump`) est-il généralement préférable à une copie brute pour une base de données active ?
3. Que signifie la règle "3-2-1", et pourquoi le "1" (hors site) est-il si important ?
4. Pourquoi `.env.production` mérite-t-il un chiffrement supplémentaire avant tout transfert de sauvegarde ?
5. Pourquoi une sauvegarde jamais restaurée ne constitue-t-elle "qu'un espoir", selon les termes de ce chapitre ?

---

## Quiz

**Question 1.** Un volume Docker protège contre :
a) Toute perte de données possible, sans exception
b) Uniquement la suppression du conteneur qui l'utilisait
c) Les pannes de disque physique
d) Les erreurs humaines dans l'application

**Question 2.** `pg_dump`, comparé à une copie brute du volume, offre principalement :
a) Une meilleure compression uniquement
b) Une cohérence transactionnelle et une portabilité meilleures pour une base active
c) Une vitesse de sauvegarde plus rapide dans tous les cas
d) Aucun avantage réel

**Question 3.** La règle "3-2-1" exige notamment :
a) Trois sauvegardes sur le même disque
b) Au moins une copie hors du site d'origine
c) Une sauvegarde par jour uniquement
d) Trois formats de fichiers différents

**Question 4.** `.env.production` inclus dans une sauvegarde transférée hors du serveur devrait être :
a) Laissé en clair pour simplifier la restauration
b) Chiffré avant tout transfert
c) Exclu systématiquement de toute sauvegarde
d) Renommé uniquement

**Question 5.** Une sauvegarde jamais testée par une restauration réelle :
a) Offre les mêmes garanties qu'une sauvegarde testée
b) N'offre aucune garantie réelle tant qu'elle n'a pas été restaurée avec succès au moins une fois
c) Est automatiquement valide si le script ne renvoie aucune erreur
d) N'a besoin d'être testée qu'une seule fois, à sa création

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Un volume protège contre la suppression d'un conteneur, jamais contre une panne de disque, une suppression accidentelle du volume, ou une erreur humaine — une vraie stratégie de sauvegarde reste nécessaire au-delà.
- Un conteneur utilitaire jetable (`alpine` + `tar`) sauvegarde un volume complet sans rien installer sur l'hôte.
- Pour une base de données active, un dump logique (`pg_dump`/`mysqldump`) est généralement préférable à une copie brute du volume.
- L'automatisation (script + cron) et une politique de rétention évitent l'oubli et la croissance illimitée des sauvegardes locales.
- Une sauvegarde stockée uniquement sur le serveur d'origine ne protège contre aucun scénario de perte totale de ce serveur — la règle 3-2-1 impose une copie hors site.
- **La seule vérification qui compte est une restauration réellement testée** — une sauvegarde jamais restaurée n'offre aucune garantie.

## ✅ Checklist avant de passer au chapitre 34

- [ ] Je sais sauvegarder un volume complet avec un conteneur utilitaire.
- [ ] Je sais réaliser un dump propre d'une base de données et je comprends pourquoi c'est souvent préférable.
- [ ] J'ai un script de sauvegarde automatisé avec une politique de rétention.
- [ ] Mes sauvegardes ne vivent jamais uniquement sur le serveur d'origine.
- [ ] J'ai réellement restauré une sauvegarde et vérifié l'intégrité des données obtenues.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Dump logique**
Définition simple : un export texte et portable d'une base de données, produit par un outil dédié comme `pg_dump` ou `mysqldump`.
Voir : Chapitre 33, section 33.3.

**Règle 3-2-1**
Définition simple : 3 copies des données, sur 2 supports différents, dont 1 copie hors site.
Voir : Chapitre 33, section 33.5.

**Test de restauration**
Définition simple : la vérification pratique qu'une sauvegarde peut réellement être reconstituée en données utilisables.
Voir : Chapitre 33, section 33.6.

---

## ❓ FAQ

**Faut-il sauvegarder Redis (chapitre 18) de la même façon qu'une base relationnelle ?**
Cela dépend entièrement de l'usage — rappel du chapitre 18 : un cache pur n'a souvent aucun besoin d'être sauvegardé (sa perte est acceptable, il se reconstruit), tandis qu'une file d'attente critique avec AOF activé mérite les mêmes précautions que toute donnée persistante.

**Combien de temps conserver les sauvegardes ?**
Cela dépend du contexte réglementaire et métier du projet — 30 jours de rétention locale (section 33.4) est un point de départ raisonnable pour la majorité des projets de ce manuel, à ajuster selon les besoins réels (obligations légales de conservation, fréquence de détection d'un problème...).

**Peut-on sauvegarder directement depuis l'hôte, sans passer par un conteneur utilitaire ?**
Techniquement oui, si le chemin réel du volume est connu (`docker volume inspect`, chapitre 10) — mais le patron du conteneur utilitaire reste préférable : il fonctionne identiquement sur n'importe quelle machine, sans dépendre de la structure interne du pilote de stockage Docker.

---

## Références officielles

- `pg_dump` — [postgresql.org/docs/current/app-pgdump.html](https://www.postgresql.org/docs/current/app-pgdump.html)
- `mysqldump` — [dev.mysql.com/doc/refman/8.0/en/mysqldump.html](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
- Sauvegarder et restaurer des volumes Docker — [docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes](https://docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes)
- Voir le Guide Ultime du Déploiement, chapitre 16, pour la règle 3-2-1 et les outils de sauvegarde distante dans toute leur profondeur.

---

## Conclusion

Les données sont maintenant protégées par une vraie stratégie, testée, pas seulement supposée fonctionner. Le chapitre 34 s'attaque à un autre pilier de la production : voir venir un problème **avant** qu'un utilisateur ne le signale, avec un vrai monitoring.

---

⬅️ [Chapitre 32 — Versioning, mise à jour, rollback](32-versioning-mise-a-jour-rollback.md) · ➡️ **Suite : Chapitre 34 — Monitoring**
