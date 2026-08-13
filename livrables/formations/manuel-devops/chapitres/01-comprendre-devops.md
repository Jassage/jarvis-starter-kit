<div class="chapitre-titre-num">CHAPITRE 1 · 🟢 DÉBUTANT ABSOLU</div>

# Comprendre DevOps

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre précisément ce que recouvre le mot "DevOps" avant de toucher au moindre outil : le problème historique qu'il résout, sa définition exacte, le cycle en neuf étapes qui structure tout le reste de ce manuel, et les grands piliers (collaboration, automatisation, CI, CD, Infrastructure as Code, monitoring, feedback continu) que chaque partie du manuel viendra détailler. À la fin de ce chapitre, tu sauras expliquer DevOps sans dire "c'est utiliser Docker", et tu sauras situer n'importe quel outil du reste du manuel (Git, Docker, GitHub Actions, Terraform, Kubernetes...) à sa juste place dans ce cycle.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Imagine une petite équipe qui développe une application de gestion pour une entreprise. Les développeurs travaillent sur leurs machines, l'application fonctionne parfaitement en local. Le jour de la mise en production, rien ne se passe comme prévu : une dépendance manque sur le serveur, une variable d'environnement n'a pas été configurée, la base de données n'a pas la même version. La personne qui gère le serveur (souvent appelée "l'opérationnel", ou *Ops*) n'a jamais vu ce code avant ce jour-là, et découvre en urgence, sous pression, ce qu'elle doit installer et configurer. Le déploiement prend six heures au lieu de vingt minutes, et personne ne sait vraiment pourquoi "ça marchait en local". Ce chapitre explique pourquoi cette scène, qui s'est répétée des milliers de fois dans l'histoire du logiciel, a donné naissance à un mouvement entier : DevOps. Le reste de ce manuel t'apprend, concrètement, à ne plus jamais revivre cette scène.
</div>

## 1.1 Le problème que DevOps résout : le mur entre Dev et Ops

Avant l'apparition du mot "DevOps" (vers 2008-2009), la plupart des organisations logicielles séparaient nettement deux équipes :

- **Les développeurs (Dev)** écrivent le code, ajoutent des fonctionnalités, corrigent des bugs. Leur objectif implicite : livrer des changements rapidement.
- **Les opérationnels (Ops)** gèrent les serveurs, s'assurent que tout tourne, tout le temps, sans interruption. Leur objectif implicite : que rien ne casse.

Ces deux objectifs sont en tension directe. Un changement fréquent augmente le risque de casser quelque chose ; la stabilité, elle, est plus facile à garantir en changeant le moins possible. Dans beaucoup d'organisations, cette tension a fini par créer un véritable **mur** entre les deux équipes : le développeur "livre" son code par-dessus le mur (souvent un simple zip ou un dépôt Git), l'opérationnel le récupère de son côté sans connaître les détails, et découvre les problèmes au moment du déploiement, généralement dans l'urgence.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le relais mal passé</span>
Imagine une course de relais où le premier coureur (le développeur) pose le témoin par terre au bout de la piste et s'en va, plutôt que de le tendre directement au second coureur (l'opérationnel) qui, lui, ne sait même pas exactement où chercher le témoin ni à quelle vitesse le premier courait. Le second coureur perd un temps précieux à comprendre la situation avant de pouvoir repartir. DevOps, c'est réapprendre à courir ce relais en équipe, avec un vrai passage de témoin, plutôt que deux coureurs qui s'ignorent sur la même piste.
</div>

Ce "mur" produit des symptômes très reconnaissables, que ce manuel va systématiquement éliminer chapitre après chapitre :

| Symptôme du mur Dev/Ops | Conséquence concrète |
|---|---|
| "Ça marche sur ma machine" | L'environnement de production diffère de l'environnement de développement : versions différentes, dépendances manquantes, configuration absente |
| Déploiements rares et redoutés | Comme chaque déploiement est risqué et manuel, les équipes en font le moins possible — ce qui accumule les changements et rend chaque déploiement encore plus risqué |
| Résolution d'incident lente | L'opérationnel ne connaît pas le code, le développeur ne connaît pas l'infrastructure ; chacun attend l'autre pour comprendre un incident |
| Aucune traçabilité | Personne ne sait précisément ce qui tourne en production, ni pourquoi, ni depuis quand |

