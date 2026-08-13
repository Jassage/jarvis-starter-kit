<div class="chapitre-titre-num">CHAPITRE 73</div>

# CIS Benchmarks

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Descendre des cadres de gouvernance de haut niveau déjà présentés (NIST CSF, ISO 27001) vers des recommandations de configuration technique détaillées et concrètes, applicables directement à chaque serveur de l'infrastructure. À la fin de ce chapitre, tu comprendras la différence entre les CIS Controls et les CIS Benchmarks, les niveaux de conformité Level 1 et Level 2, et tu sauras durcir un serveur selon un benchmark tout en évitant de casser des fonctionnalités nécessaires.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Lors de la préparation de la certification ISO 27001 (chapitre 72), l'auditeur interne pose une question précise à laquelle personne dans l'équipe ne peut répondre avec certitude : <em>"Vous déclarez que le contrôle d'accès et le durcissement des systèmes sont en place — mais concrètement, quels paramètres exacts sont configurés sur chaque serveur ? Comment savez-vous qu'un serveur Windows Server et un serveur Rocky Linux sont configurés selon les mêmes standards de sécurité rigoureux, plutôt que selon les habitudes de l'administrateur qui les a installés ?"</em> Aucune réponse précise n'existe — chaque serveur a été configuré au fil du temps, sans référentiel technique commun. Les CIS Benchmarks répondent directement à cette question.
</div>

## 73.1 Le problème : une politique déclarée, une configuration réelle incertaine

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le même écart déjà dénoncé à la section 72.4</span>
Une déclaration d'applicabilité ISO 27001 affirmant que le "durcissement des systèmes" est en place reste une déclaration de haut niveau, sans détail sur les paramètres exacts appliqués à chaque serveur. Sans un référentiel technique précis et vérifiable, deux serveurs peuvent porter la même étiquette de conformité tout en ayant des configurations réellement très différentes — l'écart exact entre déclaration et réalité déjà dénoncé comme risque à la section 72.4.
</div>

## 73.2 Les CIS Benchmarks : des guides de configuration détaillés et gratuits

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Les **CIS Benchmarks** (Center for Internet Security) sont des guides de configuration sécurisée détaillés, disponibles gratuitement, pour un très large éventail de technologies — Windows Server, les distributions Linux courantes, les navigateurs, les principaux hyperviseurs et fournisseurs cloud. Chaque recommandation précise exactement le paramètre à modifier, la valeur recommandée, la justification de sécurité, et souvent la commande ou le réglage précis pour l'appliquer — répondant directement au niveau de détail que l'auditeur du scénario d'ouverture réclamait.
</div>

## 73.3 CIS Controls et CIS Benchmarks : deux niveaux complémentaires

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect de la hiérarchie déjà rencontrée aux chapitres 71-72</span>
Les **CIS Controls** définissent un ensemble de priorités stratégiques de haut niveau (dix-huit domaines, comme l'inventaire des actifs ou la gestion des accès) — un niveau d'abstraction comparable aux fonctions du NIST CSF (chapitre 71). Les **CIS Benchmarks**, eux, descendent au niveau de la configuration technique précise d'un système donné — le paramètre exact à appliquer sur un serveur Windows Server 2022 ou une distribution Rocky Linux. Les deux se complètent exactement comme les cadres de gouvernance et les mesures techniques concrètes se complètent tout au long de ce manuel.
</div>

## 73.4 Niveaux de conformité : Level 1 et Level 2

<div class="encadre attention">
<span class="encadre-titre">⚠️ Encore le même arbitrage déjà rencontré à plusieurs reprises</span>
Chaque recommandation d'un CIS Benchmark est classée **Level 1** (mesures de sécurité de base, avec un impact fonctionnel minimal et largement applicables) ou **Level 2** (mesures plus strictes, offrant une sécurité renforcée mais avec un risque plus élevé d'impact sur certaines fonctionnalités). Ce classement reflète le même arbitrage déjà rencontré à plusieurs reprises dans ce manuel entre sécurité et fonctionnalité — appliquer aveuglément l'intégralité du Level 2 sans discernement risque de casser des fonctionnalités réellement nécessaires à l'activité de l'entreprise.
</div>

