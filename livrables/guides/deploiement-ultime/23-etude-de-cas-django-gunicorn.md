# Chapitre 23 — Étude de cas : Django + Gunicorn

**Niveau : Intermédiaire**

---

## Introduction

Après deux études de cas conteneurisées, ce chapitre revient délibérément à l'installation directe (chapitre 6, section 6.10) pour un projet Django — l'occasion de pratiquer une nouvelle fois le schéma "process supervisé par systemd" sur un langage entièrement différent de Node.js, avec ses propres particularités (environnement virtuel, fichiers statiques, WSGI).

## 🎯 Objectifs pédagogiques

Déployer une application Django avec Gunicorn, PostgreSQL et systemd, du serveur vierge à la production HTTPS.

## 📋 Prérequis

Chapitres 4, 5 (section Python), 6 (section 6.10), 9, 10, 12.

## Pourquoi ce chapitre est important

Django reste l'un des frameworks backend Python les plus utilisés en production, en particulier pour des applications à forte composante administrative (son admin auto-généré). Ce chapitre confirme que le schéma "systemd + nginx" appris au chapitre 6 fonctionne identiquement, indépendamment du langage.

---

## Contexte du projet

**Brief.** Une école de formation professionnelle veut un système de gestion des inscriptions, avec une interface d'administration pour le personnel (l'admin Django, gratuite et immédiate) et un site public de candidature.

```mermaid
flowchart TD
    Internet(["Internet"]) --> Nginx["Nginx"]
    Nginx -->|"fichiers statiques"| Static["/staticfiles/"]
    Nginx -->|"proxy_pass"| Gunicorn["Gunicorn (systemd)<br/>3 workers"]
    Gunicorn --> Django["Application Django (WSGI)"]
    Django --> PG[("PostgreSQL")]
```

---

## Explications détaillées

### 23.1 Préparer le serveur et PostgreSQL (chapitres 4, 5, 12)

Identique au chapitre 19, sections 19.1 et 19.3, en remplaçant Node par Python :
```bash
sudo apt install python3 python3-pip python3-venv postgresql nginx -y
sudo apt install certbot python3-certbot-nginx -y
```

### 23.2 Déployer le code Django

