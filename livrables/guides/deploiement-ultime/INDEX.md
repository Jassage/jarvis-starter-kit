# Index

> Index alphabétique par catégorie. Les chiffres renvoient aux numéros de chapitre. Pour une définition complète d'un terme, voir le [Glossaire](GLOSSAIRE.md) ; pour la syntaxe d'une commande, voir les [Annexes](ANNEXES.md).

---

## Commandes Linux

apt (2, 5, 17) · cat (2) · chmod (2, 4) · chown (2) · cp (2) · curl (2, 9, 10) · df (2, 14, 17) · du (2, 14) · find (2) · free (2, 14, 17) · grep (2) · htop (2, 14, 18) · iostat (14, 18) · journalctl (2, 17) · lastlog (15) · lsof (18) · mkdir (2) · mv (2) · nano (2) · ncdu (14, 17) · nftables (15) · ps (2) · pwd (2) · rm (2) · rsync (2, 6) · scp (2, 6, 24) · ss (13, 17, 18) · sudo (2) · systemctl (2, 4) · tail (2) · timedatectl (4) · ufw (2, 4) · ulimit (18) · vim (2) · vmstat (14, 18) · wget (2)

## Commandes Git

git add, branch, checkout, clone, commit, diff, fetch, init, log, merge, pull, push, remote, status, switch, tag (3) · gitGraph (diagramme, 3)

## Commandes Docker et Compose

docker build, exec, images, logs, network, ps, run, stop, system prune, volume (7) · docker compose build, down, exec, logs, ps, up (8)

## Commandes bases de données

CREATE DATABASE/USER, GRANT (5, 12) · EXPLAIN / EXPLAIN ANALYZE (14, 18) · mysqldump / mysql (5, 12, 18) · pg_dump / pg_restore / psql (5, 12, 18) · redis-cli (5, 12) · mongosh (5) · bench backup/new-site (27)

## Commandes spécifiques aux chapitres 19-28

bench (27) · certbot (10, 19-28) · composer (6, 22) · dotnet publish (6, 25) · mvnw / mvn (6, 24) · npx prisma migrate (6, 19-21) · php artisan (6, 22) · pm2 (5, 6, 14, 19, 20)

---

## Logiciels et outils

Alertmanager (13) · Apache (5) · Backblaze B2 (16) · BorgBackup (16) · Brotli (14) · CrowdSec (15) · Django (6, 23) · Docker (7, 8) · ERPNext / Frappe (27) · Fail2ban (4, 15) · Gunicorn (6, 23) · GitHub Actions (11) · GitLab CI (11) · Grafana (13) · Gzip (9, 14) · Kestrel (6, 25) · Laravel (6, 22) · Let's Encrypt / Certbot (10) · Loki (13) · Lynis (15) · MongoDB (5) · MySQL (5, 12) · Netdata (13) · Next.js (6, 21) · NestJS (6, 20) · nftables (15) · Nginx (5, 9) · nvm (5) · Odoo (28) · pnpm (5) · PostgreSQL (5, 12) · Prisma (6, 21) · Prometheus (13) · Promtail (13) · Redis (5, 12, 14) · Restic (16) · Spring Boot (6, 24) · Trivy (15) · Uptime Kuma (13) · Wasabi (16) · WordPress (26)

## Protocoles

ACME (10) · FastCGI (5, 22) · HTTP/HTTPS (1, 9, 10) · HTTP/2 (9) · LogQL (13) · PromQL (13) · SSH (1, 2, 4) · TCP/UDP (1, Annexe J) · TLS/SSL (1, 10) · WSGI (6, 23)

## Acronymes

ACL (12) · API (partout) · CA (10) · CDN (9, 18) · CI/CD (11) · CRUD (6) · CVE (15) · DNS (1) · HSTS (10) · IP (1) · JWT (6, 18) · LEMP (26) · LTS (4) · ORM (6) · PID (1) · RAM (1) · SPA (6) · SSH (1) · SSL/TLS (1, 10) · TTL (14) · VPS (1) · WSGI (6) · YAML (8, 11)

## Concepts

Arbre de décision (18) · Cache-aside (14) · Défense en profondeur (15) · Déduplication (16) · Dérive de privilèges (15) · Faux positif de résolution (18) · Goulot d'étranglement (14) · Isolation diagnostique (18) · Méthode générale de dépannage (18) · Monitoring synthétique (13) · Multi-tenant / site (27, 28) · Reverse proxy (1, 9) · Rotation de logs (17) · Règle 3-2-1 (12, 16) · Scraping (13)

---

## Laboratoires par chapitre

| Chapitre | Laboratoires |
|---|---|
| 1 | Observer le DNS · Observer un échange client-serveur · Cartographier une application |
| 2 | Manipulation fichiers/permissions · Processus et services · Transfert de fichiers |
| 3 | Créer un dépôt et le pousser · Deploy Key + clone privé · Provoquer/résoudre un conflit |
| 4 | Louer un VPS · Utilisateur sécurisé + clé SSH · Pare-feu + Fail2ban |
| 5 | Stack Node complète · Base de données sécurisée · Checklist croisée |
| 6 | App statique · App process avec PM2 · Service systemd non-Node |
| 7 | Première image/container · Volume persistant · Réseau entre containers |
| 8 | Compose API + base · Ajouter Redis · Redéploiement sans perte |
| 9 | Deux sites sur un serveur · Reverse proxy complet · Cache et compression |
| 10 | Obtenir un certificat · Tester le renouvellement · Audit SSL Labs |
| 11 | Premier workflow CI · Déploiement auto sur VPS · Rollback simulé |
| 12 | Durcir une base · Sauvegarde + restauration · Automatisation cron vérifiée |
| 13 | Netdata · Stack Prometheus + Grafana · Alerte réelle testée |
| 14 | Diagnostiquer un goulot provoqué · Cache Redis mesuré · Gzip vs Brotli |
| 15 | Audit Lynis · Configurer CrowdSec · Audit comptes/sudo |
| 16 | Restic vers stockage distant · Comparer Restic/Borg · Test restauration mensuel |
| 17 | unattended-upgrades · Routine de nettoyage · Checklist sécurité mensuelle |
| 18 | Pannes volontaires · Construire un arbre de décision · Diagnostic chronométré |
| 19-28 | Déploiement complet · Variante/extension · Panne simulée et diagnostiquée |

---

⬅️ [Sommaire](README.md)