## 73.5 Outils d'évaluation automatisée

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du chapitre 57 — encore la même logique de scan automatisé</span>
Des outils comme **CIS-CAT** (CIS Configuration Assessment Tool) évaluent automatiquement la conformité d'un système à un benchmark donné, produisant un rapport détaillé des écarts constatés — exactement la même logique déjà rencontrée pour les scans de sécurité automatisés du pipeline DevSecOps (chapitre 57) : automatiser la vérification plutôt que de dépendre d'une inspection manuelle serveur par serveur, un exercice lent et sujet à l'erreur humaine.
</div>

## 73.6 Durcir concrètement les serveurs du fil rouge

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Application directe aux serveurs déjà déployés dans ce manuel</span>
Le CIS Benchmark pour Windows Server (pertinent pour le contrôleur de domaine des chapitres 5-13) recommande, entre autres, la désactivation des protocoles d'authentification obsolètes et un verrouillage de compte après un nombre limité de tentatives échouées. Le CIS Benchmark pour Rocky Linux (pertinent pour le serveur de gestion documentaire du chapitre 19) recommande, entre autres, la désactivation des services réseau non utilisés et un durcissement des permissions sur les fichiers système sensibles — des recommandations directement complémentaires au travail de durcissement SELinux déjà réalisé à ce chapitre.
</div>

## 73.7 Intégrer le durcissement dans les images de base

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct des chapitres 39 et 54 — encore le même principe de réutilisation</span>
Plutôt que de durcir manuellement chaque serveur individuellement après son installation, intégrer les recommandations d'un CIS Benchmark directement dans l'image de base (image Docker du chapitre 39, ou configuration Terraform/Ansible des chapitres 52-55) garantit que chaque nouveau serveur déployé hérite automatiquement du même niveau de durcissement — exactement le même principe de réutilisation déjà rencontré pour les rôles Ansible, les modules Terraform et les templates Zabbix : durcir une fois, réutiliser systématiquement, plutôt que de répéter manuellement un effort de configuration à chaque nouveau déploiement.
</div>

## Atelier — Durcir le serveur de gestion documentaire

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 73 — Répondre à la question de l'auditeur du scénario d'ouverture</span>

**Objectif** : évaluer et corriger la configuration du serveur de gestion documentaire (Rocky Linux) selon un extrait du CIS Benchmark correspondant.

**Préparation** : un accès administrateur au serveur de gestion documentaire, le CIS Benchmark Rocky Linux comme référence.

**Étapes détaillées** :

1. Identifie trois recommandations Level 1 du benchmark directement applicables à ce serveur (services réseau inutiles, permissions de fichiers, politique de mot de passe).
2. Applique ces trois recommandations et documente le paramètre exact modifié pour chacune.
3. Identifie une recommandation Level 2 potentiellement risquée pour ce serveur précis, et explique pourquoi une évaluation de son impact fonctionnel est nécessaire avant application.
4. Explique comment cette démarche répond directement à la question posée par l'auditeur dans le scénario d'ouverture.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : les trois recommandations Level 1 appliquées et documentées constituent une réponse concrète et vérifiable à la question de l'auditeur — plutôt qu'une simple affirmation que "le durcissement est en place", l'équipe peut désormais citer précisément les paramètres appliqués et leur justification, référencée à un standard technique reconnu. La recommandation Level 2 identifiée comme potentiellement risquée illustre l'arbitrage de la section 73.4 : elle ne devrait être appliquée qu'après vérification qu'elle n'interrompt pas une fonctionnalité réellement utilisée par le logiciel de gestion documentaire, évitant de reproduire l'erreur déjà dénoncée d'un excès de sécurité disproportionné par rapport au besoin réel.

**Dépannage** : si l'application d'une recommandation du benchmark casse une fonctionnalité du logiciel de gestion documentaire, ne désactive pas l'ensemble du durcissement par réaction excessive — identifie précisément la recommandation responsable et évalue si une exception documentée et justifiée est appropriée pour ce cas précis, plutôt que d'abandonner l'intégralité de la démarche.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — appliquer aveuglément l'intégralité du Level 2 sans évaluation d'impact</span>
Rappel de la section 73.4 : un risque réel de casser des fonctionnalités nécessaires à l'activité de l'entreprise, sans bénéfice de sécurité proportionné dans certains cas.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — un durcissement effectué une seule fois, jamais revérifié après un changement ultérieur</span>
Une mise à jour système, une réinstallation partielle, ou une modification de configuration ultérieure peut silencieusement annuler une recommandation de durcissement appliquée initialement, sans qu'aucune vérification périodique ne le détecte.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — considérer les CIS Benchmarks comme "trop théoriques" et ne jamais les consulter réellement</span>
Rappel du scénario d'ouverture : c'est précisément l'absence de référentiel technique concret et consulté qui a empêché l'équipe de répondre à la question précise de l'auditeur.
</div>

