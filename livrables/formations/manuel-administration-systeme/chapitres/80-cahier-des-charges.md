<div class="chapitre-titre-num">CHAPITRE 80</div>

# Cahier des charges : entreprise de 300 employés, multi-sites

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Ouvrir la Partie 13 de ce manuel — le projet final — en formalisant un cahier des charges complet pour l'infrastructure de l'entreprise du fil rouge, désormais en pleine croissance. À la fin de ce chapitre, tu sauras structurer un cahier des charges d'infrastructure IT distinguant exigences fonctionnelles, exigences non-fonctionnelles et contraintes, et tu disposeras du document de référence qui guidera les six chapitres suivants de ce manuel, chacun réalisant une partie concrète de ce projet.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Trois ans après les premiers chapitres de ce manuel, l'entreprise d'assurance a connu une croissance soutenue : elle compte désormais 300 employés répartis sur trois sites (le siège de Port-au-Prince, l'agence de Cap-Haïtien, et le bureau satellite ouvert au chapitre 67), avec un projet d'ouverture d'un quatrième site pour l'année suivante. Le conseil d'administration mandate la DSI pour produire un cahier des charges complet, formalisant l'ensemble de l'infrastructure — existante et à construire — avant d'engager les investissements nécessaires à cette nouvelle phase de croissance. <em>"On ne peut plus se permettre de construire au fur et à mesure comme on l'a fait jusqu'ici,"</em> résume le DSI. <em>"Il nous faut un document de référence complet."</em>
</div>

## 80.1 Le problème : formaliser ce qui s'est construit au fil du temps

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la synthèse de tout ce manuel</span>
Rappel du chapitre 2 : la documentation constitue la fondation du métier d'administrateur système. Un cahier des charges d'infrastructure applique ce même principe à l'échelle d'un projet complet — il formalise, avant tout investissement significatif, ce que l'infrastructure doit accomplir, dans quelles conditions, et selon quels critères de réussite mesurables, plutôt que de laisser chaque décision se prendre isolément au fil des besoins, comme cela a été le cas jusqu'ici dans le récit de ce manuel.
</div>

