<div class="chapitre-titre-num">CHAPITRE 14</div>

# Choisir sa distribution serveur : Ubuntu Server, Debian, Rocky Linux, RHEL

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre les différences réelles entre les distributions Linux les plus utilisées en entreprise — pas au niveau superficiel des goûts personnels, mais au niveau des critères qui comptent vraiment : cycle de support, gestion des paquets, coût, écosystème de compatibilité. À la fin de ce chapitre, tu sauras choisir une distribution pour un projet donné en justifiant ce choix par des critères concrets, et tu comprendras pourquoi la question "quelle est la meilleure distribution ?" n'a pas de réponse universelle.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Dixième semaine. La compagnie d'assurance lance un projet de portail client en ligne (consultation de contrats, déclaration de sinistre en ligne), confié à une petite équipe de développeurs freelances. Le développeur principal te demande sur quel système d'exploitation il pourra déployer son application. Tu réalises que jusqu'ici, toute l'infrastructure de l'entreprise tourne sous Windows Server — ce projet est l'occasion d'introduire Linux. En réunion, deux avis s'affrontent : un développeur insiste pour Ubuntu Server, "parce que c'est ce que j'utilise sur mon poste personnel" ; le DSI, prudent, demande s'il ne vaut pas mieux "prendre la même chose que les grandes banques utilisent, pour être sûr que ce soit du sérieux". Aucun des deux arguments n'est complètement faux, mais aucun n'est non plus une vraie méthode de décision. Ce chapitre te donne cette méthode.
</div>

## 14.1 Pourquoi le choix de distribution n'est pas neutre

Une distribution Linux n'est pas seulement "une saveur" de Linux parmi d'autres, interchangeable sans conséquence — c'est un ensemble de décisions structurantes : quel gestionnaire de paquets utiliser, quelle fréquence de mise à jour attendre, quel niveau de support (gratuit communautaire ou payant avec garanties contractuelles) est disponible, et quelle compatibilité avec les logiciels que l'entreprise prévoit d'utiliser.

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — deux grandes familles</span>
La quasi-totalité des distributions serveur d'entreprise se rattachent à l'une de ces deux grandes familles : la famille <strong>Debian</strong> (Debian lui-même, Ubuntu), utilisant le gestionnaire de paquets <code>apt</code> et le format <code>.deb</code> ; et la famille <strong>Red Hat</strong> (RHEL, Rocky Linux, et historiquement CentOS), utilisant <code>dnf</code>/<code>yum</code> et le format <code>.rpm</code>. Ce choix de famille structure directement les commandes que tu utiliseras au quotidien (chapitre 15) — une bonne raison de le faire consciemment plutôt que par habitude personnelle.
</div>

## 14.2 Debian : la fondation, stabilité et gratuité

**Debian** est un projet communautaire, entièrement gratuit, réputé pour sa stabilité extrême et son conservatisme technique assumé : les paquets inclus dans une version stable de Debian sont volontairement figés et longuement testés, privilégiant la fiabilité à la fraîcheur des versions logicielles.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le grand-parent prudent de la famille</span>
Si les distributions Linux étaient une famille, Debian serait le grand-parent prudent : rien n'est ajouté sans une longue période de test, les changements brusques sont évités, et la stabilité prime toujours sur la nouveauté. Cette prudence a un coût (des versions de logiciels parfois moins récentes que sur d'autres distributions), mais elle explique pourquoi Debian reste un choix apprécié pour des serveurs où la fiabilité prime sur tout le reste.
</div>

## 14.3 Ubuntu Server : Debian avec un cycle clair et un support commercial

**Ubuntu Server**, développé par Canonical, est directement dérivé de Debian, mais y ajoute un cycle de publication prévisible et un support commercial optionnel. Le point le plus important à connaître : les versions **LTS** (*Long Term Support*), publiées tous les deux ans, bénéficient de cinq ans de mises à jour de sécurité gratuites (extensibles via Ubuntu Pro).

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours choisir une version LTS pour un serveur de production</span>
Les versions non-LTS d'Ubuntu (publiées tous les six mois) ont un cycle de support beaucoup plus court (neuf mois) — totalement inadapté à un serveur de production censé rester stable pendant des années. Une erreur fréquente chez les débutants est d'installer la version la plus récente disponible sans distinguer LTS et non-LTS ; en environnement serveur, une version LTS est presque toujours le bon choix par défaut.
</div>

