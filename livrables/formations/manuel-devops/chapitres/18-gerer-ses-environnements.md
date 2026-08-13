<div class="chapitre-titre-num">CHAPITRE 18 · 🟡 INTERMÉDIAIRE</div>

# Gérer ses environnements

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre pourquoi une application a besoin de plusieurs environnements distincts (development, testing, staging, production), maîtriser la gestion de configuration par fichiers `.env`, et comprendre les différences réelles qui doivent exister — et celles qui ne devraient jamais exister — entre ces environnements. Ce chapitre clôt la Partie VI et prépare directement la Partie VII (CI/CD), où chaque environnement se voit associé à une étape précise du pipeline.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Jusqu'ici, ce manuel n'a manipulé qu'un seul environnement à la fois : ton serveur de laboratoire. Une équipe réelle jongle presque toujours avec plusieurs environnements simultanément : le développeur teste en local, une version en cours de développement est déployée sur un serveur de "staging" pour validation, et la version stable tourne en production, servie à de vrais utilisateurs. Ce chapitre structure cette réalité multi-environnements avant d'aborder l'automatisation complète du passage de l'un à l'autre (Partie VII).
</div>

## 18.1 Les quatre environnements types

```mermaid
flowchart LR
    DEV["Development\n(machine locale)"] --> TEST["Testing\n(CI, chapitre 19)"]
    TEST --> STAGING["Staging\n(pré-production)"]
    STAGING --> PROD["Production\n(utilisateurs réels)"]
```

| Environnement | Rôle | Qui y accède |
|---|---|---|
| **Development** | Coder et tester localement, itérer vite | Le développeur, sur sa machine |
| **Testing** | Exécution automatisée des tests, sans intervention humaine | Le pipeline CI (chapitre 19), personne directement |
| **Staging** | Validation dans des conditions proches de la production, avant mise en ligne réelle | L'équipe, parfois des testeurs désignés |
| **Production** | L'application réelle, servie à de vrais utilisateurs | Les utilisateurs finaux |