## 80.2 Qu'est-ce qu'un cahier des charges d'infrastructure IT

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un cahier des charges d'infrastructure structure généralement trois catégories d'information distinctes : les **exigences fonctionnelles** (ce que l'infrastructure doit permettre de faire), les **exigences non-fonctionnelles** (les qualités attendues — disponibilité, performance, sécurité), et les **contraintes** (budget, délai, compétences disponibles). Cette distinction en trois catégories évite qu'un cahier des charges ne se limite à une simple liste de technologies souhaitées, sans lien explicite avec le besoin réel qu'elles sont censées satisfaire.
</div>

## 80.3 Contexte de l'entreprise : une croissance qui mobilise l'ensemble du manuel

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel de l'ensemble du fil rouge</span>
L'entreprise emploie désormais 300 personnes réparties sur trois sites actuels et un quatrième prévu, avec un système d'information combinant Active Directory hybride (chapitres 5-8), un réseau redondant multi-sites (chapitres 65-70), une infrastructure partiellement virtualisée et partiellement conteneurisée (Parties 6-7), une présence cloud pour le portail client (Partie 8), une automatisation Infrastructure as Code (Partie 9), une supervision complète (Partie 10) et une gouvernance de sécurité structurée (Partie 12) — l'ensemble des briques déjà construites tout au long de ce manuel, désormais formalisées dans un document unique avant la prochaine phase d'expansion.
</div>

## 80.4 Exigences fonctionnelles : ce que l'infrastructure doit permettre

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Les exigences fonctionnelles du projet incluent, entre autres : une gestion centralisée des identités pour 300 employés répartis sur quatre sites (rappel des chapitres 5-8 et 22-26) ; un accès sécurisé et performant au portail client, disponible depuis l'extérieur (rappel des Parties 7-8) ; une capacité de déploiement automatisé et reproductible de nouveaux services (rappel de la Partie 9) ; une supervision centralisée de l'ensemble de l'infrastructure, quel que soit le site d'origine (rappel de la Partie 10). Chaque exigence fonctionnelle devrait être formulée en termes de besoin métier, pas de solution technique prédéterminée — la solution technique se décidera au chapitre 81.
</div>

## 80.5 Exigences non-fonctionnelles : les qualités attendues

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct des chapitres 31-32 et 72</span>
Les exigences non-fonctionnelles précisent les qualités attendues de l'infrastructure, indépendamment de ses fonctionnalités précises — une disponibilité cible pour les services critiques (rappel du plan de continuité, chapitre 32), un temps de reprise maximal en cas d'incident majeur (rappel du plan de reprise d'activité, chapitre 31), une conformité aux référentiels de sécurité déjà adoptés (rappel du NIST CSF et d'ISO 27001, chapitres 71-72). Ces exigences, souvent plus difficiles à formuler que les exigences fonctionnelles, sont pourtant tout aussi déterminantes pour la réussite du projet.
</div>

## 80.6 Contraintes : budget, délai, compétences disponibles

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du même arbitrage pragmatique rencontré à plusieurs reprises</span>
Les contraintes du projet — un budget défini, un délai de mise en œuvre réaliste, les compétences réellement disponibles au sein de l'équipe — orientent directement les choix techniques qui seront faits au chapitre suivant, exactement le même raisonnement pragmatique déjà appliqué au choix d'Ubuntu Server (chapitre 14), de Zabbix (chapitre 59), ou de Mikrotik pour le bureau satellite (chapitre 67) : le meilleur choix technique reste celui qui correspond au contexte réel de contraintes de l'organisation, pas celui qui maximiserait une sophistication technique sans considération de ce contexte.
</div>

## 80.7 Critères de réussite et livrables attendus

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la structure des six chapitres suivants</span>
Le cahier des charges se conclut par des critères de réussite mesurables et une liste de livrables attendus, correspondant directement à la structure des six chapitres restants de ce manuel : la conception de l'architecture (chapitre 81), le déploiement des services (chapitre 82), la conteneurisation et le CI/CD (chapitre 83), le composant cloud hybride (chapitre 84), la supervision et la sécurisation de bout en bout (chapitre 85), et la documentation finale accompagnée des plans de continuité (chapitre 86) — chaque chapitre suivant réalisant concrètement une partie de ce cahier des charges.
</div>

## Atelier — Rédiger le cahier des charges complet du projet

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 80 — Le document de référence pour toute la Partie 13</span>

**Objectif** : rédiger un cahier des charges structuré pour l'infrastructure de l'entreprise du fil rouge, servant de référence aux six chapitres suivants.

**Préparation** : une relecture rapide des Parties 1 à 12 de ce manuel, pour identifier les briques déjà construites et pertinentes au contexte de l'entreprise à 300 employés.

**Étapes détaillées** :

1. Rédige au moins cinq exigences fonctionnelles, formulées en termes de besoin métier plutôt que de solution technique.
2. Rédige au moins trois exigences non-fonctionnelles mesurables (par exemple, une disponibilité cible exprimée en pourcentage, un temps de reprise maximal en heures).
3. Identifie les contraintes réalistes du projet (budget, délai, compétences).
4. Définis des critères de réussite mesurables pour au moins deux des six livrables attendus.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : les exigences fonctionnelles couvrent typiquement la gestion des identités, l'accès au portail client, l'automatisation du déploiement et la supervision centralisée, chacune formulée sans présupposer la solution technique — par exemple "permettre à un nouvel employé d'accéder à l'ensemble des ressources nécessaires en moins d'une journée ouvrée" plutôt que "déployer Active Directory". Les exigences non-fonctionnelles pourraient inclure une disponibilité de 99,5 % pour le portail client, un temps de reprise maximal de quatre heures pour les services critiques, et une conformité maintenue au NIST CSF déjà adopté. Les contraintes réalistes tiennent compte du fait que l'équipe technique reste de taille modeste malgré la croissance de l'entreprise, orientant naturellement vers des choix pragmatiques déjà éprouvés dans ce manuel plutôt que vers une sophistication technique disproportionnée par rapport aux ressources humaines réellement disponibles.

**Dépannage** : si une exigence rédigée s'avère en réalité une solution technique déguisée (par exemple "installer Kubernetes" plutôt qu'un besoin métier), reformule-la en remontant à la question "pourquoi ce besoin existe-t-il réellement" — un cahier des charges qui présuppose déjà la solution technique limite inutilement les options d'architecture qui seront explorées au chapitre 81.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — des exigences formulées comme des solutions techniques plutôt que des besoins métier</span>
Rappel de l'atelier : un cahier des charges qui présuppose déjà la solution technique limite inutilement l'espace des choix d'architecture possibles.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — des exigences non-fonctionnelles absentes ou non mesurables</span>
Rappel de la section 80.5 : une exigence de disponibilité "élevée", sans pourcentage précis, ne permet pas de vérifier objectivement si elle est réellement satisfaite une fois le projet réalisé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des contraintes budgétaires ou humaines irréalistes, ignorant le contexte réel de l'organisation</span>
Rappel de la section 80.6 : un cahier des charges ambitieux mais déconnecté des ressources réellement disponibles conduit typiquement à un projet qui échoue ou dérape significativement, plutôt qu'à une réalisation réussie.
</div>