## 1.2 Une définition précise de DevOps

<div class="encadre retenir">
<span class="encadre-titre">📌 Définition</span>
<strong>DevOps</strong> est un ensemble de pratiques, d'outils et surtout d'une <strong>culture</strong> qui vise à rapprocher le développement (Dev) et l'exploitation (Ops) pour livrer des logiciels plus rapidement, plus fréquemment et de façon plus fiable, en s'appuyant fortement sur l'<strong>automatisation</strong> et un <strong>feedback continu</strong> entre le code écrit et son comportement réel en production.
</div>

Trois mots de cette définition méritent d'être creusés dès maintenant, parce qu'ils reviendront dans chaque partie du manuel :

- **Culture** : DevOps commence par un changement d'état d'esprit, pas par l'installation d'un logiciel. Une équipe qui installe Docker et Kubernetes sans jamais changer sa façon de collaborer n'a pas "fait du DevOps" — elle a seulement ajouté des outils à un mur qui existe toujours (chapitre 2).
- **Automatisation** : chaque tâche répétitive et manuelle (tester, construire, déployer, vérifier) est une source d'erreur humaine et de lenteur. L'automatiser la rend fiable, rapide, et surtout **reproductible** — la même action produit toujours le même résultat.
- **Feedback continu** : plus l'écart entre "j'écris une ligne de code" et "je sais si elle fonctionne réellement en conditions réelles" est court, moins une erreur coûte cher à corriger. Un bug détecté en écrivant le code coûte quelques secondes à corriger ; le même bug découvert trois semaines plus tard en production peut coûter des heures, voire un incident client.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de compréhension fréquente : "DevOps = un métier"</span>
Le mot "DevOps" désigne d'abord une <strong>culture et un ensemble de pratiques</strong>, pas uniquement un poste de travail. Il existe bien des "ingénieurs DevOps" sur le marché de l'emploi (souvent des personnes qui construisent et maintiennent les pipelines d'automatisation, l'infrastructure et l'outillage partagé) — mais l'objectif final n'est jamais qu'une seule personne "fasse du DevOps" à la place de toute l'équipe. C'est toute l'équipe (développeurs compris) qui doit se sentir concernée par la fiabilité de la production, et tout opérationnel qui doit comprendre ce qui tourne réellement.
</div>

## 1.3 D'où vient ce mot : bref historique

Le terme "DevOps" est né autour de 2008-2009, popularisé notamment par **Patrick Debois**, qui a organisé en 2009 la première conférence "DevOpsDays" à Gand, en Belgique. La même année, une présentation restée célèbre — *"10+ Deploys Per Day: Dev and Ops Cooperation at Flickr"*, par John Allspaw et Paul Hammond — a montré publiquement qu'une équipe pouvait déployer en production plus de dix fois par jour, de façon fiable, à condition de repenser la collaboration entre développement et exploitation. C'était, à l'époque, une idée presque provocante : la norme dans beaucoup d'entreprises était alors un déploiement toutes les quelques semaines, voire tous les quelques mois.

Ce mouvement s'inscrit dans la continuité des méthodes **agiles**, qui avaient déjà, dans les années 2000, cherché à réduire les cycles de développement logiciel et à rapprocher les équipes du besoin réel. DevOps étend ce même esprit à l'exploitation : pourquoi le code irait-il vite jusqu'à la fin du développement, pour ensuite ralentir brutalement au moment de la mise en production ?

## 1.4 Le cycle DevOps en neuf étapes

Le cycle DevOps est souvent représenté par une boucle infinie, parce que le travail ne "s'arrête" jamais à la mise en production : ce qui est observé en production nourrit directement le développement suivant.

```mermaid
flowchart LR
    PLAN[PLAN] --> CODE[CODE]
    CODE --> BUILD[BUILD]
    BUILD --> TEST[TEST]
    TEST --> RELEASE[RELEASE]
    RELEASE --> DEPLOY[DEPLOY]
    DEPLOY --> OPERATE[OPERATE]
    OPERATE --> MONITOR[MONITOR]
    MONITOR --> FEEDBACK[FEEDBACK]
    FEEDBACK -.-> PLAN
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication du schéma, étape par étape</span>

1. **PLAN** : définir ce qu'on va construire (une fonctionnalité, une correction) — hors du périmètre technique de ce manuel, mais point de départ de toute la boucle.
2. **CODE** : écrire le code, versionné avec Git (Partie III).
3. **BUILD** : transformer le code source en quelque chose d'exécutable — installer les dépendances, compiler si nécessaire, construire une image Docker (Partie V).
4. **TEST** : vérifier automatiquement que le code fait ce qu'il est censé faire, sans intervention humaine à chaque fois (chapitre 23).
5. **RELEASE** : décider qu'une version précise du logiciel est prête à être déployée — souvent matérialisé par un tag Git ou une image versionnée (chapitre 14).
6. **DEPLOY** : mettre cette version en production, de façon automatisée et reproductible (Partie VIII).
7. **OPERATE** : faire fonctionner l'application en production au quotidien — la garder disponible, sécurisée, performante.
8. **MONITOR** : observer ce qui se passe réellement en production : métriques, logs, alertes (Partie X).
9. **FEEDBACK** : ce qui a été observé en production (un bug, une lenteur, un besoin non anticipé) revient nourrir la prochaine phase de PLAN — la boucle ne s'arrête jamais.
</div>

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser</span>
Chaque chapitre de ce manuel se rattache à une ou plusieurs étapes de ce cycle. Si tu perds le fil de "pourquoi j'apprends ceci maintenant", reviens à ce schéma : Git et GitHub outillent CODE ; Docker outille BUILD ; les tests automatisés outillent TEST ; GitHub Actions outille RELEASE et une bonne partie de DEPLOY ; Nginx, les VPS et Kubernetes outillent DEPLOY et OPERATE ; Prometheus et Grafana outillent MONITOR ; et la culture DevOps elle-même (chapitre 2) est ce qui fait vraiment boucler FEEDBACK vers PLAN.
</div>

## 1.5 Les piliers concrets de DevOps

Cinq piliers reviennent dans la quasi-totalité des définitions sérieuses de DevOps. Ce manuel leur consacre chacun une ou plusieurs parties entières :

| Pilier | Ce qu'il apporte | Où ce manuel le traite |
|---|---|---|
| **Intégration continue (CI)** | Chaque changement de code est automatiquement testé et validé, dès qu'il est poussé | Partie VII |
| **Déploiement continu (CD)** | Chaque changement validé peut être mis en production rapidement, avec un minimum d'intervention manuelle | Parties VII et VIII |
| **Infrastructure as Code (IaC)** | L'infrastructure (serveurs, réseau, ressources cloud) est décrite dans des fichiers versionnés, pas configurée à la main | Partie XII |
| **Monitoring et observabilité** | On sait, à tout moment, si l'application fonctionne bien réellement — pas seulement "elle tourne", mais "elle tourne bien" | Partie X |
| **Culture de collaboration** | Développeurs et opérationnels partagent la responsabilité de la production, communiquent, et s'améliorent après chaque incident sans chercher de coupable | Chapitre 2, et en filigrane partout |

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — commencer petit, pas parfait</span>
Il n'est pas nécessaire de maîtriser les cinq piliers en même temps pour commencer à "faire du DevOps". Une équipe qui automatise ses tests (CI) et rien d'autre a déjà fait un pas réel. L'erreur classique du débutant est de vouloir immédiatement Kubernetes, Terraform et un pipeline complet avant même d'avoir un simple script de déploiement fiable. Ce manuel respecte volontairement cette progressivité : les chapitres avancés (Terraform, Kubernetes) n'arrivent qu'après que les fondamentaux (Linux, Git, Docker, un premier pipeline CI/CD, un premier VPS) sont solides.
</div>

## 1.6 Ce que DevOps n'est PAS

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de compréhension fréquente : "DevOps = Docker"</span>
Docker est un <strong>outil</strong> extrêmement utile pour appliquer certains principes DevOps (reproductibilité, "ça marche pareil partout"), mais on peut faire du DevOps sans Docker (par exemple avec des machines virtuelles bien automatisées), et on peut utiliser Docker sans faire du DevOps (par exemple si une seule personne construit des images à la main, sans CI, sans tests automatisés, sans monitoring). Docker n'est qu'un chapitre parmi cinquante-six dans ce manuel : nécessaire à connaître, absolument pas suffisant à lui seul.
</div>

De la même façon, DevOps n'est pas :
- **Un produit qu'on achète** : aucun logiciel, à lui seul, ne "rend" une organisation DevOps.
- **Une équipe qu'on isole** : créer une "équipe DevOps" séparée des développeurs et des opérationnels, sans changer la collaboration entre eux, reconstruit souvent... un nouveau mur, avec un nom différent.
- **Réservé aux grandes entreprises** : les principes de ce manuel (automatiser, tester, versionner, observer) s'appliquent aussi bien à un projet personnel qu'à une équipe de 200 personnes — seule l'échelle des outils change.

## 1.7 Panorama de ce que ce manuel va construire

```{.uml}
DevOps de A a Z
│
├─ Partie I    : Culture et fondations DevOps                    (ch. 1-3)
├─ Partie II   : Linux et administration serveur                 (ch. 4-6)
├─ Partie III  : Git et collaboration                             (ch. 7-9)
├─ Partie IV   : Automatisation et scripting                      (ch. 10)
├─ Partie V    : Conteneurisation avec Docker                     (ch. 11-14)
├─ Partie VI   : Serveur web, reseau et environnements            (ch. 15-18)
├─ Partie VII  : Integration continue                             (ch. 19-24)
├─ Partie VIII : Secrets et deploiement en production             (ch. 25-29)
├─ Partie IX   : Donnees et sauvegardes                           (ch. 30-31)
├─ Partie X    : Observabilite                                    (ch. 32-34)
├─ Partie XI   : Securite DevSecOps                                (ch. 35-36)
├─ Partie XII  : Infrastructure as Code et Cloud                  (ch. 37-40)
├─ Partie XIII : Kubernetes                                       (ch. 41-44)
├─ Partie XIV  : Architecture, performance et fiabilite           (ch. 45-49)
└─ Partie XV   : Projet final fil rouge                           (ch. 50-56)
```

Chaque partie s'appuie sur la précédente : impossible de comprendre un pipeline CI/CD (Partie VII) sans savoir utiliser Git (Partie III) ; impossible de déployer sur Kubernetes (Partie XIII) sans déjà maîtriser Docker (Partie V). Le manuel se termine par un projet fil rouge (Partie XV) qui remobilise, dans l'ordre, absolument tout ce qui aura été appris — exactement comme un vrai projet professionnel le ferait.

## Atelier — Repérer le mur Dev/Ops autour de toi

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 1.1 — Diagnostiquer une situation "avant DevOps"</span>

**Objectif** : s'entraîner à reconnaître les symptômes du mur Dev/Ops (section 1.1) dans une situation concrète, avant même d'avoir touché un outil.

**Préparation** : aucune installation nécessaire. Prends une feuille ou un fichier texte.

**Étapes détaillées** :

1. Pense à un projet que tu as déjà réalisé (scolaire, freelance, personnel) où tu as dû, un jour, faire fonctionner une application ailleurs que sur ta machine de développement (un autre ordinateur, un serveur, le poste d'un camarade).
2. Note ce qui a posé problème à ce moment-là (dépendance manquante, version différente, configuration oubliée, mot de passe non transmis...).
3. Pour chaque problème noté, identifie à quelle étape du cycle DevOps (section 1.4) une automatisation aurait pu l'éviter.
4. Si tu n'as jamais vécu cette situation, imagine celle du scénario d'ouverture de ce chapitre et fais l'exercice à partir de celle-ci.

**Résultat attendu** : une liste de 3 à 5 problèmes concrets, chacun relié à une étape du cycle (BUILD pour une dépendance manquante, DEPLOY pour une configuration oubliée, etc.). Cette liste n'est pas notée — elle sert uniquement à ancrer, avec un exemple personnel, la raison d'être de tout ce manuel.

**Dépannage** : si tu ne trouves aucun exemple personnel, pense à un logiciel que tu utilises au quotidien et qui a déjà connu une panne médiatisée ("le site est down") — cherche en une minute ce qui a probablement manqué côté automatisation ou monitoring.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre DevOps et un outil précis</span>
Comme vu en section 1.6, réduire DevOps à Docker, Kubernetes ou tout autre outil isolé est le contresens le plus fréquent chez les débutants. Un outil sert un ou plusieurs des cinq piliers (section 1.5) ; aucun outil ne constitue DevOps à lui seul.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Vouloir tout automatiser immédiatement</span>
L'automatisation est un pilier central, mais elle se construit progressivement, en commençant par les tâches les plus répétitives et les plus risquées manuellement (les tests, puis le déploiement). Vouloir un pipeline complet et une infrastructure Kubernetes dès le premier projet, avant même de maîtriser Git et Docker, mène presque toujours à l'abandon avant la fin.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Négliger la culture au profit des outils</span>
Une équipe peut posséder tous les outils de ce manuel et rester dysfonctionnelle si personne ne communique, si les incidents sont vécus comme une chasse au coupable plutôt qu'une occasion d'apprendre, ou si les développeurs se désintéressent totalement de ce qui se passe après le déploiement. Le chapitre 2 approfondit précisément ce point.
</div>

## En entreprise

Dans la pratique professionnelle, quelques constats reviennent presque systématiquement autour de ce premier chapitre :

**Réalité répandue** : très peu d'entreprises appliquent les cinq piliers de la section 1.5 à 100 % dès le départ. La plupart progressent par étapes sur plusieurs mois, voire plusieurs années : d'abord des tests automatisés, puis un pipeline CI simple, puis un déploiement automatisé, puis seulement ensuite de l'Infrastructure as Code et du monitoring avancé. Ce manuel suit délibérément cet ordre de maturité réel plutôt qu'un ordre théorique.

**Erreur classique observée** : recruter ou nommer "un DevOps" en pensant que cette seule personne va résoudre à elle seule les tensions entre développement et exploitation, sans changer les processus ni la culture d'équipe autour d'elle. Une personne seule peut construire des outils, jamais imposer une culture de collaboration à une équipe qui n'y adhère pas.

**Bonne pratique répandue** : les organisations matures mesurent leur maturité DevOps avec des indicateurs concrets plutôt qu'un ressenti — fréquence de déploiement, délai entre un commit et sa mise en production, taux d'échec des déploiements, temps moyen de rétablissement après un incident. Ces quatre indicateurs (connus sous le nom de métriques DORA) reviendront à plusieurs reprises dans ce manuel, notamment aux chapitres sur le monitoring et la performance.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment définirais-tu DevOps en une phrase, sans citer un seul outil ?"**
Réponse attendue : une culture et un ensemble de pratiques qui rapprochent développement et exploitation pour livrer du logiciel plus rapidement, plus souvent et plus fiablement, en s'appuyant sur l'automatisation et un retour continu entre la production et le développement (section 1.2). Répondre uniquement par une liste d'outils est un piège classique qui montre une compréhension superficielle.

**Q2. "Quelle est la différence entre intégration continue et déploiement continu ?"**
Réponse attendue : l'intégration continue (CI) vérifie automatiquement que chaque changement de code fonctionne (tests, build) ; le déploiement continu (CD) va plus loin en mettant automatiquement (ou presque) ce changement validé en production. Sujet détaillé en profondeur aux chapitres 19 et 20.

**Q3. "Pourquoi dit-on que DevOps est autant une question de culture que d'outils ?"**
Réponse attendue : parce que des outils seuls, sans changement de collaboration entre équipes ni partage réel de la responsabilité de la production, reproduisent le mur Dev/Ops décrit en section 1.1 sous une autre forme (section 1.6).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un point souvent absent des définitions grand public de DevOps : la sécurité doit s'intégrer <strong>dès le début</strong> du cycle (dès CODE et BUILD), pas ajoutée en dernière minute avant la mise en production. Ce principe, appelé DevSecOps, est traité en profondeur à la Partie XI — mais garde-le en tête dès ce premier chapitre, il colore silencieusement tous les suivants.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Prends dès maintenant l'habitude de te demander, pour chaque nouvel outil rencontré dans ce manuel, à quelle étape précise du cycle de la section 1.4 il correspond. Ce simple réflexe de classement rend chaque nouvel outil beaucoup plus facile à situer et à retenir, plutôt que d'accumuler une liste de noms d'outils sans structure.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le "temps entre un commit et sa mise en production réelle" (le *lead time* dans le vocabulaire DevOps) est l'un des indicateurs de performance les plus révélateurs de la maturité d'une équipe. Ce manuel te donnera, chapitre après chapitre, tous les outils pour réduire ce délai sans sacrifier la fiabilité.
</div>

## Résumé du chapitre

- DevOps répond à un problème historique concret : le mur entre développeurs (Dev) et opérationnels (Ops), qui ralentit les déploiements et rend les incidents plus longs à résoudre.
- DevOps est une culture et un ensemble de pratiques, pas un outil ni un produit qu'on achète.
- Le cycle DevOps (Plan → Code → Build → Test → Release → Deploy → Operate → Monitor → Feedback) est une boucle continue, pas une ligne droite qui s'arrête à la mise en production.
- Cinq piliers structurent DevOps : intégration continue, déploiement continu, Infrastructure as Code, monitoring/observabilité, et une culture de collaboration.
- Docker, Kubernetes, Terraform et tous les autres outils de ce manuel ne sont que des moyens au service de ces piliers, jamais une fin en soi.
- Ce manuel suit un ordre de progression réaliste : fondamentaux d'abord (Linux, Git, Docker, un premier pipeline), sujets avancés ensuite (Terraform, Kubernetes, haute disponibilité).

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. DevOps désigne avant tout :
   - a) Un logiciel à installer sur les serveurs
   - b) Une culture et un ensemble de pratiques rapprochant développement et exploitation
   - c) Un poste de travail qui remplace les développeurs
   - d) Une certification obligatoire pour déployer en production

2. Dans le cycle DevOps, l'étape FEEDBACK sert à :
   - a) Corriger uniquement les bugs de sécurité
   - b) Faire revenir ce qui a été observé en production vers la phase de planification suivante
   - c) Remplacer les tests automatisés
   - d) Générer la documentation technique

3. "DevOps = Docker" est :
   - a) Une définition exacte et suffisante
   - b) Un raccourci trompeur : Docker n'est qu'un outil au service de certains piliers DevOps
   - c) Vrai uniquement pour les grandes entreprises
   - d) Vrai uniquement pour les petites équipes

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. On peut faire du DevOps sans utiliser Docker. — **Vrai**.
2. Nommer une seule personne "ingénieur DevOps" suffit à rendre toute une équipe DevOps. — **Faux** (c'est une question de culture partagée, pas d'un poste isolé).
3. Le cycle DevOps s'arrête une fois l'application déployée en production. — **Faux** (OPERATE, MONITOR et FEEDBACK viennent après DEPLOY, et FEEDBACK relance PLAN).
4. L'intégration continue (CI) et le déploiement continu (CD) désignent exactement la même chose. — **Faux** (chapitres 19 et 20).

</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique, avec tes propres mots, pourquoi un bug détecté immédiatement coûte généralement moins cher qu'un bug découvert des semaines plus tard.
2. Un ami te dit : "DevOps, c'est juste un mot à la mode pour dire qu'on utilise Docker et Kubernetes." Que lui réponds-tu, en t'appuyant sur ce chapitre ?

**Corrigé 1** : plus le délai entre l'écriture du code et sa vérification réelle est court, moins de code s'est accumulé autour du bug entre-temps — le contexte est encore frais dans la mémoire de la personne qui l'a écrit, moins d'autres fonctionnalités en dépendent déjà, et l'impact sur des utilisateurs réels (s'il a atteint la production) est détecté et corrigé plus vite. C'est exactement la logique du "feedback continu" de la section 1.2.

**Corrigé 2** : Docker et Kubernetes sont des outils utiles à certains piliers DevOps (reproductibilité, orchestration), mais DevOps est avant tout une culture de collaboration et d'automatisation entre développement et exploitation (section 1.2). Une équipe peut utiliser Docker et Kubernetes sans jamais tester ni déployer automatiquement, sans jamais surveiller sa production, et sans jamais faire communiquer développeurs et opérationnels — dans ce cas, elle n'a pas "fait du DevOps", elle a seulement adopté deux outils.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Reprends le tableau des symptômes du mur Dev/Ops (section 1.1). Pour chacun des quatre symptômes listés, propose une pratique DevOps précise (parmi celles de la section 1.5) qui permettrait de l'éliminer.
</div>

**Corrigé :** "Ça marche sur ma machine" → Infrastructure as Code et conteneurisation (Docker), pour garantir un environnement identique partout. "Déploiements rares et redoutés" → Intégration et déploiement continus, pour rendre chaque déploiement petit, fréquent et automatisé plutôt que rare et risqué. "Résolution d'incident lente" → Monitoring et observabilité, pour donner à toute l'équipe une vision partagée et immédiate de ce qui se passe réellement. "Aucune traçabilité" → Infrastructure as Code et Git, pour que la configuration de production soit versionnée, lisible et historisée comme le code lui-même.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2</span>

En reprenant le scénario d'ouverture du chapitre (le déploiement qui prend six heures), rédige en 4 à 6 phrases un plan minimal de trois actions DevOps concrètes qui, appliquées avant ce déploiement, auraient probablement évité la panne.
</div>

**Corrigé (exemple de réponse) :** D'abord, décrire l'environnement d'exécution dans un Dockerfile versionné (chapitre 12), pour que les dépendances et versions soient identiques partout, du poste du développeur au serveur de production. Ensuite, mettre en place un pipeline d'intégration continue (chapitre 22) qui construit et teste automatiquement l'application dans cet environnement avant tout déploiement, plutôt que de découvrir les problèmes en production. Enfin, documenter les variables d'environnement nécessaires dans un fichier `.env.example` versionné (chapitre 18), pour qu'aucune configuration ne soit oubliée le jour du déploiement.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer DevOps sans citer un seul outil dans ma définition.</li>
<li>☐ Je peux décrire le "mur" historique entre Dev et Ops et ses symptômes concrets.</li>
<li>☐ Je connais les neuf étapes du cycle DevOps et je sais donner un exemple d'outil pour chacune.</li>
<li>☐ Je peux citer les cinq piliers de DevOps et expliquer brièvement chacun.</li>
<li>☐ Je sais expliquer pourquoi "DevOps = Docker" est un raccourci trompeur.</li>
<li>☐ Je sais situer, dans les grandes lignes, à quelle partie de ce manuel appartient chaque grand sujet (Git, Docker, CI/CD, Terraform, Kubernetes...).</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il être développeur pour apprendre DevOps ?</dt>
<dd>Non. Ce manuel part de zéro sur Linux, Git et les outils eux-mêmes (chapitres 4 à 10). Une notion de base de la programmation aide à comprendre certains exemples, mais n'est pas un prérequis strict.</dd>

<dt>DevOps et Cloud, c'est la même chose ?</dt>
<dd>Non. Le Cloud (Partie XII) est un ensemble de services d'infrastructure fournis par un tiers (AWS, Azure, GCP...). On peut faire du DevOps entièrement sur des serveurs qu'on gère soi-même (VPS, chapitres 26-27), et on peut utiliser le Cloud sans pratiquer DevOps.</dd>

<dt>Combien de temps faut-il pour "devenir DevOps" ?</dt>
<dd>Il n'existe pas de certification ni de seuil universel. Ce manuel est construit pour t'amener, chapitre après chapitre, à être capable de développer, tester, conteneuriser, déployer, sécuriser et surveiller une application de bout en bout — un objectif réaliste en suivant l'intégralité du manuel jusqu'au projet final (Partie XV), à ton propre rythme.</dd>

<dt>Est-ce que je dois apprendre Kubernetes dès maintenant ?</dt>
<dd>Non, et ce serait même contre-productif. Kubernetes (Partie XIII) n'a de sens qu'une fois Docker, Docker Compose et un premier déploiement VPS bien maîtrisés (Parties V à VIII). Ce manuel respecte volontairement cet ordre.</dd>
</dl>

## Références et pour aller plus loin

- Google Cloud — "What is DevOps?" (vue d'ensemble accessible) : [https://cloud.google.com/devops](https://cloud.google.com/devops)
- Atlassian — "DevOps: A guide" (comprend les métriques DORA évoquées en section "En entreprise") : [https://www.atlassian.com/devops](https://www.atlassian.com/devops)
- DORA (DevOps Research and Assessment, Google Cloud) — recherche annuelle sur les métriques de performance DevOps : [https://dora.dev](https://dora.dev)
- *The Phoenix Project*, Gene Kim, Kevin Behr, George Spafford — roman d'entreprise qui met en scène, de façon narrative, exactement le problème décrit en section 1.1.
- *The DevOps Handbook*, Gene Kim, Jez Humble, Patrick Debois, John Willis — référence de fond sur les pratiques DevOps.

*Chapitre suivant : la culture DevOps — pourquoi la collaboration, la responsabilité partagée et l'amélioration continue comptent davantage que n'importe quel outil, et comment reconnaître (ou construire) cette culture concrètement dans une équipe.*