## 14.4 RHEL : le standard entreprise, support payant et certifications

**Red Hat Enterprise Linux** (RHEL) est une distribution commerciale, avec un support payant assorti de garanties contractuelles fortes (SLA de correction de vulnérabilités, assistance technique directe de Red Hat). C'est historiquement la distribution la plus répandue dans les grandes entreprises, les administrations, et les secteurs fortement réglementés.

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — pourquoi RHEL domine dans les secteurs réglementés</span>
Certaines certifications de conformité réglementaire (dans le secteur bancaire, gouvernemental, ou de santé) exigent ou favorisent explicitement des systèmes bénéficiant d'un support commercial contractuel avec des délais garantis de correction des vulnérabilités critiques — une exigence qu'une distribution purement communautaire, sans engagement contractuel formel, ne peut pas offrir par nature. C'est la réponse concrète à l'intuition du DSI dans le scénario d'ouverture : les grandes banques utilisent effectivement souvent RHEL, mais pour une raison précise (garanties contractuelles), pas par simple prestige de marque.
</div>

## 14.5 Rocky Linux : l'héritier communautaire après la fin de CentOS

**CentOS**, longtemps la version gratuite et binairement compatible de RHEL (populaire précisément pour bénéficier de la robustesse de RHEL sans son coût), a changé de modèle en 2020 : le projet CentOS Stream est devenu une version de développement en amont de RHEL, plutôt qu'une version stable équivalente en aval — retirant de facto l'option "RHEL gratuit et stable" qui existait auparavant. **Rocky Linux**, créé par un cofondateur historique du projet CentOS, a émergé directement en réponse à ce changement, avec un objectif explicite : rester **binairement compatible avec RHEL**, gratuitement, avec un support communautaire actif.

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — l'histoire compte pour comprendre le paysage actuel</span>
Si tu rencontres encore des serveurs sous CentOS 7 ou 8 dans une infrastructure existante (une situation encore fréquente en 2026), sache qu'ils approchent ou ont déjà dépassé leur fin de support — un signal d'alerte de sécurité à traiter en priorité (section 14.8), et souvent l'occasion d'une migration vers Rocky Linux ou RHEL directement.
</div>

## 14.6 Comparatif synthétique

| Critère | Debian | Ubuntu Server (LTS) | Rocky Linux | RHEL |
|---|---|---|---|---|
| Famille / gestionnaire de paquets | Debian / `apt` | Debian / `apt` | Red Hat / `dnf` | Red Hat / `dnf` |
| Coût | Gratuit | Gratuit (support payant optionnel) | Gratuit | Payant (support et abonnement) |
| Support garanti contractuellement | Non (communautaire) | Oui, si Ubuntu Pro | Non (communautaire) | Oui |
| Fraîcheur des paquets | Conservatrice | Modérée | Conservatrice (aligné RHEL) | Conservatrice (aligné RHEL) |
| Cas d'usage typique | Serveurs où la stabilité gratuite prime | Cloud, conteneurs, projets avec support Canonical optionnel | Alternative gratuite à RHEL, secteurs sans exigence contractuelle stricte | Secteurs réglementés, grandes entreprises, support critique |

## 14.7 Comment choisir concrètement pour le scénario d'ouverture

<div class="encadre astuce">
<span class="encadre-titre">💡 Un cadre de décision en quatre questions</span>
1. <strong>Une certification ou une exigence contractuelle impose-t-elle un support commercial garanti ?</strong> Si oui → RHEL, ou une distribution avec support commercial équivalent (Ubuntu Pro).
2. <strong>L'équipe a-t-elle déjà une expertise établie sur une famille précise ?</strong> Réutiliser une expertise existante réduit le risque opérationnel plus sûrement qu'un choix "techniquement optimal" sur le papier mais inconnu de l'équipe.
3. <strong>Le logiciel à déployer a-t-il des exigences ou des recommandations officielles de compatibilité ?</strong> Certains logiciels ne sont testés et supportés officiellement que sur une distribution précise.
4. <strong>Le budget permet-il un support commercial, ou faut-il rester sur une solution gratuite ?</strong>
</div>