## Diagnostiquer un projet qui dérape faute de cahier des charges suffisant

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un projet d'infrastructure dérape en délai ou en budget, ou livre un résultat ne répondant pas aux attentes réelles</span>

- **Diagnostic** : vérifier si le cahier des charges initial définissait des exigences suffisamment précises et mesurables, ou s'il restait vague sur des points devenus sources de désaccord ou de malentendu en cours de projet.
- **Comment vérifier** : comparer le résultat livré aux critères de réussite explicitement définis dans le cahier des charges initial — l'absence de critères mesurables rend cette comparaison elle-même impossible, un signe révélateur du problème initial.
- **Résolution** : pour un projet en cours, clarifier explicitement les critères de réussite restants avec l'ensemble des parties prenantes ; pour un futur projet, investir davantage de temps dans la phase de cahier des charges avant tout engagement technique.
</div>

## En entreprise

- **Bonne pratique répandue** : faire valider le cahier des charges par l'ensemble des parties prenantes concernées (direction, équipe technique, utilisateurs clés) avant tout engagement de ressources significatif, évitant les malentendus découverts tardivement en cours de projet.
- **Bonne pratique répandue** : conserver le cahier des charges comme document de référence vivant tout au long du projet, y compris pour arbitrer les décisions difficiles rencontrées durant la mise en œuvre.
- **Erreur classique observée** : un cahier des charges rédigé rapidement pour satisfaire une exigence administrative, puis jamais réellement consulté durant la réalisation du projet — perdant toute sa valeur de document de référence et de critère d'arbitrage.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre une exigence fonctionnelle et une exigence non-fonctionnelle dans un cahier des charges d'infrastructure ?"**
Réponse attendue : une exigence fonctionnelle décrit ce que l'infrastructure doit permettre de faire ; une exigence non-fonctionnelle décrit une qualité attendue indépendamment des fonctionnalités précises, comme la disponibilité, la performance ou la sécurité.

**Q2. "Pourquoi une exigence formulée comme une solution technique plutôt qu'un besoin métier pose-t-elle problème dans un cahier des charges ?"**
Réponse attendue : elle présuppose déjà la solution avant même d'avoir exploré les options d'architecture possibles, limitant inutilement l'espace des choix qui pourraient mieux répondre au besoin réel dans le contexte spécifique du projet.

**Q3. "Pourquoi les contraintes (budget, délai, compétences) doivent-elles être prises en compte dès la rédaction du cahier des charges, plutôt qu'après le choix de l'architecture ?"**
Réponse attendue : une architecture conçue sans tenir compte des contraintes réelles risque d'être irréaliste à mettre en œuvre, nécessitant une révision coûteuse en temps ; intégrer les contraintes dès le départ oriente directement vers des choix réalistes et proportionnés au contexte de l'organisation.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Intègre les exigences de sécurité et de conformité (NIST CSF, ISO 27001) directement dans le cahier des charges initial, plutôt que de les considérer comme une couche ajoutée après coup à une architecture déjà figée.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Formule chaque exigence de façon suffisamment précise et mesurable pour permettre une vérification objective de sa satisfaction une fois le projet réalisé, évitant les désaccords d'interprétation ultérieurs.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un cahier des charges suffisamment détaillé dès le départ réduit significativement le risque de reprises coûteuses en cours de projet, comparé à une approche où l'architecture se précise progressivement sans cadre de référence initial.
</div>

## Résumé du chapitre