## Diagnostiquer une application cassée après un durcissement

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une application cesse de fonctionner correctement après l'application d'un CIS Benchmark</span>

- **Diagnostic** : ce symptôme appartient à la même famille que celui déjà rencontré pour une politique NGFW trop stricte au chapitre 66 — une mesure de sécurité, correctement appliquée en elle-même, entre en conflit avec un besoin fonctionnel réel non anticipé.
- **Comment vérifier** : consulter les journaux d'erreur de l'application concernée immédiatement après l'application du durcissement, et comparer les recommandations récemment appliquées à la liste des changements possibles.
- **Résolution** : identifier la recommandation précise responsable via un retour en arrière progressif (rappel indirect de la méthode de diagnostic déjà pratiquée au chapitre 66), puis documenter une exception justifiée pour cette recommandation spécifique plutôt que d'abandonner l'ensemble du durcissement.
</div>

## En entreprise

- **Bonne pratique répandue** : tester l'application d'un nouveau CIS Benchmark sur un environnement de test (rappel direct du chapitre 4) avant toute application en production, particulièrement pour les recommandations Level 2.
- **Bonne pratique répandue** : intégrer la vérification de conformité à un CIS Benchmark dans le pipeline DevSecOps déjà établi au chapitre 57, plutôt que de la traiter comme une activité ponctuelle séparée.
- **Erreur classique observée** : un durcissement appliqué avec succès lors du déploiement initial d'un serveur, mais jamais reconduit sur les serveurs suivants faute de processus reproductible — chaque nouveau serveur revient alors à une configuration par défaut moins sécurisée, sans que personne ne s'en aperçoive avant un audit ultérieur.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre les CIS Controls et les CIS Benchmarks ?"**
Réponse attendue : les CIS Controls définissent des priorités stratégiques de haut niveau, comparables aux fonctions du NIST CSF ; les CIS Benchmarks descendent au niveau de la configuration technique précise d'un système donné, avec des paramètres exacts à appliquer.

**Q2. "Quelle est la différence entre les niveaux Level 1 et Level 2 d'un CIS Benchmark ?"**
Réponse attendue : Level 1 couvre des mesures de sécurité de base avec un impact fonctionnel minimal, largement applicables ; Level 2 couvre des mesures plus strictes offrant une sécurité renforcée mais avec un risque plus élevé d'impact sur certaines fonctionnalités, nécessitant une évaluation avant application.

**Q3. "Pourquoi intégrer le durcissement CIS directement dans une image de base ou une configuration Ansible/Terraform, plutôt que de l'appliquer manuellement après installation ?"**
Réponse attendue : garantir que chaque nouveau serveur déployé hérite automatiquement du même niveau de durcissement, éliminant le risque de dérive de configuration déjà dénoncé pour toute configuration manuelle répétée dans ce manuel.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Utilise les CIS Benchmarks comme référence technique concrète pour toute déclaration de conformité de haut niveau — une déclaration ISO 27001 ou NIST CSF gagne en crédibilité vérifiable lorsqu'elle s'appuie sur un référentiel technique précis et documenté.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Intègre le durcissement CIS dans les images de base et les configurations Infrastructure as Code plutôt que de le répéter manuellement — un changement de recommandation se propage alors automatiquement à tout nouveau déploiement.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Priorise les recommandations Level 1, à faible risque d'impact fonctionnel, avant d'évaluer prudemment les recommandations Level 2 les plus pertinentes pour le contexte réel de chaque système, plutôt que de viser une conformité totale immédiate au détriment de la stabilité opérationnelle.
</div>

## Résumé du chapitre