🏢 **Application au scénario d'ouverture.** Pour ce portail client de la compagnie d'assurance : aucune exigence réglementaire stricte n'impose RHEL à ce stade (contrairement à un système bancaire de paiement, par exemple) ; l'équipe de développeurs freelances a déjà une familiarité avec Ubuntu ; le budget d'un projet pilote ne justifie pas nécessairement un abonnement RHEL immédiat. **Ubuntu Server LTS** est donc un choix défendable et raisonnable ici — pas parce que "c'est ce que le développeur utilise sur son poste personnel" (l'argument initial insuffisant du scénario), mais parce qu'il correspond aux quatre critères du cadre de décision ci-dessus pour ce projet précis. Un futur système de paiement en ligne plus sensible mériterait de reposer ce choix depuis le début.

## 14.8 Le cycle de vie et l'importance de ne jamais tourner sur une version en fin de vie

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une distribution en fin de vie (EOL) ne reçoit plus de correctifs de sécurité</span>
Rappel direct du chapitre 3 (cycle de vie d'un actif) : chaque distribution a une date de fin de support (*End Of Life*, EOL) au-delà de laquelle plus aucun correctif de sécurité n'est publié, même pour des vulnérabilités critiques activement exploitées. Un serveur qui continue de tourner sur une version EOL (comme un ancien CentOS 8, dont le support s'est arrêté fin 2021) accumule silencieusement des vulnérabilités non corrigées — un risque de sécurité sérieux et croissant, souvent découvert seulement lors d'un audit, exactement le type de découverte redoutée évoquée au chapitre 3.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — planifier la migration avant l'échéance, pas après</span>
La date de fin de vie d'une distribution est connue des années à l'avance, publiée officiellement — une migration planifiée bien avant l'échéance (dans le cadre d'un changement normal, chapitre 2) coûte beaucoup moins cher en temps et en risque qu'une migration précipitée réalisée dans l'urgence après avoir découvert, lors d'un audit, qu'un serveur critique tourne depuis des mois sans aucun correctif de sécurité disponible.
</div>

## Atelier — Choisir une distribution pour trois scénarios

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 14 — Appliquer le cadre de décision</span>

**Objectif** : s'entraîner à appliquer le cadre de décision en quatre questions (section 14.7) à des contextes variés, plutôt que de répondre par préférence personnelle.

**Préparation** : aucune installation nécessaire.

**Étapes détaillées** :

1. Pour chacun des trois scénarios suivants, recommande une distribution et justifie ton choix à partir du cadre de décision :
   - a) Une banque doit héberger un système de paiement soumis à une certification de sécurité stricte exigeant un support commercial contractuel.
   - b) Une association à but non lucratif, sans budget pour du support commercial, souhaite héberger un site web associatif simple.
   - c) Une startup technologique dont toute l'équipe a une solide expertise Red Hat/CentOS depuis des années, sans contrainte budgétaire particulière, souhaite héberger ses serveurs applicatifs.
2. Compare tes réponses à la section "Résultat attendu".

**Résultat attendu** :
- a) **RHEL** — l'exigence de support commercial contractuel avec garanties formelles rend ce choix quasiment obligatoire, indépendamment du coût.
- b) **Debian** ou **Rocky Linux** — gratuit, stable, sans besoin de support commercial payant pour un site associatif simple à faible criticité.
- c) **RHEL** ou **Rocky Linux** — l'expertise existante de l'équipe sur la famille Red Hat pèse lourdement dans ce choix (critère 2 du cadre de décision), le budget disponible permettant même d'envisager RHEL pour bénéficier du support commercial si la criticité des serveurs applicatifs le justifie.

**Dépannage** : si ta réponse repose uniquement sur "c'est ce que je connais" ou "c'est le plus populaire", reviens au cadre de décision en quatre questions et identifie explicitement lequel de ces critères motive réellement ton choix pour ce scénario précis.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — choisir une distribution par préférence personnelle plutôt que par les besoins du projet</span>
Exactement l'argument initial insuffisant du développeur dans le scénario d'ouverture. Une préférence personnelle est un critère parmi d'autres (elle rejoint le critère 2 du cadre de décision, l'expertise de l'équipe), mais jamais le seul critère valable pour un choix d'infrastructure de production.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — mélanger les familles de distribution sans raison justifiée</span>
Faire cohabiter, sans réflexion, des serveurs Debian/Ubuntu et des serveurs RHEL/Rocky dans la même infrastructure multiplie la charge cognitive de l'équipe (deux gestionnaires de paquets, deux façons de gérer les mises à jour à maîtriser) sans bénéfice clair — un choix parfois justifié (contrainte logicielle précise sur une machine isolée), mais jamais un défaut par accident.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — ignorer les dates de fin de vie au moment du choix initial</span>
Choisir une version qui approche déjà sa fin de vie au moment du déploiement initial condamne le projet à une migration prématurée peu après sa mise en production — une vérification simple (section 14.8) à faire systématiquement avant tout déploiement, jamais après coup.
</div>

