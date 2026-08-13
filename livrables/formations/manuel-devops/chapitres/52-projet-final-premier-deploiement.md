<div class="chapitre-titre-num">CHAPITRE 52 · 🔴 PROFESSIONNEL</div>

# Projet final : premier déploiement manuel

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Déployer GestionTâches manuellement sur un vrai VPS : le serveur, le déploiement, Nginx, DNS, HTTPS. Ce chapitre couvre les phases 7 à 11 du projet final, appliquant intégralement le guide complet du chapitre 26 à l'application conteneurisée au chapitre 51 — la première fois que GestionTâches devient réellement accessible sur Internet.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Jusqu'ici, GestionTâches n'a existé que sur ta machine locale. Ce chapitre reproduit, sans aucun raccourci, la procédure complète du chapitre 26 — créer le serveur, le sécuriser, y déployer l'application conteneurisée, la rendre accessible via un nom de domaine, en HTTPS. Ce chapitre ne réexplique aucune commande déjà détaillée ailleurs ; il les enchaîne dans l'ordre exact, appliquées cette fois à un vrai projet construit de A à Z dans ce manuel.
</div>

## 52.1 Phase 7 — Créer et sécuriser le serveur

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Reprend intégralement le chapitre 26, étapes 1 à 7</span>

```text
1. Créer un VPS Ubuntu 24.04 LTS (chapitre 26, section 26.2)
2. Connexion SSH initiale en root (section 26.3)
3. Créer l'utilisateur dédié "deploiement" (section 26.4)
4. Durcir SSH : PasswordAuthentication no, PermitRootLogin no (section 26.5)
5. Configurer UFW : SSH autorisé avant activation, 80/443 ouverts (section 26.6)
6. Installer Git (section 26.7)
7. Installer Docker Engine, ajouter l'utilisateur au groupe docker (section 26.7)
```

Aucune étape n'est simplifiée ni sautée — c'est la procédure complète, appliquée ici concrètement au serveur qui hébergera GestionTâches.
</div>

## 52.2 Phase 8 — Cloner et configurer le projet

```bash
git clone git@github.com:ton-compte/gestiontaches.git
cd gestiontaches
cp .env.example .env
nano .env  # renseigner un vrai DB_PASSWORD, jamais celui de développement local
```

**Explication :** reprend exactement le chapitre 26 (sections 26.8-26.9) — un clone via une clé SSH dédiée en lecture seule si possible, et un `.env` de production **différent** du `.env` local (chapitre 18, section "Sécurité" : jamais les mêmes identifiants entre environnements).

## 52.3 Phase 9 — Build et déploiement initial

```bash
docker compose build
docker compose up -d
docker compose ps
curl -f http://localhost/api/health
```

**Résultat attendu** : les trois services (`frontend`, `api`, `db`) démarrent dans l'ordre correct grâce aux healthchecks (chapitre 51, section 51.3), et l'API répond via le frontend — reprenant exactement le chapitre 26 (section 26.10).

## 52.4 Phase 10 — Configurer Nginx et le DNS

<div class="encadre astuce">
<span class="encadre-titre">💡 Nginx tourne déjà dans le conteneur frontend</span>
Contrairement au chapitre 26 (section 26.11), où Nginx était installé <strong>nativement</strong> sur le serveur en tant que reverse proxy devant l'application, GestionTâches utilise déjà Nginx <strong>à l'intérieur</strong> du conteneur <code>frontend</code> (chapitre 51, section 51.2) comme serveur web et routeur vers l'API. Le port 80 du conteneur est directement publié sur le serveur (<code>compose.yaml</code>) — pas besoin d'un second Nginx natif pour cette étape, une simplification légitime pour ce projet dont la seule application tourne sur ce serveur.
</div>

```bash
# Vérification DNS (chapitre 17)
dig gestiontaches.exemple.com A
```

**Résultat attendu** : l'enregistrement A pointe vers l'IP du serveur — configuré au préalable dans le panneau de gestion du domaine, selon la procédure exacte du chapitre 17 (section 17.4).

## 52.5 Phase 11 — Activer HTTPS

<div class="encadre attention">
<span class="encadre-titre">⚠️ Certbot a besoin d'un Nginx natif, pas seulement conteneurisé</span>
Le plugin <code>python3-certbot-nginx</code> (chapitre 16, section 16.3) modifie automatiquement une configuration Nginx <strong>native</strong> sur le serveur — il ne peut pas modifier directement la configuration à l'intérieur du conteneur <code>frontend</code>. La solution la plus simple pour ce projet : installer Nginx nativement en <strong>frontal</strong> (reverse proxy vers le conteneur <code>frontend</code>, lui-même déjà un reverse proxy vers <code>api</code>) — un double niveau de Nginx, une architecture légèrement différente du chapitre 26 mais cohérente avec les deux Dockerfiles déjà écrits au chapitre 51.
</div>

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