- Un cahier des charges d'infrastructure formalise, avant tout investissement significatif, ce que l'infrastructure doit accomplir et selon quels critères de réussite mesurables.
- Trois catégories structurent généralement un cahier des charges : exigences fonctionnelles, exigences non-fonctionnelles, et contraintes.
- Les exigences fonctionnelles devraient être formulées en termes de besoin métier, pas de solution technique prédéterminée.
- Les exigences non-fonctionnelles (disponibilité, performance, sécurité) sont souvent plus difficiles à formuler mais tout aussi déterminantes que les exigences fonctionnelles.
- Les contraintes réelles de l'organisation orientent directement les choix techniques qui seront faits dans les chapitres suivants.
- Les critères de réussite et les livrables attendus correspondent directement à la structure des six chapitres restants de ce manuel.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Une exigence fonctionnelle dans un cahier des charges d'infrastructure décrit :
   - a) La qualité attendue de disponibilité du système
   - b) Ce que l'infrastructure doit permettre de faire
   - c) Le budget alloué au projet
   - d) Les compétences de l'équipe technique

2. Formuler une exigence comme "installer Kubernetes" plutôt que "permettre un déploiement automatisé et reproductible" pose problème car :
   - a) Kubernetes n'a jamais été présenté dans ce manuel
   - b) Cela présuppose déjà la solution technique avant d'explorer les options d'architecture
   - c) Cela rend l'exigence plus précise et donc préférable
   - d) Aucun problème réel n'existe avec cette formulation

3. Les contraintes d'un projet (budget, délai, compétences) devraient être :
   - a) Ignorées jusqu'au choix de l'architecture
   - b) Prises en compte dès la rédaction du cahier des charges
   - c) Définies uniquement après la mise en production
   - d) Réservées exclusivement à la direction financière

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une exigence non-fonctionnelle comme "haute disponibilité", sans précision chiffrée, permet une vérification objective de sa satisfaction. — **Faux** (section "Erreur n°2").
2. Un cahier des charges devrait idéalement rester un document de référence consulté tout au long du projet. — **Vrai** (section "En entreprise").
3. Les exigences de sécurité et de conformité devraient être ajoutées après la conception de l'architecture, plutôt qu'intégrées dès le cahier des charges. — **Faux** (section "Sécurité").
4. Un cahier des charges déconnecté des contraintes réelles de l'organisation conduit généralement à un projet réussi sans difficulté particulière. — **Faux** (section "Erreur n°3").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le DSI, dans le scénario d'ouverture, juge insuffisant de continuer à "construire au fur et à mesure" comme cela a été fait tout au long de ce manuel, malgré le succès apparent de cette approche jusqu'ici.
2. Un collègue propose de rédiger le cahier des charges en listant directement les technologies déjà utilisées dans ce manuel (Active Directory, Kubernetes, Terraform), plutôt que de formuler des besoins métier. Discute les limites de cette approche pour le projet à 300 employés.

**Corrigé 1** : l'approche "au fur et à mesure" suivie tout au long de ce manuel fonctionnait bien pour une entreprise en croissance progressive, chaque décision technique répondant à un besoin ponctuel identifiable au moment où il se présentait. À l'échelle de 300 employés et quatre sites, la coordination de multiples décisions simultanées et interdépendantes (architecture réseau, identité, cloud, sécurité) devient significativement plus complexe sans vision d'ensemble préalable — le risque de décisions incohérentes entre elles, ou de investissements redondants, augmente avec l'échelle du projet. Un cahier des charges formalisé permet de coordonner cette complexité accrue avant l'engagement des ressources, plutôt que de découvrir des incohérences après coup, à un stade où leur correction serait bien plus coûteuse.

**Corrigé 2** : cette approche reproduit exactement l'erreur déjà dénoncée à la section "Erreur n°1" — présupposer la solution technique avant même d'avoir formulé le besoin réel qu'elle est censée satisfaire. Bien que ces technologies aient effectivement bien servi l'entreprise jusqu'ici, le contexte à 300 employés et quatre sites pourrait révéler des besoins différents, ou justifier des choix d'architecture différents une fois formulés en termes de besoin métier plutôt que de solution prédéterminée (une question directement explorée au chapitre 81). Un cahier des charges qui se contente de lister les technologies déjà connues risque de reconduire des choix par habitude plutôt que par adéquation réellement démontrée au nouveau contexte, un risque que la formulation en besoins métier, suivie d'une phase de conception d'architecture distincte, permet précisément d'éviter.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 80.1</span>

Rédige trois exigences non-fonctionnelles mesurables pour le projet de l'entreprise à 300 employés, portant respectivement sur la disponibilité, la sécurité, et la performance.
</div>