## Diagnostiquer une distribution non documentée

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Je dois administrer un serveur Linux existant, sans savoir quelle distribution ni quelle version il fait tourner"</span>

- **Diagnostic** : une situation fréquente sur une infrastructure héritée mal documentée (chapitre 3) — un audit rapide résout ce doute en quelques secondes.
- **Comment vérifier** : la commande `cat /etc/os-release` (approfondie au chapitre 15) affiche le nom exact et la version de la distribution sur la quasi-totalité des systèmes Linux modernes, indépendamment de la famille.
- **Résolution** : une fois la distribution et la version identifiées, vérifie immédiatement sa date de fin de vie officielle (section 14.8) — une étape à ne jamais sauter lors de la prise en charge d'un serveur hérité inconnu, exactement le réflexe attendu d'un audit d'inventaire (chapitre 3).
</div>

## En entreprise

- **Bonne pratique répandue** : documenter, pour chaque serveur (dans la CMDB du chapitre 3), la distribution, la version et la date de fin de vie prévue — permettant une revue périodique simple plutôt qu'une découverte tardive et stressante.
- **Bonne pratique répandue** : standardiser autant que possible sur une seule famille de distribution à l'échelle de l'organisation, sauf contrainte technique précise justifiant une exception documentée.
- **Erreur classique observée** : une infrastructure hétérogène accumulée au fil des années, chaque nouveau projet ayant choisi sa distribution selon la préférence du moment, sans cohérence ni documentation du raisonnement — rendant la maintenance globale nettement plus coûteuse qu'elle ne devrait l'être.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence fondamentale entre Ubuntu Server et RHEL ?"**
Réponse attendue : elles appartiennent à deux familles différentes (Debian/`apt` pour Ubuntu, Red Hat/`dnf` pour RHEL), avec des modèles économiques distincts (Ubuntu gratuit avec support commercial optionnel, RHEL payant avec support contractuel inclus) — le choix dépend du contexte (budget, exigences de support, expertise de l'équipe), pas d'une supériorité technique absolue de l'une sur l'autre.

**Q2. "Que s'est-il passé avec CentOS, et pourquoi Rocky Linux existe-t-il ?"**
Réponse attendue : CentOS Stream a remplacé CentOS classique en 2020, devenant une version de développement en amont de RHEL plutôt qu'une version stable équivalente gratuite en aval. Rocky Linux a été créé pour combler ce vide, en visant une compatibilité binaire totale avec RHEL, gratuitement et avec un support communautaire actif.

**Q3. "Comment choisirais-tu une distribution pour un nouveau projet, en pratique ?"**
Réponse attendue : en appliquant un cadre de décision structuré (exigences de support contractuel, expertise existante de l'équipe, contraintes de compatibilité logicielle, budget disponible) plutôt qu'une préférence personnelle — exactement le cadre en quatre questions de la section 14.7.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Vérifie systématiquement la date de fin de vie d'une distribution avant tout déploiement de production, et intègre cette date dans un calendrier de suivi (au même titre que le cycle de vie d'un actif, chapitre 3) — une migration planifiée des mois à l'avance coûte toujours moins cher qu'une correction en urgence après découverte d'un système non supporté.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente explicitement, pour chaque nouveau projet, la justification du choix de distribution (chapitre 3) — une décision d'architecture non documentée devient une question sans réponse claire des années plus tard, quand la personne qui a fait ce choix a changé de poste.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Une standardisation raisonnable sur une seule famille de distribution à l'échelle de l'organisation réduit la charge cognitive de l'équipe et accélère la formation de nouveaux arrivants, qui n'ont besoin de maîtriser qu'un seul écosystème d'outils plutôt que plusieurs en parallèle.
</div>

## Résumé du chapitre

- Les distributions Linux serveur se répartissent principalement en deux familles : Debian (Debian, Ubuntu) et Red Hat (RHEL, Rocky Linux).
- Debian privilégie la stabilité gratuite ; Ubuntu Server LTS ajoute un cycle prévisible et un support commercial optionnel.
- RHEL offre un support commercial contractuel fort, particulièrement adapté aux secteurs réglementés ; Rocky Linux en est l'alternative gratuite et communautaire depuis la fin de CentOS classique en 2020.
- Le choix d'une distribution doit s'appuyer sur des critères concrets (exigences de support, expertise de l'équipe, compatibilité logicielle, budget), jamais sur la seule préférence personnelle.
- Une distribution en fin de vie (EOL) ne reçoit plus de correctifs de sécurité — un risque à anticiper largement à l'avance, jamais à découvrir tardivement lors d'un audit.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Ubuntu Server et Debian appartiennent à la même famille, utilisant le gestionnaire de paquets :
   - a) `dnf`
   - b) `apt`
   - c) `yum`
   - d) `rpm` seul, sans gestionnaire de dépendances