```bash
ssh-keygen -t ed25519 -C "serveur-ecole"
git clone git@github.com:tonorg/ecole-inscriptions.git ~/app
cd ~/app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 23.3 Variables d'environnement et sécurité

```bash
nano .env
```
```
DEBUG=False
SECRET_KEY=...
DATABASE_URL=postgresql://ecole_user:MOT_DE_PASSE@localhost:5432/ecole
ALLOWED_HOSTS=inscriptions.tondomaine.ht
```
> ⚠️ **Attention, rappel du chapitre 6** — `DEBUG=False` est obligatoire : à `True`, Django affiche la trace complète d'erreur (code source, variables, parfois des secrets de configuration) à n'importe quel visiteur en cas de bug.

`ALLOWED_HOSTS` est une spécificité Django sans équivalent direct dans les frameworks Node vus jusqu'ici : Django refuse de répondre à toute requête dont l'en-tête `Host` ne correspond à aucune valeur de cette liste — une protection native contre certaines attaques d'en-tête Host falsifié, à renseigner avec le vrai domaine de production.

### 23.4 Migrations et fichiers statiques

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser   # premier compte admin
```
`collectstatic` regroupe tous les fichiers statiques (CSS, JS, y compris ceux de l'admin Django lui-même) en un seul dossier (`staticfiles/`) que nginx sert directement, sans jamais solliciter Python pour un simple fichier CSS.

### 23.5 Service systemd Gunicorn

```ini
# /etc/systemd/system/ecole.service
[Unit]
Description=École inscriptions (Gunicorn)
After=network.target postgresql.service

[Service]
User=jaslin
WorkingDirectory=/home/jaslin/app
Environment="PATH=/home/jaslin/app/venv/bin"
EnvironmentFile=/home/jaslin/app/.env
ExecStart=/home/jaslin/app/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 ecole.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```
`--workers 3` : le nombre de process Gunicorn parallèles — l'équivalent conceptuel du mode cluster PM2 (chapitre 14, section 14.10), mais natif à Gunicorn plutôt qu'ajouté après coup.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ecole
sudo systemctl status ecole
```

### 23.6 Nginx

```nginx
server {
    listen 80;
    server_name inscriptions.tondomaine.ht;

    location /static/ {
        alias /home/jaslin/app/staticfiles/;
    }
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo certbot --nginx -d inscriptions.tondomaine.ht
```

### 23.7 Redéploiement d'une nouvelle version

```bash
cd ~/app
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart ecole
```
> 📌 **À retenir** — Contrairement à PM2 qui recharge automatiquement la configuration, un service systemd (Gunicorn ici, comme Spring Boot ou ASP.NET plus loin) exige toujours un `restart` explicite après tout changement de code — jamais de rechargement automatique implicite.

### 23.8 Checklist finale de mise en production

- [ ] `sudo systemctl status ecole` : "active (running)".
- [ ] `DEBUG=False` confirmé.
- [ ] `python manage.py check --deploy` (commande native Django de vérification de production) ne signale aucun avertissement critique.
- [ ] Les fichiers statiques de l'admin s'affichent correctement (CSS chargé, pas une page brute sans mise en forme).

---

## Bonnes pratiques (récapitulatif du chapitre)

- `ALLOWED_HOSTS` toujours renseigné avec le domaine réel, jamais laissé à `*` en production.
- `collectstatic` systématique après chaque déploiement, sinon l'admin Django perd sa mise en forme.
- `python manage.py check --deploy` comme dernière vérification avant toute mise en production Django, un réflexe propre à ce framework.

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Pourquoi elle arrive | Conséquence |
|---|---|---|
| Oublier `collectstatic` | Étape jugée secondaire | Interface admin sans CSS, illisible |
| `ALLOWED_HOSTS` vide ou incorrect | Non renseigné après le développement local | Erreur 400 Bad Request sur toutes les requêtes |
| Oublier `systemctl restart` après un déploiement | Réflexe PM2 (auto-reload) transposé à tort | L'ancien code continue de tourner malgré le nouveau déployé |

---

## Captures d'écran à réaliser

> 📸 **Capture 26**
> **Logiciel :** navigateur
> **Pourquoi cette capture est utile :** montrer l'admin Django fonctionnel avec sa mise en forme correcte, preuve que `collectstatic` a réussi.
> **Page/écran concerné :** `/admin/` après connexion
> **Montrer :** l'interface admin correctement stylée

---

## Laboratoire pratique n°1 — Déployer cette stack de bout en bout

## Laboratoire pratique n°2 — Provoquer et corriger un oubli de `collectstatic`

**Étapes :** déploie une modification sans exécuter `collectstatic`, observe l'admin cassé visuellement, corrige.

## Laboratoire pratique n°3 — Tester `python manage.py check --deploy`

**Étapes :** exécute cette commande sur ton déploiement, corrige chaque avertissement signalé.

---

## Exercices

1. Explique le rôle de `ALLOWED_HOSTS`, absent des frameworks Node vus dans ce manuel.
2. Pourquoi Gunicorn nécessite-t-il un `restart` explicite après chaque déploiement, contrairement à certains comportements de PM2 ?

## Quiz

**Question 1.** `collectstatic` sert à :
a) Sauvegarder la base de données
b) Regrouper tous les fichiers statiques en un seul dossier servi directement par nginx
c) Compiler le code Python
d) Générer les migrations

> 🔑 **Corrigé** — 1: b

---

## 📝 Résumé du chapitre

Django, via Gunicorn et systemd, confirme la portabilité du schéma "process supervisé + nginx" à un langage entièrement différent de Node — avec ses spécificités propres (`ALLOWED_HOSTS`, `collectstatic`) qui n'ont pas d'équivalent direct ailleurs dans ce manuel.

## ✅ Checklist avant de passer au chapitre 24

- [ ] J'ai déployé Django avec Gunicorn et systemd, fichiers statiques correctement servis par nginx.

---

## Glossaire du chapitre

**WSGI**
Définition simple : le pont standard entre un serveur et une application Python.
Définition technique : Web Server Gateway Interface, une spécification définissant l'interface entre un serveur web et une application Python.
Voir : Chapitre 23, section 23.5.

## ❓ FAQ

**Pourquoi ne pas utiliser `python manage.py runserver` en production ?**
Ce serveur est conçu pour le développement uniquement — non sécurisé, non performant sous charge réelle, sans supervision de process. Gunicorn (ou une alternative comme uWSGI) est requis en production.

## Références officielles

Django Deployment Checklist — [docs.djangoproject.com/en/stable/howto/deployment/checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)

## Conclusion

Le chapitre 24 poursuit sur un autre langage compilé : Java avec Spring Boot, packagé en un unique fichier exécutable.

---

⬅️ [Chapitre 22 — Laravel + Docker](22-etude-de-cas-laravel-docker.md) · ➡️ **Suite : Chapitre 24 — Spring Boot**