- Une déclaration de conformité de haut niveau, sans référentiel technique précis, ne peut pas répondre à une question détaillée sur la configuration réelle de chaque serveur.
- Les CIS Benchmarks fournissent des guides de configuration sécurisée détaillés et gratuits, pour un large éventail de technologies.
- Les CIS Controls (stratégiques) et les CIS Benchmarks (techniques) se complètent, comme les cadres de gouvernance et les mesures techniques concrètes tout au long de ce manuel.
- Le niveau Level 1 offre un impact fonctionnel minimal ; le niveau Level 2 nécessite une évaluation d'impact avant application.
- Des outils comme CIS-CAT automatisent l'évaluation de conformité, rejoignant la logique déjà établie pour les scans de sécurité du pipeline DevSecOps.
- Intégrer le durcissement dans les images de base ou l'Infrastructure as Code garantit sa reproduction cohérente sur tout nouveau déploiement.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Les CIS Benchmarks se distinguent des CIS Controls par :
   - a) Leur niveau stratégique plus élevé
   - b) Leur niveau de détail technique précis, jusqu'au paramètre exact à appliquer
   - c) Leur absence totale de lien avec la sécurité
   - d) Leur caractère payant, contrairement aux CIS Controls

2. Une recommandation Level 2 d'un CIS Benchmark, comparée à une recommandation Level 1 :
   - a) A toujours un impact fonctionnel minimal
   - b) Offre une sécurité renforcée mais avec un risque plus élevé d'impact fonctionnel
   - c) Ne concerne jamais les serveurs Linux
   - d) Remplace le besoin d'une analyse de risque

3. Intégrer le durcissement CIS dans une image de base ou une configuration Infrastructure as Code permet principalement de :
   - a) Réduire le coût des serveurs
   - b) Garantir que chaque nouveau serveur hérite automatiquement du même niveau de durcissement
   - c) Éliminer le besoin de tout audit de sécurité futur
   - d) Remplacer le besoin des CIS Controls

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une déclaration affirmant que "le durcissement des systèmes est en place" suffit à répondre à une question précise sur les paramètres réellement configurés. — **Faux** (scénario d'ouverture, section 73.1).
2. Appliquer aveuglément toutes les recommandations Level 2 sans évaluation d'impact peut casser des fonctionnalités nécessaires. — **Vrai**.
3. Un durcissement appliqué une fois reste valide indéfiniment, sans besoin de vérification ultérieure. — **Faux** (section "Erreur n°2").
4. Les CIS Benchmarks sont disponibles gratuitement pour un large éventail de technologies. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la question de l'auditeur dans le scénario d'ouverture ne pouvait pas être satisfaite par la seule déclaration d'applicabilité ISO 27001 déjà rédigée au chapitre 72.
2. Un collègue applique l'intégralité des recommandations Level 2 du CIS Benchmark Windows Server sur le contrôleur de domaine, sans test préalable, "pour maximiser la sécurité le plus rapidement possible". Discute le risque de cette approche.

**Corrigé 1** : la déclaration d'applicabilité ISO 27001 du chapitre 72 opère à un niveau de granularité relativement élevé — elle affirme qu'un domaine de contrôle (comme le durcissement des systèmes) est couvert, sans nécessairement préciser les paramètres techniques exacts appliqués sur chaque serveur individuel. L'auditeur demandait une preuve technique concrète et vérifiable, au niveau du paramètre précis — exactement le niveau de détail qu'apportent les CIS Benchmarks (section 73.2), absents de la préparation initiale de la certification. La déclaration de haut niveau et le référentiel technique détaillé opèrent à deux niveaux distincts et complémentaires, tous deux nécessaires pour répondre pleinement à une exigence d'audit rigoureuse.

**Corrigé 2** : cette approche ignore l'arbitrage explicitement prévu par la classification Level 1/Level 2 elle-même (section 73.4) — les recommandations Level 2 sont précisément identifiées comme présentant un risque plus élevé d'impact fonctionnel, nécessitant une évaluation avant application plutôt qu'une application systématique et immédiate. Sur un contrôleur de domaine, système particulièrement critique pour l'ensemble de l'infrastructure (chapitres 5-13), une fonctionnalité cassée par une recommandation Level 2 mal évaluée pourrait avoir un impact bien plus large que le bénéfice de sécurité recherché — un test préalable en environnement de test (rappel du chapitre 4), suivi d'une application progressive et évaluée, reste la démarche appropriée plutôt qu'une application massive et non testée directement en production sur un système aussi critique.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 73.1</span>

Propose une démarche en quatre étapes pour intégrer les CIS Benchmarks dans le cycle de vie de déploiement des serveurs de l'entreprise, en t'appuyant sur les principes de la section 73.7 et sur l'Infrastructure as Code déjà établie aux chapitres 52-55.
</div>

**Corrigé :** 1) Identifier, pour chaque type de serveur déployé par l'entreprise (Windows Server, Rocky Linux), les recommandations Level 1 et les recommandations Level 2 jugées pertinentes après évaluation d'impact. 2) Traduire ces recommandations en tâches Ansible réutilisables (chapitre 53) ou en configuration intégrée à l'image de base Docker (chapitre 39) selon le type de déploiement concerné. 3) Intégrer l'exécution de ce durcissement systématiquement dans le pipeline de déploiement automatisé (chapitre 56), garantissant qu'aucun nouveau serveur n'est mis en production sans avoir traversé cette étape. 4) Ajouter une vérification de conformité automatisée via un outil comme CIS-CAT (section 73.5) au pipeline DevSecOps déjà établi (chapitre 57), détectant toute dérive de configuration avant qu'elle ne devienne un problème silencieux découvert seulement lors d'un audit ultérieur.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 73.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucune recommandation Level 2 d'un CIS Benchmark n'est appliquée en production sans test préalable, en t'appuyant sur le risque décrit dans les questions ouvertes de ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Toute recommandation Level 2 d'un CIS Benchmark devra être testée dans l'environnement de test déjà établi au chapitre 4 avant toute application en production, avec une vérification explicite que les fonctionnalités critiques du système concerné continuent de fonctionner correctement après application. Les recommandations Level 1, présentant un risque fonctionnel minimal, pourront être appliquées plus directement, sans nécessiter le même niveau de validation préalable. Toute exception documentée, où une recommandation Level 2 pertinente serait volontairement non appliquée en raison d'un conflit fonctionnel avéré, sera consignée avec sa justification, cohérente avec l'esprit de la déclaration d'applicabilité déjà établie au chapitre 72.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi une déclaration de conformité de haut niveau ne suffit pas sans référentiel technique précis.</li>
<li>☐ Je sais distinguer les CIS Controls (stratégiques) des CIS Benchmarks (techniques).</li>
<li>☐ Je sais expliquer la différence entre les niveaux Level 1 et Level 2.</li>
<li>☐ Je sais utiliser un outil d'évaluation automatisée comme CIS-CAT.</li>
<li>☐ Je sais durcir un serveur Windows Server et un serveur Rocky Linux selon un extrait de CIS Benchmark.</li>
<li>☐ Je comprends l'intérêt d'intégrer le durcissement dans les images de base et l'Infrastructure as Code.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Les CIS Benchmarks sont-ils spécifiques à une seule technologie, ou couvrent-ils un large éventail de systèmes ?</dt>
<dd>Ils couvrent un très large éventail de technologies — systèmes d'exploitation, navigateurs, hyperviseurs, fournisseurs cloud, bases de données — permettant une approche cohérente de durcissement à travers l'ensemble de l'infrastructure hétérogène déjà rencontrée dans ce manuel.</dd>