**Corrigé (exemple de réponse) :** Disponibilité : "le portail client devra maintenir une disponibilité mensuelle d'au moins 99,5 %, avec un temps de reprise maximal de quatre heures en cas d'incident majeur affectant le site principal." Sécurité : "l'infrastructure devra maintenir sa conformité aux fonctions du NIST CSF déjà adoptées, avec une révision du profil de maturité au moins annuelle, et aucune vulnérabilité critique non corrigée au-delà du délai cible défini au chapitre 78." Performance : "le temps de réponse moyen du portail client ne devra pas dépasser deux secondes pour 95 % des requêtes, mesuré en continu via la supervision Prometheus déjà en place (chapitre 60)." Chacune de ces exigences est formulée de façon suffisamment précise et chiffrée pour permettre une vérification objective de sa satisfaction, contrairement à une formulation vague comme "sécurisé" ou "performant" sans critère mesurable associé.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 80.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant que le cahier des charges rédigé dans ce chapitre reste un document de référence activement consulté tout au long des six chapitres suivants de ce manuel, plutôt qu'un document figé et oublié.
</div>

**Corrigé (exemple de réponse) :** Le cahier des charges rédigé dans ce chapitre sera explicitement référencé au début de chacun des six chapitres suivants de la Partie 13, chaque chapitre rappelant précisément quelles exigences fonctionnelles, non-fonctionnelles ou contraintes il met en œuvre concrètement. Toute décision technique prise durant les chapitres 81 à 86 qui s'écarterait d'une exigence du cahier des charges devra être explicitement justifiée, plutôt que silencieusement ignorée. À la clôture du projet (chapitre 86), chaque critère de réussite défini dans ce chapitre sera vérifié explicitement, confirmant ou infirmant sa satisfaction réelle plutôt que de présumer que le projet, dans son ensemble, a nécessairement répondu à l'intégralité du cahier des charges initial.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi un cahier des charges devient nécessaire à mesure qu'un projet d'infrastructure gagne en complexité.</li>
<li>☐ Je sais distinguer exigences fonctionnelles, exigences non-fonctionnelles et contraintes.</li>
<li>☐ Je sais formuler une exigence en termes de besoin métier plutôt que de solution technique prédéterminée.</li>
<li>☐ Je sais rédiger des exigences non-fonctionnelles mesurables et vérifiables.</li>
<li>☐ Je comprends pourquoi les contraintes réelles de l'organisation doivent être intégrées dès la rédaction du cahier des charges.</li>
<li>☐ Je dispose d'un cahier des charges complet servant de référence aux six chapitres suivants de ce manuel.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Un cahier des charges doit-il rester figé une fois rédigé, ou peut-il évoluer durant le projet ?</dt>
<dd>Un cahier des charges peut évoluer face à des contraintes découvertes en cours de projet, mais toute évolution devrait être documentée explicitement et validée par les parties prenantes concernées, plutôt que modifiée silencieusement sans trace ni justification.</dd>

<dt>Faut-il rédiger un cahier des charges même pour un projet d'infrastructure de petite envergure ?</dt>
<dd>Le niveau de formalisme peut être adapté à l'ampleur réelle du projet, mais les principes fondamentaux (distinguer besoin métier et solution technique, définir des critères mesurables) restent pertinents même pour un projet modeste, réduisant le risque de malentendu quelle que soit l'échelle.</dd>

<dt>Qui devrait être impliqué dans la rédaction d'un cahier des charges d'infrastructure ?</dt>
<dd>Idéalement, l'ensemble des parties prenantes concernées — direction (pour les contraintes budgétaires et les priorités stratégiques), équipe technique (pour l'évaluation de faisabilité), et utilisateurs clés (pour la validation des besoins fonctionnels réels) — plutôt qu'une rédaction isolée par une seule personne sans consultation.</dd>

<dt>Ce cahier des charges sera-t-il repris intégralement dans les chapitres suivants ?</dt>
<dd>Oui, chacun des six chapitres restants de cette partie (81 à 86) s'appuiera explicitement sur les exigences, contraintes et critères de réussite définis dans ce chapitre, réalisant progressivement chaque aspect du projet formalisé ici.</dd>
</dl>

## Références et pour aller plus loin

- PMI — A Guide to the Project Management Body of Knowledge (PMBOK Guide) : [https://www.pmi.org/pmbok-guide-standards](https://www.pmi.org/pmbok-guide-standards)
- ITIL — Gestion des exigences et de la demande : rappel du chapitre 2 de ce manuel.

*Chapitre suivant : la conception de l'architecture — traduire ce cahier des charges en choix techniques concrets d'Active Directory, de réseau et de virtualisation pour l'infrastructure à 300 employés.*