```nginx
# /etc/nginx/sites-available/gestiontaches.conf
server {
    listen 80;
    server_name gestiontaches.exemple.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gestiontaches.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d gestiontaches.exemple.com
sudo certbot renew --dry-run
```

**Explication :** ce Nginx natif écoute sur le port 80/443 (déjà autorisé au pare-feu, section 52.1) et transmet vers `localhost:80`, où le conteneur `frontend` écoute réellement (`docker compose`, `ports: ["80:80"]` ajusté ici, ou un port différent comme `8080:80` pour éviter tout conflit avec ce Nginx natif — un ajustement mineur mais nécessaire du `compose.yaml` du chapitre 51). Certbot modifie ensuite automatiquement cette configuration native pour ajouter HTTPS et la redirection (chapitre 16, section 16.3), exactement comme dans n'importe quel autre projet de ce manuel.

## Atelier — GestionTâches, en production, en HTTPS

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 52.1 — De zéro à une URL publique fonctionnelle</span>

**Objectif** : dérouler intégralement les phases 7 à 11, sans sauter d'étape.

**Étapes détaillées** : suis dans l'ordre exact les sections 52.1 à 52.5, en cochant chaque étape de la checklist de fin de chapitre au fur et à mesure — exactement l'esprit de l'atelier 26.1, appliqué cette fois à un projet réellement construit à travers ce manuel plutôt qu'à un exemple générique.

**Résultat attendu** : `https://gestiontaches.exemple.com` accessible publiquement, avec un certificat valide, l'application entièrement fonctionnelle (créer une tâche, la marquer terminée) — la première mise en production réelle du projet fil rouge.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Conflit de port entre le Nginx natif et le conteneur frontend</span>
Sans ajuster le port publié du conteneur `frontend` (section 52.5), le Nginx natif et le conteneur entrent en conflit sur le port 80 — un scénario déjà catalogué au chapitre 46 (scénario 17), directement pertinent ici.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Réutiliser le `.env` de développement local en production</span>
Rappel du chapitre 18 (section "Sécurité") et du chapitre 52.2 : un mot de passe de base de données identique entre local et production expose la production si l'environnement local est compromis.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Activer HTTPS avant que le DNS n'ait propagé</span>
Rappel direct du chapitre 16 (erreur fréquente n°1) — vérifier avec `dig` (section 52.4) avant de lancer Certbot, jamais dans l'ordre inverse.
</div>

## En entreprise

**Réalité répandue** : l'architecture "double Nginx" de ce chapitre (un Nginx natif frontal + Nginx conteneurisé) est une solution pragmatique et courante quand une seule application tourne sur un serveur donné — à plus grande échelle (plusieurs applications sur le même serveur), un unique Nginx natif routant vers plusieurs conteneurs applicatifs différents devient souvent plus simple à maintenir.

**Bonne pratique répandue** : documenter précisément ce type de choix d'architecture (pourquoi un double Nginx ici) dans le `DEPLOIEMENT.md` du projet, déjà recommandé au chapitre 26 — une décision légèrement différente de la structure "standard" mérite une explication écrite pour la prochaine personne qui découvre le projet.

**Erreur classique observée** : des architectures qui accumulent des couches de proxy sans jamais les documenter ni les questionner, rendant le diagnostic d'un problème réseau (chapitre 46, scénarios 24-30) significativement plus complexe qu'il ne devrait l'être.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi ce projet utilise-t-il un Nginx natif en plus du Nginx déjà présent dans le conteneur frontend ?"**
Réponse attendue : Certbot a besoin de modifier une configuration Nginx native pour gérer HTTPS automatiquement — il ne peut pas agir directement à l'intérieur d'un conteneur, d'où ce Nginx frontal supplémentaire pour ce projet précis (section 52.5).

**Q2. "Quelle est la différence entre le `.env` de développement local et celui de production ?"**
Réponse attendue : des identifiants différents, jamais partagés entre environnements, même si la structure des variables reste identique — rappel direct du chapitre 18 (section 52.2).