<div class="encadre retenir">
<span class="encadre-titre">📌 Le principe central : se rapprocher de la production à chaque étape</span>
Chaque environnement, de development à production, doit ressembler <strong>de plus en plus</strong> à la production réelle. Development privilégie la vitesse d'itération (rechargement à chaud, données factices) ; staging, à l'inverse, devrait être aussi proche que possible de la production (même version d'OS, mêmes versions de dépendances, données représentatives) — c'est justement l'écart entre ces deux extrémités qui cause le fameux "ça marche en local mais pas en prod" du chapitre 1, un écart que Docker (Partie V) réduit déjà considérablement.
</div>

## 18.2 Fichiers `.env` : séparer configuration et code

```bash
# .env.example (versionné dans Git, sans valeurs réelles)
DATABASE_URL=postgres://utilisateur:motdepasse@localhost:5432/nom_base
REDIS_URL=redis://localhost:6379
NODE_ENV=development
API_PORT=3000
```

```bash
# .gitignore
.env
```

<div class="encadre retenir">
<span class="encadre-titre">📌 Le duo `.env` / `.env.example`</span>
<code>.env.example</code> est versionné dans Git : il documente <strong>quelles</strong> variables l'application attend, avec des valeurs factices ou vides — jamais de vraies valeurs. <code>.env</code> (le vrai fichier, avec les vraies valeurs) n'est <strong>jamais</strong> versionné (<code>.gitignore</code>), et chaque environnement (développeur local, staging, production) a le sien, rempli avec ses propres valeurs réelles. Un nouveau développeur copie <code>.env.example</code> vers <code>.env</code> et remplit les vraies valeurs pour son propre environnement local.
</div>

```bash
cp .env.example .env
```

**Cas pratique DevOps :** ce fichier `.env.example` est exactement ce qui a été mentionné en passant au chapitre 1 (section, exercice 1.2) comme mesure préventive contre les déploiements ratés par configuration oubliée.

## 18.3 Charger les variables selon l'environnement

```javascript
// Node.js, avec le paquet dotenv
require('dotenv').config();
const port = process.env.API_PORT || 3000;
const environnement = process.env.NODE_ENV || 'development';
```

```yaml
# Docker Compose (chapitre 13), rappel
services:
  api:
    build: ./api
    env_file:
      - .env
```

```bash
# Ubuntu, variable au niveau système (chapitre 5, rappel)
export NODE_ENV=production
```

**Explication :** trois mécanismes différents, tous compatibles entre eux — une bibliothèque comme `dotenv` charge un fichier `.env` local au démarrage de l'application ; Docker Compose peut injecter les mêmes variables directement dans le conteneur ; une variable exportée au niveau du shell (chapitre 5) prime généralement sur celle d'un fichier `.env`, un ordre de priorité utile à connaître pour surcharger ponctuellement une valeur sans modifier le fichier.

## 18.4 Ce qui doit différer entre environnements, et ce qui ne devrait jamais différer

| Doit différer | Ne devrait jamais différer |
|---|---|
| Identifiants de connexion (base de données, services externes) | Version du langage/runtime (Node.js, Python...) |
| Niveau de journalisation (verbeux en dev, plus sobre en production) | Version des dépendances (verrouillées par `package-lock.json`, chapitre 7) |
| Domaine/URL de l'application | Structure du code déployé (le même artefact, chapitre 22, du staging à la production) |
| Clés API (souvent des clés de test en staging, réelles en production) | Logique métier de l'application |
| Volumétrie des ressources (RAM/CPU allouées) | Le Dockerfile utilisé pour construire l'image (chapitre 12) |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de conception fréquente : des environnements trop différents</span>
Si staging tourne sur une version de Node.js différente de la production, ou avec des dépendances non verrouillées identiquement, la validation faite en staging perd une grande partie de sa valeur — un bug peut apparaître uniquement en production à cause de cet écart, exactement le problème que la Partie V (Docker) est censée éliminer. Le principe directeur : <strong>seule la configuration change</strong> entre environnements, jamais le code, les dépendances, ni le runtime.
</div>

## 18.5 Staging : le filet de sécurité avant la production

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ne pas déployer directement en production</span>
Staging existe pour détecter, dans des conditions proches du réel, des problèmes qu'un environnement de développement local (avec ses raccourcis, ses données factices, parfois une seule machine) ne révèle jamais — un problème de charge, une interaction entre deux services qui n'existait pas en local, ou simplement un test manuel final avant qu'un changement n'atteigne de vrais utilisateurs. C'est l'application concrète du "shift-left" du chapitre 2 : détecter un problème en staging coûte infiniment moins cher qu'en production.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — des données réalistes, jamais des données réelles sensibles</span>
Staging devrait utiliser un volume de données représentatif de la production (même échelle, mêmes types de cas limites) — mais jamais une copie brute de vraies données personnelles ou sensibles de production, sauf anonymisation rigoureuse préalable. Un incident de sécurité sur un environnement de staging, souvent moins protégé que la production, reste un vrai incident de sécurité si de vraies données personnelles y sont exposées.
</div>

## Atelier — Trois environnements avec Docker Compose

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 18.1 — Un même projet, trois configurations</span>

**Objectif** : appliquer concrètement la séparation configuration/code sur l'architecture du chapitre 13.

**Étapes détaillées** :

1. Crée `.env.example` documentant toutes les variables utilisées par l'architecture du chapitre 13 (`DATABASE_URL`, mots de passe, etc.), avec des valeurs factices.
2. Ajoute `.env` à `.gitignore`, crée un vrai `.env` local à partir de l'exemple.
3. Crée `.env.staging` (non versionné également) avec des valeurs différentes (par exemple, un `NODE_ENV=staging`, un port différent pour éviter tout conflit avec l'environnement local).
4. Lance l'architecture avec chaque fichier (`docker compose --env-file .env up -d`, puis `docker compose --env-file .env.staging up -d` après avoir arrêté la première), vérifie que le comportement change bien selon l'environnement chargé (par exemple, un niveau de log différent si ton application le permet).

**Résultat attendu** : la même image Docker, le même code, tournant différemment selon uniquement la configuration chargée — la démonstration concrète du principe central de ce chapitre (section 18.4).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Versionner un fichier `.env` réel par erreur</span>
Un `.env` avec de vraies valeurs, oublié dans `.gitignore` et commité par erreur, expose potentiellement des secrets dans l'historique Git (chapitre 7) — vérifier systématiquement `.gitignore` **avant** le premier commit d'un nouveau projet, pas après.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un staging qui diverge trop de la production</span>
Comme détaillé en section 18.4, un staging avec des versions de dépendances différentes de la production perd une grande partie de sa valeur de validation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Copier des données de production sensibles vers staging sans anonymisation</span>
Une pratique répandue mais risquée (section 18.5) — staging mérite une vraie réflexion de sécurité, pas seulement la production.
</div>

## En entreprise

**Réalité répandue** : la plupart des équipes ajoutent aussi un environnement de **preview** (parfois appelé "review app"), généré automatiquement pour chaque pull request (chapitre 8), permettant de visualiser un changement avant même sa fusion — une pratique de plus en plus courante avec des plateformes comme Vercel ou Netlify, et reproductible avec un pipeline CI/CD personnalisé (Partie VII).

**Bonne pratique répandue** : les accès à la production sont plus restreints que ceux au staging (principe du moindre privilège, chapitres 4 et 5) — tout le monde dans l'équipe n'a pas nécessairement besoin d'un accès direct à la production, même si l'accès au staging est plus largement ouvert pour faciliter la validation.

**Erreur classique observée** : des variables d'environnement de production accidentellement utilisées en développement local (ou l'inverse), causant des tests qui affectent de vraies données ou de vrais services externes — un rappel de l'importance de la vérification systématique de l'environnement chargé avant toute action sensible.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi séparer `.env` et `.env.example` ?"**
Réponse attendue : `.env.example` documente les variables attendues sans exposer de vraies valeurs, versionné dans Git ; `.env` contient les vraies valeurs, jamais versionné, propre à chaque environnement (section 18.2).

**Q2. "Qu'est-ce qui devrait rester identique entre staging et production ?"**
Réponse attendue : le code déployé, les versions de runtime et de dépendances, le Dockerfile — seule la configuration (identifiants, URLs, clés) devrait différer (section 18.4).

**Q3. "Pourquoi un environnement de staging est-il utile si l'application a déjà des tests automatisés en CI ?"**
Réponse attendue : les tests automatisés vérifient un comportement attendu de façon isolée ; staging permet une validation dans des conditions réelles d'intégration (charge, interaction entre services, test manuel final) que des tests automatisés ne couvrent pas toujours entièrement (section 18.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne jamais réutiliser les mêmes identifiants ou clés API entre staging et production — un environnement de staging compromis (souvent moins surveillé) ne devrait jamais donner accès aux ressources de production.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Garde `.env.example` **à jour** à chaque ajout de nouvelle variable dans le code — un fichier d'exemple obsolète, qui ne reflète plus les vraies variables attendues, perd toute son utilité pour un nouveau développeur ou un nouvel environnement.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un niveau de journalisation trop verbeux laissé actif par erreur en production (une configuration copiée depuis development sans ajustement) peut avoir un impact réel sur la performance et le volume de stockage des logs (chapitre 33) — un réglage à vérifier explicitement à chaque changement d'environnement.
</div>

## Résumé du chapitre

- Quatre environnements types structurent le cycle de vie d'une application : development, testing, staging, production.
- `.env.example` (versionné, sans vraies valeurs) et `.env` (jamais versionné, valeurs réelles propres à chaque environnement) séparent configuration et code.
- Le principe directeur : seule la configuration doit différer entre environnements, jamais le code, les dépendances ou le runtime.
- Staging rapproche la validation des conditions réelles de production, avant d'exposer un changement à de vrais utilisateurs.
- Les données de staging doivent être représentatives sans jamais exposer de vraies données sensibles non anonymisées.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `.env.example` devrait contenir :
   - a) De vraies valeurs de production
   - b) La liste des variables attendues, avec des valeurs factices ou vides
   - c) Le code source complet de l'application
   - d) Rien, ce fichier ne sert à rien