2. Rocky Linux a été créé en réponse à :
   - a) La fin de vie de Debian
   - b) Le changement de modèle de CentOS en 2020 (passage à CentOS Stream)
   - c) Le rachat de Red Hat par IBM
   - d) L'arrêt du support d'Ubuntu Server

3. Une distribution en fin de vie (EOL) présente principalement le risque de :
   - a) Ne plus recevoir de correctifs de sécurité
   - b) Ne plus pouvoir démarrer du tout
   - c) Perdre automatiquement toutes ses données
   - d) Ne plus supporter le réseau

**Corrigé** : 1-b, 2-b, 3-a.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. RHEL est toujours objectivement "meilleur" techniquement que Debian ou Ubuntu Server. — **Faux** (le meilleur choix dépend du contexte, pas d'une supériorité technique absolue).
2. Rocky Linux vise une compatibilité binaire totale avec RHEL. — **Vrai**.
3. Les versions non-LTS d'Ubuntu Server conviennent parfaitement à un serveur de production à long terme. — **Faux** (leur support de neuf mois est inadapté, une version LTS est recommandée).
4. Il est possible de connaître la distribution et la version exactes d'un serveur Linux via `cat /etc/os-release`. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi l'argument "c'est ce que j'utilise sur mon poste personnel" est insuffisant, à lui seul, pour justifier le choix d'une distribution serveur en production.
2. Reprends le scénario d'ouverture. Explique pourquoi l'intuition du DSI ("prendre la même chose que les grandes banques") n'est ni complètement fausse ni une méthode de décision suffisante en elle-même.

**Corrigé 1** : la familiarité personnelle est un critère légitime (elle rejoint le critère d'expertise de l'équipe du cadre de décision), mais elle ne prend en compte ni les exigences de support contractuel éventuelles, ni les contraintes de compatibilité logicielle, ni le budget disponible — des facteurs tout aussi déterminants pour un choix de production durable, pas seulement pour un poste de travail personnel.

**Corrigé 2** : les grandes banques choisissent effectivement souvent RHEL, mais pour une raison précise et vérifiable — les exigences de certification et de support contractuel garanti de leur secteur (section 14.4) — pas par simple réputation ou prestige de marque. L'intuition du DSI est donc fondée sur une observation réelle, mais devient une vraie méthode de décision seulement une fois reliée explicitement au cadre de décision en quatre questions (section 14.7), qui permet de vérifier si ces mêmes raisons s'appliquent réellement au projet en question.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Un serveur hérité tourne sous CentOS 8, dont le support standard s'est arrêté fin 2021. Explique les risques concrets de continuer à l'utiliser tel quel en 2026, et propose une action à recommander à la direction.
</div>

**Corrigé :** Ce serveur n'a reçu aucun correctif de sécurité depuis plusieurs années — toute vulnérabilité découverte depuis dans les composants du système reste non corrigée et potentiellement exploitable, un risque de sécurité sérieux et croissant avec le temps (section 14.8). Je recommanderais une migration planifiée, dans le cadre d'un changement normal documenté (chapitre 2), vers Rocky Linux (alternative gratuite la plus proche techniquement) ou RHEL si un support commercial est envisageable, plutôt que de continuer à reporter cette migration ou d'attendre un incident de sécurité pour agir dans l'urgence.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.2</span>

Rédige, en 3 à 5 phrases, comment tu justifierais par écrit (pour la documentation du chapitre 3) le choix d'Ubuntu Server LTS pour le portail client du scénario d'ouverture, en t'appuyant sur le cadre de décision de la section 14.7.
</div>

**Corrigé (exemple de réponse) :** Ubuntu Server LTS a été choisi pour le portail client car aucune exigence réglementaire stricte n'impose à ce stade un support commercial contractuel garanti, contrairement à un système de paiement plus sensible. L'équipe de développement freelance dispose déjà d'une expertise établie sur cette distribution, réduisant le risque opérationnel du projet. Le budget du projet pilote ne justifiait pas un abonnement RHEL immédiat, tout en conservant la possibilité d'ajouter un support commercial via Ubuntu Pro plus tard si la criticité du service augmente. Cette décision sera à réévaluer si le portail évolue vers des fonctionnalités de paiement en ligne nécessitant des certifications de sécurité plus strictes.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais distinguer les familles Debian et Red Hat, et leurs gestionnaires de paquets respectifs.</li>
<li>☐ Je comprends les différences entre Debian, Ubuntu Server, Rocky Linux et RHEL.</li>
<li>☐ Je connais l'histoire du changement de modèle de CentOS et la naissance de Rocky Linux.</li>
<li>☐ Je sais appliquer un cadre de décision structuré pour choisir une distribution, plutôt qu'une préférence personnelle.</li>
<li>☐ Je comprends le risque d'une distribution en fin de vie (EOL) et l'importance d'anticiper une migration.</li>
<li>☐ Je sais identifier la distribution et la version d'un serveur Linux existant via `cat /etc/os-release`.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on changer de distribution facilement après un premier déploiement ?</dt>
<dd>Non, c'est rarement trivial — une migration de distribution implique généralement une réinstallation complète et une revalidation de toutes les applications concernées, plutôt qu'une simple mise à jour. C'est précisément pourquoi le choix initial mérite la réflexion structurée de ce chapitre, plutôt qu'une décision prise à la légère en espérant pouvoir "changer plus tard facilement".</dd>

<dt>Fedora est-elle adaptée à un usage serveur de production ?</dt>
<dd>Non, Fedora est un projet communautaire à cycle de vie très court (environ 13 mois), pensé comme terrain d'expérimentation des futures fonctionnalités de RHEL — utile pour découvrir de nouvelles technologies, mais inadapté à un serveur de production nécessitant une stabilité durable, contrairement à RHEL ou Rocky Linux qui en dérivent après stabilisation.</dd>

<dt>Le choix de distribution affecte-t-il les compétences à acquérir dans la suite de ce manuel ?</dt>
<dd>Les concepts fondamentaux couverts dans les prochains chapitres de cette partie (systemd, LVM, permissions, scripting) s'appliquent de façon quasiment identique à toutes les distributions Linux modernes — seule la gestion des paquets (chapitre 15) diffère significativement entre les deux familles.</dd>

<dt>Ubuntu Pro est-il nécessaire pour un usage professionnel sérieux ?</dt>
<dd>Non, pas systématiquement — Ubuntu Server LTS reste pleinement utilisable et à jour en sécurité gratuitement pendant cinq ans sans Ubuntu Pro. Ubuntu Pro devient intéressant pour un support étendu au-delà de cette période, ou pour des garanties contractuelles spécifiques exigées par certains contextes réglementaires.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Debian : [https://www.debian.org/doc/](https://www.debian.org/doc/)
- Documentation officielle Ubuntu Server : [https://ubuntu.com/server/docs](https://ubuntu.com/server/docs)
- Documentation officielle Rocky Linux : [https://docs.rockylinux.org/](https://docs.rockylinux.org/)
- Red Hat — Documentation et cycle de vie de RHEL : [https://access.redhat.com/support/policy/updates/errata](https://access.redhat.com/support/policy/updates/errata)
- Ubuntu — Calendrier des versions et fins de support : [https://ubuntu.com/about/release-cycle](https://ubuntu.com/about/release-cycle)

*Chapitre suivant : gestion des paquets et dépôts — comment installer, mettre à jour et retirer des logiciels sur Debian/Ubuntu (`apt`) et sur Rocky Linux/RHEL (`dnf`), la première compétence pratique concrète de cette nouvelle partie.*
