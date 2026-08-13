# Guide de déploiement — application Node.js sur un VPS

> Playbook actionnable + explications. Écrit après le déploiement d'ACADÉMIE (UJEPH) le 2026-07-27, session pendant laquelle un projet en production depuis des mois n'avait ni process de déploiement fiable, ni sauvegardes, ni historique git propre. Chaque piège listé en section 12 a été réellement rencontré sur ce portefeuille (UJEPH sauf mention contraire), pas hypothétique.

**Stack visée :** backend Express/NestJS + Prisma + MySQL ou PostgreSQL, frontend Vite/React ou Next.js, servis depuis un VPS (Ubuntu/Debian) avec PM2 + nginx. Le guide reste valable projet après projet — BANKA, GESCOM, ACADÉMIE, OTELA, POSTA partagent tous cette même forme de déploiement.

**Ne couvre pas :** déploiement sur plateformes managées (Vercel, Railway) ni Firebase — ces plateformes gèrent déjà build/process/SSL, la logique est différente.

---

## Table des matières

0. À qui s'adresse ce guide
1. Vue d'ensemble de l'architecture cible
2. Prérequis serveur (une seule fois par VPS)
3. Préparer le dépôt AVANT le premier déploiement
4. Variables d'environnement
5. Premier déploiement (bootstrap)
6. Déploiement d'une mise à jour (routine)
7. Base de données : migrations
8. Sauvegardes automatiques
9. Rollback
10. Sécurité minimale
11. Checklist de vérification post-déploiement
12. Pièges déjà rencontrés (retour d'expérience réel)
13. Pourquoi ces choix (section pédagogique)

---

## 0. À qui s'adresse ce guide

À toi, quand tu déploies un projet de ce portefeuille sur un VPS pour la première fois, ou quand tu pousses une mise à jour sur un projet déjà en prod. Aussi utilisable tel quel comme support de cours (déploiement, DevOps de base).

Deux situations différentes, ne pas les confondre :
- **Premier déploiement** (section 5) : le serveur est vierge, rien n'existe encore.
- **Mise à jour routine** (section 6) : le serveur tourne déjà, tu déploies une nouvelle version du code.

---

## 1. Vue d'ensemble de l'architecture cible

```
Internet
   │
   ▼
 nginx (port 80/443, certificat SSL)
   │
   ├── / (frontend)        → fichiers statiques buildés (dist/ ou .next/)
   └── /api (backend)      → proxy_pass vers localhost:PORT (Express géré par PM2)
                                   │
                                   ▼
                            MySQL / PostgreSQL (local ou managé)
```

- **nginx** sert les fichiers statiques du frontend directement et fait reverse proxy vers le backend pour `/api`.
- **PM2** garde le process Node du backend vivant (redémarre s'il crashe, survit à un reboot serveur).
- **Le frontend n'a pas de process** : c'est du HTML/JS/CSS statique généré par `npm run build`, nginx le sert comme n'importe quel fichier.
- **La base de données** vit sur le serveur (ou un service managé séparé) — jamais sur la machine de dev.

---

## 2. Prérequis serveur (une seule fois par VPS)

```bash
# Connexion
ssh utilisateur@IP_SERVEUR

# Node.js (via nvm, pas le paquet système — versions plus fiables)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts

# PM2 (gestionnaire de process)
npm install -g pm2
pm2 startup    # génère la commande à exécuter pour que PM2 survive à un reboot — l'EXÉCUTER

# nginx
sudo apt update && sudo apt install nginx -y
sudo systemctl enable nginx

# Base de données (exemple MySQL — adapter pour PostgreSQL)
sudo apt install mysql-server -y
sudo mysql_secure_installation   # NE PAS sauter cette étape, voir section 10

# Certificat SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tondomaine.ht -d www.tondomaine.ht
```

**Créer un utilisateur dédié non-root** pour faire tourner l'app (jamais déployer en root) :

```bash
sudo adduser nomapp
sudo usermod -aG sudo nomapp   # seulement si besoin ponctuel de sudo
```

---

## 3. Préparer le dépôt AVANT le premier déploiement

Cette étape se fait **en local**, avant de toucher au serveur. Elle évite le piège #1 de la section 12 (build artefacts suivis par git).

**`.gitignore` — backend ET frontend, vérifier les deux :**

```gitignore
node_modules/
dist/
build/
.next/
.env
.env.local
*.log
```

Si le projet a déjà des mois d'historique et que `dist/` a été suivi par erreur depuis le début :

```bash
git rm -r --cached dist
git rm -r --cached gestion-backend/dist    # adapter au chemin réel
echo "dist/" >> .gitignore
git add .gitignore
git commit -m "Retirer dist/ du suivi git"
```

**`.env.example` committé** (jamais `.env` lui-même) — sert de documentation vivante des variables attendues :

```bash
# .env.example (backend)
DATABASE_URL="mysql://user:password@localhost:3306/nomdb"
JWT_SECRET="générer avec: openssl rand -hex 32"
PORT=4000
CORS_ORIGINS="https://tondomaine.ht"
```

**Vérifier qu'aucun secret réel n'est déjà dans l'historique git** (mot de passe MySQL, clé API, dump SQL avec données réelles) :

```bash
git log --all --full-history -- "*.env"
git log --all --full-history -- "*.sql"
```
Si quelque chose ressort : le secret est compromis (même si le fichier a été supprimé depuis, il reste dans l'historique). Le faire tourner (nouveau mot de passe, nouvelle clé) plutôt que de compter sur un `git rm`.

---

## 4. Variables d'environnement

**Règle absolue, source du piège #2 (section 12) : ne jamais committer `.env`, ne jamais copier un `.env` de dev vers la prod sans le relire ligne par ligne.**

Sur le serveur, créer le `.env` réel à la main (ou via un gestionnaire de secrets), jamais en copiant le fichier de la machine de dev tel quel :

```bash
# Backend — chaque variable vérifiée une par une, pas de copier-coller aveugle
DATABASE_URL="mysql://user:MOT_DE_PASSE_REEL@localhost:3306/nomdb"
JWT_SECRET="..."          # généré côté serveur, différent du secret de dev
CORS_ORIGINS="https://tondomaine.ht"   # jamais localhost en prod
NODE_ENV=production
```

```bash
# Frontend (build-time — Vite/Next injectent ces valeurs DANS le bundle au build)
VITE_API_URL="https://tondomaine.ht/api"   # jamais localhost:4000
```

**Piège spécifique au frontend** : les variables `VITE_*`/`NEXT_PUBLIC_*` sont injectées **au moment du build**, pas au runtime. Si tu changes `.env` après un build, il faut **rebuilder** pour que le changement soit pris en compte — un `pm2 restart` ne suffit pas côté frontend statique.

---

## 5. Premier déploiement (bootstrap)

```bash
# 1. Cloner le dépôt
cd ~
git clone git@github.com:tonorg/tonrepo.git app
cd app

# 2. Backend
cd backend
npm ci                              # jamais npm install en prod (ci = respecte le lockfile exactement)
cp .env.example .env
nano .env                           # remplir avec les vraies valeurs, voir section 4
npx prisma generate
npx prisma migrate deploy           # jamais migrate dev en prod, voir section 7
npm run build

# 3. Démarrer avec PM2
pm2 start dist/server.js --name nomapp-backend
pm2 save                            # persiste la liste de process pour le redémarrage au boot

# 4. Frontend
cd ../frontend
npm ci
cp .env.example .env
nano .env
npm run build                       # génère dist/ (Vite) ou .next/ (Next)

# 5. nginx — voir config ci-dessous, puis
sudo nginx -t                       # valider la syntaxe AVANT de recharger
sudo systemctl reload nginx
```

**Config nginx minimale (Vite/React, backend Express derrière /api) :**

```nginx
server {
    listen 80;
    server_name tondomaine.ht;

    root /home/nomapp/app/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # nécessaire pour le routing côté client (SPA)
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
`certbot --nginx` (section 2) réécrit ce fichier pour ajouter le HTTPS automatiquement — le lancer après cette config initiale.

---

## 6. Déploiement d'une mise à jour (routine)

C'est la commande que tu vas taper le plus souvent. **L'ordre compte** : migrations avant redémarrage, jamais l'inverse (le nouveau code peut dépendre du nouveau schéma).

```bash
cd ~/app
git pull origin main

# Backend
cd backend
npm ci
npx prisma migrate deploy    # applique les migrations en attente, no-op si aucune
npm run build
pm2 restart nomapp-backend
pm2 logs nomapp-backend --lines 50   # vérifier qu'il démarre sans erreur

# Frontend
cd ../frontend
npm ci
npm run build                # regénère dist/ avec le nouveau .env si besoin
```

Rien à redémarrer côté frontend : nginx sert les nouveaux fichiers dès que `dist/` est régénéré.

**Script à copier tel quel** (`~/scripts/deploy.sh`, à adapter aux chemins réels) :

```bash
#!/bin/bash
set -e   # arrête le script au premier échec — jamais continuer un déploiement à moitié fait

cd ~/app
git pull origin main

cd backend
npm ci
npx prisma migrate deploy
npm run build
pm2 restart nomapp-backend

cd ../frontend
npm ci
npm run build

echo "Déploiement terminé : $(date)"
```

---

## 7. Base de données : migrations

**`prisma migrate dev` est un outil de développement, jamais de production** — il peut réinitialiser des données s'il détecte une dérive. En prod, toujours `prisma migrate deploy` (applique les migrations existantes sans jamais générer ni réinitialiser).

**Le piège récurrent sur tout ce portefeuille (UJEPH, ACADÉMIE, BANKA, GESCOM, POSTA, OTELA — rencontré presque à chaque fois)** : une base a été construite via `prisma db push` ou modifiée à la main avant l'adoption des migrations propres. Résultat, `prisma migrate status` déclare des migrations "non appliquées" alors que les tables existent déjà réellement.

**Diagnostic avant de toucher à quoi que ce soit :**
```bash
npx prisma migrate status
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma
```
Si le `diff` ne montre **aucun** écart réel (les tables/colonnes existent déjà), les migrations peuvent être marquées comme déjà appliquées sans risque :
```bash
npx prisma migrate resolve --applied "20250115_nom_migration"
# répéter pour chaque migration antérieure à la dérive, dans l'ordre chronologique
```
**Ne jamais faire ça si le `diff` montre un écart réel** — dans ce cas la migration doit être réellement appliquée, pas baselinée.

**Bonne pratique pour éviter ce piège dès le prochain projet :** dès la toute première migration Prisma d'un nouveau projet, committer le dossier `prisma/migrations/` et ne plus jamais utiliser `db push` une fois qu'un premier client/utilisateur réel existe.

---

## 8. Sauvegardes automatiques

Mis en place pour la première fois sur UJEPH le 2026-07-27 — aucun projet de ce portefeuille n'avait de sauvegarde automatique fonctionnelle avant cette date-là (un script existait sur UJEPH mais n'avait jamais tourné, mot de passe resté au placeholder).

**Script `~/scripts/backup-db.sh` (exemple MySQL, adapter `pg_dump` pour PostgreSQL) :**

```bash
#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_DIR="/var/backups/nomapp/database"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

mysqldump -u backup_user -p'MOT_DE_PASSE_REEL' nomdb | gzip > "$BACKUP_DIR/nomdb_$DATE.sql.gz"

# Rotation : supprimer les sauvegardes locales plus vieilles que la rétention
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Copie distante (rclone préalablement configuré : rclone config)
rclone copy "$BACKUP_DIR/nomdb_$DATE.sql.gz" remote:NomApp-Backups/
```

```bash
chmod +x ~/scripts/backup-db.sh
crontab -e
# ajouter :
0 2 * * * /home/nomapp/scripts/backup-db.sh >> /var/log/backup-nomapp.log 2>&1
```

**Vérifications à faire une fois le cron en place, pas seulement "le script existe" :**
- Le mot de passe utilisé est le **vrai** mot de passe MySQL, pas un placeholder d'exemple.
- Le fichier apparaît bien dans `$BACKUP_DIR` le lendemain matin.
- Le fichier apparaît bien sur la destination distante (Drive/S3/autre) — un `rclone copy` qui échoue silencieusement ne sert à rien.
- **Tester une restauration au moins une fois** (sur une base de test, jamais en écrasant la prod) : `gunzip < backup.sql.gz | mysql -u root -p nomdb_test`. Une sauvegarde jamais restaurée n'est qu'une hypothèse.

---

## 9. Rollback

Si un déploiement casse la prod :

```bash
# Revenir au commit précédent
cd ~/app
git log --oneline -5          # identifier le dernier commit stable
git checkout <hash-commit-stable>

cd backend
npm ci
npm run build
pm2 restart nomapp-backend

cd ../frontend
npm ci
npm run build
```

**Cas migration de base de données déjà appliquée** : un rollback de code ne défait pas une migration. Si la migration a cassé quelque chose, écrire et appliquer une nouvelle migration corrective plutôt que de tenter un `migrate reset` en prod (perte de données). C'est pour ça que la sauvegarde (section 8) doit exister *avant* d'avoir besoin d'elle.

**Bonne pratique simple à faible coût** : tagger chaque déploiement réussi en prod (`git tag prod-2026-07-27 && git push --tags`) — retrouver rapidement "le dernier commit qui marchait" sans avoir à fouiller le log.

---

## 10. Sécurité minimale

Non-négociable avant tout premier déploiement réel :

- **`mysql_secure_installation`** exécuté (retire le compte anonyme, désactive la connexion root distante, retire la base de test par défaut).
- **Utilisateur MySQL/PostgreSQL dédié à l'application**, jamais `root` dans `DATABASE_URL` — droits limités à la base de l'app.
- **`JWT_SECRET` généré aléatoirement** (`openssl rand -hex 32`), jamais un fallback en dur dans le code, jamais réutilisé entre projets.
- **`CORS_ORIGINS` restreint au(x) domaine(s) réel(s)**, jamais `*` en prod.
- **Firewall** (`ufw`) : n'ouvrir que 22 (SSH), 80, 443. Le port du backend (ex. 4000) ne doit **jamais** être exposé directement à Internet — seul nginx en local doit pouvoir l'atteindre.
  ```bash
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw enable
  ```
- **SSH par clé, pas par mot de passe** une fois l'accès initial confirmé (`PasswordAuthentication no` dans `/etc/ssh/sshd_config`).
- **`helmet` (Express) ou équivalent** actif, vérifié après chaque déploiement (voir checklist section 11).

---

## 11. Checklist de vérification post-déploiement

À faire à chaque déploiement, pas seulement le premier :

- [ ] Le site répond en `200` sur le domaine réel (pas juste `localhost` sur le serveur) : `curl -I https://tondomaine.ht`
- [ ] Les en-têtes de sécurité sont présents : `curl -I https://tondomaine.ht/api/... | grep -i strict-transport`
- [ ] Un endpoint protégé refuse bien sans token (`401`), pour confirmer que l'auth n'a pas régressé.
- [ ] `pm2 logs nomapp-backend --lines 100` ne montre aucune erreur au démarrage.
- [ ] `pm2 list` : le process est bien `online`, pas en boucle de redémarrage (`↺` élevé = crash loop).
- [ ] Le frontend appelle bien l'API de **production** (ouvrir les DevTools réseau, vérifier l'URL des requêtes) — pas `localhost` (piège #2).
- [ ] `npx prisma migrate status` confirme "Database schema is up to date".
- [ ] Un test fonctionnel réel (pas juste visuel) : login, une action qui écrit en base, relecture de cette donnée.

---

## 12. Pièges déjà rencontrés (retour d'expérience réel)

Chacun de ces points vient d'un incident réel sur ce portefeuille, pas d'une liste générique copiée d'ailleurs.

1. **`dist/` suivi par git depuis le début du projet** (UJEPH) → conflit de merge à chaque déploiement, puisque le build généré sur le serveur diverge de celui généré en local. → `.gitignore` dès le premier commit (section 3), jamais après coup si évitable.

2. **`.env` frontend et code source pointant sur `localhost:4000`, resté tel quel après une session de dev locale** (UJEPH) → aurait cassé le site entier pour tous les visiteurs si déployé tel quel — détecté juste avant, pas après. → Toujours relire `VITE_API_URL`/`NEXT_PUBLIC_API_URL` avant un build de prod, jamais supposer que la dernière valeur committée est la bonne.

3. **Script de sauvegarde jamais réellement testé, mot de passe MySQL resté à sa valeur d'exemple** (UJEPH) → "on a un script de backup" ne veut rien dire tant qu'un fichier n'est pas apparu à l'endroit attendu avec de vraies données dedans. → Vérifier le premier run manuellement, pas seulement poser le cron.

4. **Dump SQL réel (données étudiants + hash de mots de passe) resté suivi par git** (UJEPH) → une base de données ne doit jamais transiter par un commit, même une fois, même par erreur (reste dans l'historique tant qu'aucun rewrite n'est fait). → `.gitignore` sur `*.sql`, `*.sql.gz`, `*.dump` dès le départ.

5. **9 à 14 migrations Prisma jamais enregistrées** en base malgré des tables déjà existantes (récurrent : UJEPH, ACADÉMIE, BANKA...) → voir procédure de diagnostic section 7, ne jamais deviner, toujours vérifier avec `migrate diff` avant de baseliner.

6. **URL d'API construite deux fois** (`VITE_API_URL` contenant déjà `/api`, puis code rajoutant encore `/api/...` par-dessus, en contournant le client HTTP central) → 404 systématique sur les endpoints concernés, fonctionnalités silencieusement cassées en prod alors que tout compilait. → Toujours passer par un seul client HTTP centralisé (axios instance unique), jamais de `fetch()` brut avec une URL reconstruite à la main dans un composant isolé.

7. **Log d'audit qui plante silencieusement** sur une violation de contrainte de clé étrangère (`userId` d'un compte supprimé, token encore valide) → l'action réussissait mais la trace d'audit disparaissait sans erreur visible. → Un log d'audit ne doit jamais pouvoir faire échouer ou perdre l'action qu'il trace ; prévoir une valeur de repli explicite plutôt qu'un `try/catch` vide.

8. **Token GitHub expiré au moment du push**, découvert seulement en voulant déployer → bloque un déploiement en pleine urgence si constaté trop tard. → Vérifier l'accès git (`git fetch`) *avant* de commencer une session de déploiement, pas pendant.

---

## 13. Pourquoi ces choix (section pédagogique)

**Pourquoi `npm ci` et pas `npm install` en prod ?**
`npm install` peut mettre à jour le lockfile si les `package.json` et `package-lock.json` divergent légèrement — imprévisible en prod. `npm ci` supprime `node_modules/` et réinstalle strictement ce que dit le lockfile : reproductible, identique à ce qui a été testé.

**Pourquoi PM2 et pas juste `node server.js` en arrière-plan (`&`) ?**
Un process lancé avec `&` meurt si le terminal SSH se ferme, et ne redémarre jamais tout seul après un crash ou un reboot serveur. PM2 le surveille, le relance automatiquement, et `pm2 startup` + `pm2 save` le refont démarrer après un redémarrage machine — sans PM2, un simple `sudo reboot` suffirait à mettre le site hors ligne jusqu'à intervention manuelle.

**Pourquoi migrations avant redémarrage, jamais l'inverse ?**
Le nouveau code du backend part du principe que le nouveau schéma existe déjà (nouvelle colonne, nouvelle table). Redémarrer le process avant d'avoir appliqué la migration correspondante fait planter chaque requête qui touche cette colonne — c'est la cause la plus fréquente de "ça marchait en local et ça casse en prod".

**Pourquoi ne jamais exposer le port backend directement (toujours passer par nginx) ?**
nginx apporte trois choses qu'Express seul ne gère pas bien nativement en prod : la terminaison SSL (le certificat vit dans nginx, pas dans le code Node), le fait de pouvoir servir plusieurs domaines/apps sur la même machine avec un seul port 443 ouvert, et une couche de filtrage avant que le trafic n'atteigne le process Node.

**Pourquoi une sauvegarde n'est une garantie qu'une fois restaurée au moins une fois ?**
Un script de sauvegarde peut sembler fonctionner (fichier créé, cron qui tourne) tout en produisant un dump corrompu, incomplet, ou chiffré avec un mot de passe qu'on ne connaît plus. La seule preuve qu'une sauvegarde est utilisable, c'est de l'avoir restaurée avec succès au moins une fois sur un environnement de test.

**Pourquoi baseliner des migrations plutôt que les "recréer proprement" ?**
Recréer l'historique de migrations from scratch efface la trace de comment le schéma a évolué, et risque un `migrate reset` accidentel qui viderait une base de production réelle. Baseliner (marquer "déjà appliqué" après avoir vérifié qu'il n'y a réellement aucun écart) préserve à la fois les données et un historique cohérent pour l'avenir.