2. Ce qui devrait rester identique entre staging et production :
   - a) Les identifiants de connexion
   - b) Le code, les dépendances et le runtime
   - c) Le nom de domaine
   - d) Le niveau de journalisation

3. Une copie de données réelles de production vers staging sans anonymisation est :
   - a) Une bonne pratique recommandée
   - b) Un risque de sécurité, même si staging semble moins critique que production
   - c) Obligatoire pour des tests réalistes
   - d) Sans aucun impact

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. `.env` (le vrai fichier, avec valeurs réelles) devrait toujours être versionné dans Git pour faciliter le partage en équipe. — **Faux** (section 18.2).
2. Staging et production devraient idéalement utiliser exactement la même version de runtime et de dépendances. — **Vrai** (section 18.4).
3. Réutiliser les mêmes clés API entre staging et production est une pratique sûre et recommandée. — **Faux** (section "Sécurité").

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Une équipe découvre qu'un bug n'apparaît qu'en production, jamais en staging ni en développement local. Liste trois causes possibles liées à des écarts entre environnements (section 18.4), et comment les vérifier.
</div>

**Corrigé (exemple de réponse) :** (1) une version de dépendance différente entre staging et production (vérifier avec un fichier de verrouillage comme `package-lock.json`, chapitre 7, identique dans les deux environnements) ; (2) une variable de configuration mal définie ou manquante en production, jamais testée en staging (comparer les fichiers `.env` des deux environnements, en excluant les valeurs volontairement différentes comme les identifiants) ; (3) une différence de volumétrie de données réelle (staging avec un jeu de données trop petit ou trop simple pour révéler un problème de performance ou un cas limite qui n'apparaît qu'à l'échelle réelle de production).

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais nommer les quatre environnements types et le rôle de chacun.</li>
<li>☐ Je sais séparer configuration et code avec `.env`/`.env.example`.</li>
<li>☐ Je sais quelles différences entre environnements sont légitimes, et lesquelles sont dangereuses.</li>
<li>☐ Je comprends pourquoi staging existe, même avec des tests automatisés déjà en place.</li>
<li>☐ Je sais que les données de staging doivent être représentatives sans exposer de vraies données sensibles.</li>
<li>☐ Je vérifie systématiquement `.gitignore` avant le premier commit d'un nouveau projet.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours les quatre environnements, même pour un petit projet personnel ?</dt>
<dd>Non. Pour un projet personnel ou une très petite équipe, development et production peuvent suffire au départ, avec un environnement de test (chapitre 19) ajouté dès que la fiabilité devient une préoccupation réelle. Staging devient surtout indispensable à mesure que l'équipe grandit et que le risque d'un déploiement direct en production devient plus coûteux.</dd>

<dt>Comment gérer des secrets qui changent souvent (rotation de clés) à travers plusieurs environnements ?</dt>
<dd>Le chapitre 25 couvre en profondeur la gestion des secrets, y compris leur rotation — ce chapitre pose seulement le mécanisme de base (fichiers `.env` séparés par environnement).</dd>

<dt>Le staging doit-il tourner sur la même infrastructure que la production (même type de serveur, même échelle) ?</dt>
<dd>Idéalement le plus proche possible, mais un compromis raisonnable (une échelle réduite mais avec la même architecture logique) reste courant pour des raisons de coût, tant que les écarts introduits n'invalident pas la validation recherchée.</dd>
</dl>

## Références et pour aller plus loin

- The Twelve-Factor App — méthodologie de référence sur la configuration et les environnements (section III, "Config") : [https://12factor.net/fr/config](https://12factor.net/fr/config)
- `dotenv` — documentation officielle du paquet Node.js le plus utilisé pour charger des fichiers `.env` : [https://github.com/motdotla/dotenv](https://github.com/motdotla/dotenv)

*Chapitre suivant : comprendre l'intégration continue (CI) — la Partie VII s'ouvre, et les environnements de ce chapitre trouvent enfin leur place dans un pipeline automatisé complet.*