**Q3. "Quel est l'ordre correct entre la configuration DNS et l'activation de HTTPS ?"**
Réponse attendue : toujours vérifier la propagation DNS complète (`dig`) avant de lancer Certbot, jamais l'inverse — sans quoi la vérification de propriété de domaine par Let's Encrypt échoue systématiquement (section 52.4-52.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ce chapitre applique intégralement, sans exception, les 15 étapes du chapitre 26 — aucun raccourci de sécurité n'est acceptable simplement parce qu'il s'agit d'un "projet final pédagogique" plutôt qu'un vrai client.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente, dès maintenant, l'architecture réseau spécifique de ce projet (le double Nginx, section 52.5) dans le `DEPLOIEMENT.md` — cette documentation deviendra indispensable au chapitre 56 (documentation finale du projet).
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le double niveau de Nginx (natif puis conteneurisé) ajoute une latence négligeable dans la pratique — un compromis d'architecture largement acceptable pour la simplicité qu'il apporte à ce projet.
</div>

## Résumé du chapitre

- Les phases 7 à 11 du projet final reprennent intégralement, sans raccourci, la procédure du chapitre 26.
- GestionTâches nécessite une architecture à double Nginx (natif pour Certbot, conteneurisé pour le routage applicatif) — une adaptation mineure mais justifiée du guide standard.
- Le `.env` de production reste strictement distinct du `.env` de développement local.
- L'ordre DNS puis HTTPS, jamais inversé, reste non négociable.
- GestionTâches est, à la fin de ce chapitre, réellement accessible en HTTPS sur un vrai domaine public.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pourquoi ce projet nécessite-t-il un Nginx natif en plus du Nginx conteneurisé ?
   - a) Pour améliorer les performances
   - b) Parce que Certbot doit modifier une configuration Nginx native, inaccessible à l'intérieur d'un conteneur
   - c) Parce que Docker ne supporte pas Nginx
   - d) Ce n'est pas nécessaire, c'est une erreur du chapitre

2. Le `.env` de production devrait :
   - a) Être identique à celui du développement local
   - b) Contenir des identifiants distincts, jamais partagés avec le développement local
   - c) Rester vide
   - d) Être versionné dans Git pour faciliter le déploiement

3. Avant d'activer HTTPS avec Certbot, il faut :
   - a) Désactiver le pare-feu
   - b) Vérifier que le DNS pointe réellement vers le serveur
   - c) Supprimer tous les conteneurs
   - d) Rien de particulier

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Ce chapitre simplifie ou saute certaines étapes de sécurité du chapitre 26 parce qu'il s'agit d'un projet pédagogique. — **Faux** (section "Sécurité").
2. Un conflit de port entre Nginx natif et le conteneur frontend est un scénario déjà catalogué au chapitre 46. — **Vrai** (section "Erreurs fréquentes", erreur n°1).
3. Les choix d'architecture spécifiques à un projet, comme le double Nginx de ce chapitre, méritent d'être documentés. — **Vrai** (section "En entreprise").

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 52.1</span>

Ajuste le `compose.yaml` du chapitre 51 pour que le conteneur `frontend` publie son port sur `8080` plutôt que `80`, afin d'éviter le conflit avec le Nginx natif de ce chapitre.
</div>

**Corrigé :**
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
```
Et ajuster en conséquence le `proxy_pass` du Nginx natif (section 52.5) : `proxy_pass http://localhost:8080;` — cette modification élimine le conflit du scénario 17 (chapitre 46) en donnant à chaque Nginx (natif et conteneurisé) un port distinct sur le serveur hôte, tout en gardant le port 443 (HTTPS, géré uniquement par le Nginx natif après l'intervention de Certbot) comme unique point d'entrée public réel.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai créé et sécurisé un vrai VPS pour GestionTâches (utilisateur dédié, SSH durci, pare-feu).</li>
<li>☐ J'ai cloné le projet et configuré un `.env` de production distinct du développement local.</li>
<li>☐ J'ai construit et démarré l'application conteneurisée sur ce serveur.</li>
<li>☐ J'ai configuré le DNS et vérifié sa propagation avant de continuer.</li>
<li>☐ J'ai activé HTTPS avec Certbot, vérifié le renouvellement automatique.</li>
<li>☐ GestionTâches est accessible et fonctionnelle sur son domaine public, en HTTPS.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Pourrais-je éviter le double Nginx d'une autre façon ?</dt>
<dd>Oui, par exemple en ne conteneurisant pas le frontend et en le servant directement par le Nginx natif comme fichiers statiques classiques (chapitre 15) — un choix d'architecture alternatif tout aussi valable, ce chapitre ayant choisi de garder la cohérence avec la conteneurisation complète du chapitre 51.</dd>

<dt>Ce déploiement manuel sera-t-il automatisé plus tard dans le projet final ?</dt>
<dd>Oui, entièrement — le chapitre 53 transforme cette procédure manuelle en pipeline CI/CD automatisé, exactement la même progression que les chapitres 26 puis 27 pour le reste de ce manuel.</dd>

<dt>Faut-il refaire cette procédure à chaque déploiement futur ?</dt>
<dd>Non — cette procédure manuelle n'est nécessaire qu'une seule fois, pour le provisionnement initial du serveur (chapitre 27, section 27.3, la distinction déjà établie entre provisionnement et redéploiement).</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 5, 6, 15, 16, 17, 18, 26, 46.

*Chapitre suivant : projet final, pipeline CI/CD — automatiser entièrement ce déploiement manuel, phases 12 et 13 du projet.*