<dt>Faut-il viser une conformité à 100 % à un CIS Benchmark ?</dt>
<dd>Pas nécessairement — une conformité totale et non réfléchie, en particulier pour les recommandations Level 2, peut compromettre des fonctionnalités nécessaires ; une approche pragmatique, priorisant Level 1 et évaluant soigneusement Level 2, reste généralement plus appropriée qu'une conformité maximale poursuivie sans discernement.</dd>

<dt>Les CIS Benchmarks remplacent-ils le besoin d'ISO 27001 ou du NIST CSF ?</dt>
<dd>Non, ils opèrent à un niveau différent et complémentaire — les CIS Benchmarks fournissent le détail technique d'application, tandis que NIST CSF et ISO 27001 fournissent le cadre de gouvernance et de gestion global dans lequel ce détail technique s'inscrit.</dd>

<dt>Un CIS Benchmark est-il mis à jour régulièrement ?</dt>
<dd>Oui, les benchmarks sont révisés périodiquement pour suivre l'évolution des versions logicielles et des menaces connues — une veille régulière sur les nouvelles versions publiées reste nécessaire pour maintenir un référentiel de durcissement à jour.</dd>
</dl>

## Références et pour aller plus loin

- Center for Internet Security — CIS Benchmarks : [https://www.cisecurity.org/cis-benchmarks](https://www.cisecurity.org/cis-benchmarks)
- Center for Internet Security — CIS Controls : [https://www.cisecurity.org/controls](https://www.cisecurity.org/controls)

*Chapitre suivant : le SIEM — centraliser et corréler les événements de sécurité de l'ensemble de l'infrastructure, au-delà de la simple centralisation des logs déjà couverte à la Partie 10 de ce manuel.*
