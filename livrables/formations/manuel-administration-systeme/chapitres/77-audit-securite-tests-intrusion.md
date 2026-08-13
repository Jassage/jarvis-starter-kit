<div class="chapitre-titre-num">CHAPITRE 77</div>

# Audit de sécurité et tests d'intrusion (notions)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Vérifier activement et de façon proactive l'efficacité réelle de l'ensemble des mesures de détection et de protection déjà construites dans cette partie du manuel — pare-feu (chapitre 66), IDS/IPS (chapitre 75), EDR (chapitre 76), SIEM (chapitre 74) — plutôt que d'attendre qu'un incident réel ne les mette à l'épreuve. À la fin de ce chapitre, tu comprendras la différence entre un audit de sécurité et un test d'intrusion, les différents niveaux de connaissance préalable (boîte noire, grise, blanche), le cadre légal indispensable, et la boucle de vérification après remédiation.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
La simulation d'intrusion évoquée au chapitre 74, menée par un prestataire externe, n'était pas un événement isolé — c'était en réalité le premier test d'intrusion formel commandité par l'entreprise, après plusieurs années à construire des défenses (pare-feu, IDS/IPS, EDR, SIEM) sans jamais les avoir réellement mises à l'épreuve dans des conditions proches d'une attaque réelle. <em>"On construit des défenses depuis des années,"</em> résume la RSSI, <em>"mais jusqu'à cette simulation, on n'avait jamais vraiment vérifié si elles fonctionnaient ensemble face à un attaquant déterminé."</em> Ce chapitre formalise cette pratique, désormais intégrée durablement au cycle de sécurité de l'entreprise.
</div>

## 77.1 Le problème : des défenses jamais réellement testées

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Une mesure de sécurité correctement configurée en théorie peut échouer en pratique pour de multiples raisons — une règle mal calibrée, une source non intégrée au SIEM, un poste oublié lors du déploiement de l'EDR. Sans test actif dans des conditions réalistes, ces failles restent invisibles jusqu'à ce qu'un attaquant réel, malveillant, les découvre à sa place — un scénario nettement moins favorable qu'une découverte contrôlée par un prestataire mandaté à cet effet.
</div>

## 77.2 Audit de sécurité et test d'intrusion : deux approches distinctes

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un **audit de sécurité** examine la conformité et la configuration des systèmes par rapport à un référentiel donné (comme les CIS Benchmarks du chapitre 73), généralement de façon systématique et documentaire. Un **test d'intrusion** (pentest) va plus loin : il simule activement une attaque réelle, tentant d'exploiter des vulnérabilités pour évaluer non seulement leur présence, mais leur exploitabilité concrète et l'efficacité réelle des défenses en place à les détecter et à les contenir — exactement l'exercice mené par le prestataire dans le scénario d'ouverture du chapitre 74.
</div>

## 77.3 Niveaux de connaissance préalable : boîte noire, grise, blanche

<div class="encadre astuce">
<span class="encadre-titre">💡 Trois niveaux de réalisme</span>
Un test en **boîte noire** simule un attaquant externe sans aucune connaissance préalable de l'infrastructure — le plus réaliste par rapport à une menace externe, mais aussi le plus long et le moins exhaustif dans le temps imparti. Un test en **boîte grise** fournit un niveau de connaissance intermédiaire (comme des identifiants utilisateur standards), simulant une menace interne ou un attaquant ayant déjà obtenu un accès initial. Un test en **boîte blanche** fournit une connaissance complète de l'infrastructure, maximisant la couverture des vulnérabilités identifiées au détriment du réalisme d'un scénario d'attaque authentique.
</div>

## 77.4 Le cadre légal : jamais sans mandat écrit explicite

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — un point non négociable</span>
Un test d'intrusion réalisé sans autorisation écrite explicite, précisant le périmètre exact autorisé, les dates, et les limites de l'intervention, constitue une activité illégale, indiscernable d'une véritable cyberattaque du point de vue de la loi — quelle que soit l'intention réelle de la personne qui le mène. Toute démarche de test d'intrusion, interne ou via un prestataire externe comme dans le scénario d'ouverture, doit impérativement s'appuyer sur un mandat écrit signé par une autorité compétente de l'organisation, définissant précisément la portée (*scope*) autorisée.
</div>

## 77.5 Les étapes d'un test d'intrusion

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect de la section 74.5</span>
Un test d'intrusion suit généralement une progression similaire à celle d'une attaque réelle déjà évoquée au chapitre 74 : **reconnaissance** (collecte d'informations sur la cible), **exploitation** (tentative d'accès initial via une vulnérabilité identifiée), **post-exploitation** (évaluation de ce qu'un accès obtenu permettrait réellement de faire — élévation de privilèges, mouvement latéral), puis **rapport** (documentation détaillée des constats et recommandations). Cette progression méthodique permet d'évaluer non seulement si une vulnérabilité existe, mais son impact réel si elle était exploitée par un attaquant véritable.
</div>

## 77.6 Le rapport : au-delà d'une simple liste de failles

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel indirect du chapitre 72</span>
Un rapport de test d'intrusion utile ne se limite pas à énumérer des vulnérabilités techniques — il priorise les constats selon leur gravité réelle et leur exploitabilité concrète, exactement le même principe de priorisation par le risque déjà établi pour l'analyse de risque ISO 27001 au chapitre 72. Une vulnérabilité théorique difficile à exploiter en pratique mérite un traitement différent d'une vulnérabilité activement exploitée avec succès durant le test, avec un accès obtenu jusqu'à des données sensibles.
</div>

## 77.7 Retester après correction : fermer la boucle

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct du chapitre 27</span>
Un rapport de test d'intrusion sans vérification ultérieure de la correction effective des vulnérabilités identifiées reproduit le même risque déjà dénoncé pour une sauvegarde jamais testée en restauration au chapitre 27 — la mesure corrective déclarée "appliquée" peut, dans les faits, s'avérer incomplète ou incorrecte sans qu'aucune vérification ne le confirme. Un cycle de test d'intrusion complet inclut donc systématiquement une phase de **retest**, vérifiant que chaque vulnérabilité corrigée l'est réellement, et non simplement déclarée comme telle.
</div>

## Atelier — Définir le mandat d'un test d'intrusion sur le portail client

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 77 — Formaliser la démarche du scénario d'ouverture pour un futur test</span>

**Objectif** : rédiger les éléments essentiels d'un mandat de test d'intrusion pour le portail client, exposé publiquement sur Internet.

**Préparation** : une compréhension du périmètre technique du portail client (chapitres 39-44), déjà protégé par le pare-feu (chapitre 66), l'IDS/IPS (chapitre 75) et intégré au SIEM (chapitre 74).

**Étapes détaillées** :

1. Détermine le niveau de connaissance préalable le plus approprié pour ce test (boîte noire, grise ou blanche), en justifiant ton choix par rapport à la menace la plus réaliste pour ce système exposé publiquement.
2. Définis explicitement le périmètre autorisé (quels systèmes, quelles adresses, quelles dates) et ce qui reste hors périmètre.
3. Rédige les limites de l'intervention (types d'attaques exclues, comme une attaque par déni de service qui interromprait le service pour de vrais utilisateurs).
4. Explique pourquoi l'autorisation écrite doit être signée par une autorité ayant explicitement le pouvoir d'engager l'organisation sur ce périmètre précis.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : un test en boîte noire ou grise reste le plus pertinent pour le portail client exposé publiquement, simulant fidèlement la menace la plus probable — un attaquant externe sans accès préalable, éventuellement complété par un accès utilisateur standard pour évaluer les risques d'un compte compromis. Le périmètre devrait explicitement exclure les autres systèmes internes de l'entreprise non liés au portail, évitant qu'un test initialement circonscrit ne dérive vers des systèmes non couverts par le mandat. L'exclusion d'attaques par déni de service protège la disponibilité réelle du service pendant le test, un impact qui affecterait de vrais utilisateurs si le test causait une interruption non désirée. L'autorisation doit être signée par une autorité disposant explicitement du pouvoir d'engager l'organisation, car un mandat signé par une personne sans cette autorité réelle n'offrirait aucune protection légale valide en cas de contestation ultérieure.

**Dépannage** : si, durant le test, le prestataire découvre une vulnérabilité critique manifestement exploitable avec un impact potentiel immédiat, le mandat devrait prévoir une procédure de signalement d'urgence permettant d'interrompre le test et d'alerter immédiatement l'équipe de sécurité, plutôt que d'attendre le rapport final pour communiquer une découverte critique.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un test d'intrusion mené sans autorisation écrite explicite</span>
Rappel de la section 77.4 : un risque légal majeur, quelle que soit l'intention réelle de la personne qui mène le test.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — un périmètre mal défini, menant à un test débordant du cadre autorisé</span>
Rappel de l'atelier : un périmètre imprécis expose l'organisation et le prestataire à des risques légaux et opérationnels évitables par une définition claire dès le départ.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — un rapport de test archivé sans jamais être suivi de remédiation réelle</span>
Rappel de la section 77.7 : une vulnérabilité identifiée mais non corrigée, puis retrouvée identique lors du test suivant, révèle un processus de remédiation défaillant, indépendamment de la qualité du test lui-même.
</div>

## Diagnostiquer une vulnérabilité récurrente d'un test à l'autre

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une vulnérabilité déjà signalée lors d'un test d'intrusion précédent est retrouvée non corrigée lors du test suivant</span>

- **Diagnostic** : vérifier si la remédiation avait réellement été assignée à un responsable identifié après le rapport précédent, ou si le rapport avait simplement été archivé sans suivi opérationnel structuré.
- **Comment vérifier** : consulter le processus de suivi des recommandations post-audit — un rapport de test d'intrusion sans mécanisme de suivi formel des actions correctives échoue structurellement à garantir leur mise en œuvre réelle.
- **Résolution** : mettre en place un processus de suivi formel assignant chaque recommandation à un responsable et une échéance, avec une vérification explicite de sa clôture, plutôt que de considérer le rapport lui-même comme l'aboutissement de la démarche.
</div>

## En entreprise

- **Bonne pratique répandue** : planifier des tests d'intrusion réguliers (généralement annuels, ou après tout changement d'infrastructure significatif), plutôt qu'un exercice ponctuel réalisé une seule fois.
- **Bonne pratique répandue** : varier le niveau de connaissance préalable (boîte noire, grise, blanche) d'un test à l'autre, chacun révélant des angles différents de la posture de sécurité de l'organisation.
- **Erreur classique observée** : un rapport de test d'intrusion présenté au comité de direction comme une réussite marketing ("nos défenses ont bien résisté"), sans que les vulnérabilités mineures identifiées ne fassent l'objet d'un suivi rigoureux, jusqu'à ce qu'un test ultérieur — ou un attaquant réel — les redécouvre.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre un audit de sécurité et un test d'intrusion ?"**
Réponse attendue : un audit examine la conformité et la configuration par rapport à un référentiel, généralement de façon systématique et documentaire ; un test d'intrusion simule activement une attaque réelle pour évaluer l'exploitabilité concrète des vulnérabilités et l'efficacité réelle des défenses en place.

**Q2. "Pourquoi un mandat écrit explicite est-il absolument indispensable avant tout test d'intrusion ?"**
Réponse attendue : sans autorisation écrite précisant le périmètre autorisé, un test d'intrusion est légalement indiscernable d'une véritable cyberattaque, exposant la personne qui le mène à un risque légal majeur, quelle que soit son intention réelle.

**Q3. "Pourquoi le retest après remédiation constitue-t-il une étape essentielle, souvent négligée, d'un cycle de test d'intrusion complet ?"**
Réponse attendue : une correction déclarée "appliquée" peut s'avérer incomplète ou incorrecte sans vérification ; le retest confirme que la vulnérabilité est réellement corrigée, plutôt que de se fier à une simple déclaration non vérifiée, le même principe déjà établi pour tester une restauration de sauvegarde.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'engage jamais un test d'intrusion, interne ou externe, sans une autorisation écrite explicite et signée par une autorité compétente — un point non négociable, sans exception, quelle que soit l'urgence perçue.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Mets en place un processus de suivi formel pour chaque recommandation issue d'un rapport de test d'intrusion, avec un responsable et une échéance assignés, plutôt que de considérer le rapport lui-même comme l'aboutissement final de la démarche.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Priorise les vulnérabilités identifiées selon leur gravité et leur exploitabilité réelle démontrée durant le test, concentrant les ressources de remédiation limitées sur les risques les plus critiques plutôt que de traiter chaque constat avec la même priorité.
</div>

## Résumé du chapitre

- Des défenses correctement configurées en théorie peuvent échouer en pratique pour des raisons invisibles sans test actif dans des conditions réalistes.
- Un audit de sécurité examine la conformité ; un test d'intrusion simule activement une attaque pour évaluer l'exploitabilité réelle des vulnérabilités.
- Les trois niveaux de connaissance préalable (boîte noire, grise, blanche) offrent des compromis différents entre réalisme et exhaustivité de couverture.
- Un test d'intrusion nécessite impérativement un mandat écrit explicite, définissant précisément le périmètre autorisé — un point légal non négociable.
- Un test suit généralement les étapes de reconnaissance, exploitation, post-exploitation et rapport, reflétant la progression d'une attaque réelle.
- Le retest après remédiation ferme la boucle de vérification, confirmant qu'une vulnérabilité est réellement corrigée plutôt que simplement déclarée comme telle.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La différence fondamentale entre un audit de sécurité et un test d'intrusion est que :
   - a) L'audit simule activement une attaque, contrairement au test d'intrusion
   - b) Le test d'intrusion simule activement une attaque pour évaluer l'exploitabilité réelle, contrairement à l'audit
   - c) Les deux termes désignent exactement la même activité
   - d) L'audit ne concerne jamais la sécurité informatique

2. Un test en boîte noire se caractérise par :
   - a) Une connaissance complète de l'infrastructure fournie au testeur
   - b) Aucune connaissance préalable de l'infrastructure, simulant un attaquant externe
   - c) L'absence totale de mandat écrit
   - d) Un périmètre toujours illimité

3. Le retest après remédiation sert principalement à :
   - a) Remplacer le besoin du rapport initial
   - b) Confirmer qu'une vulnérabilité corrigée l'est réellement, plutôt que simplement déclarée comme telle
   - c) Éliminer le besoin de tout mandat écrit
   - d) Réduire la durée du test initial

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un test d'intrusion peut être mené sans autorisation écrite si l'intention est clairement bienveillante. — **Faux** (section 77.4, un risque légal quelle que soit l'intention).
2. Un test en boîte blanche maximise la couverture des vulnérabilités identifiées au détriment du réalisme du scénario d'attaque. — **Vrai** (section 77.3).
3. Un rapport de test d'intrusion archivé sans processus de suivi formel garantit la correction effective des vulnérabilités identifiées. — **Faux** (section "Erreur n°3").
4. Le périmètre d'un test d'intrusion doit être défini précisément avant le début du test. — **Vrai** (section 77.4).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la simulation d'intrusion du scénario d'ouverture du chapitre 74 aurait constitué une activité illégale si elle avait été menée sans le mandat approprié, malgré son intention manifestement bénéfique pour l'entreprise.
2. Un collègue propose de considérer le rapport de test d'intrusion comme "terminé" dès sa remise, sans processus de suivi formel des recommandations. Explique le risque concret de cette approche, en t'appuyant sur un parallèle déjà établi ailleurs dans ce manuel.

**Corrigé 1** : la loi ne peut généralement pas distinguer, sur la seule base des actions techniques observées, un test d'intrusion légitime d'une véritable cyberattaque — les deux impliquent des tentatives similaires d'accès non autorisé à des systèmes informatiques. Seule l'existence d'un mandat écrit explicite, signé par une autorité compétente de l'organisation ciblée, établit juridiquement le caractère autorisé de l'intervention. Sans ce mandat, même une intervention menée avec les meilleures intentions et dans le seul but d'améliorer la sécurité de l'entreprise resterait, du point de vue légal, indiscernable d'une intrusion malveillante — un risque que la section 77.4 qualifie explicitement de non négociable.

**Corrigé 2** : cette approche reproduit exactement le même risque déjà dénoncé pour une sauvegarde jamais testée en restauration au chapitre 27 — une action déclarée "faite" (le rapport remis) sans vérification de son effet réel (les vulnérabilités effectivement corrigées) laisse un écart potentiellement important entre la perception de sécurité de l'organisation et sa réalité effective. Une vulnérabilité identifiée dans le rapport, mais jamais réellement corrigée faute de suivi assigné à un responsable précis, resterait exploitable exactement comme si le test n'avait jamais eu lieu — sauf que l'organisation croirait, à tort, avoir traité le problème. Le retest (section 77.7) constitue la seule vérification fiable que la remédiation a réellement eu l'effet recherché, plutôt que de se fier à une simple déclaration d'achèvement non vérifiée.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 77.1</span>

Un test d'intrusion en boîte grise sur le portail client révèle qu'un utilisateur standard peut, par une faille d'autorisation, accéder aux données d'autres utilisateurs. Décris les étapes appropriées suivant cette découverte, de la documentation initiale jusqu'à la clôture définitive du constat.
</div>

**Corrigé :** 1) Documenter précisément la vulnérabilité dans le rapport, avec les étapes exactes ayant permis de la reproduire, sa gravité (accès non autorisé à des données d'autres utilisateurs, potentiellement sensible) et son exploitabilité démontrée durant le test (section 77.6). 2) Assigner cette recommandation à un responsable identifié au sein de l'équipe de développement du portail, avec une échéance de correction proportionnée à la gravité du constat. 3) Corriger la faille d'autorisation dans le code de l'application. 4) Retester spécifiquement ce constat (section 77.7), en tentant de reproduire exactement le même scénario d'exploitation qu'initialement documenté, confirmant que la correction empêche effectivement l'accès non autorisé précédemment démontré. 5) Clôturer formellement le constat uniquement après cette vérification positive, jamais sur la seule base de la déclaration de correction par l'équipe de développement.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 77.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucun test d'intrusion, interne ou via un prestataire externe, n'est jamais mené sans mandat écrit préalablement approuvé, en t'appuyant sur le risque légal décrit à la section 77.4.
</div>

**Corrigé (exemple de réponse) :** Aucun test d'intrusion, qu'il soit mené par un membre de l'équipe interne ou par un prestataire externe, ne débutera sans un mandat écrit préalablement approuvé, précisant explicitement le périmètre autorisé, les dates de l'intervention, et les types d'actions exclues du test. Ce mandat sera signé par une autorité de l'organisation disposant explicitement du pouvoir d'engager celle-ci sur ce périmètre précis, jamais par une personne agissant sans cette délégation formelle. Toute demande de test d'intrusion urgente, même motivée par une préoccupation de sécurité légitime, suivra impérativement ce même processus d'approbation avant tout début d'intervention technique, sans exception fondée sur l'urgence perçue, conformément au caractère non négociable de cette exigence déjà établi dans ce chapitre.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi des défenses correctement configurées en théorie peuvent échouer en pratique sans test actif.</li>
<li>☐ Je sais distinguer un audit de sécurité d'un test d'intrusion.</li>
<li>☐ Je sais expliquer la différence entre les tests en boîte noire, grise et blanche.</li>
<li>☐ Je comprends pourquoi un mandat écrit explicite est absolument indispensable avant tout test d'intrusion.</li>
<li>☐ Je sais décrire les étapes typiques d'un test d'intrusion.</li>
<li>☐ Je comprends l'importance du retest après remédiation pour fermer la boucle de vérification.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Une petite ou moyenne organisation peut-elle réellement se permettre des tests d'intrusion réguliers ?</dt>
<dd>Le coût et l'ampleur d'un test peuvent être adaptés au contexte réel de l'organisation — un test ciblé sur les systèmes les plus critiques (comme le portail client exposé publiquement) reste plus accessible qu'un test exhaustif de l'ensemble de l'infrastructure, tout en apportant une valeur significative.</dd>

<dt>Faut-il toujours faire appel à un prestataire externe, ou une équipe interne peut-elle mener un test d'intrusion ?</dt>
<dd>Les deux approches sont possibles et souvent complémentaires — une équipe interne compétente peut mener des tests plus fréquents et moins coûteux, tandis qu'un prestataire externe indépendant apporte un regard neuf et une expertise potentiellement plus spécialisée, comme dans le scénario d'ouverture de ce chapitre.</dd>

<dt>Un test d'intrusion réussi (aucune vulnérabilité critique trouvée) signifie-t-il que l'infrastructure est totalement sécurisée ?</dt>
<dd>Non, un test d'intrusion évalue la sécurité à un instant précis, dans un périmètre et une durée définis — il ne garantit rien sur les vulnérabilités qui pourraient apparaître ultérieurement suite à un changement d'infrastructure, ni sur des scénarios d'attaque non couverts par le périmètre du test réalisé.</dd>

<dt>Quelle est la différence entre un test d'intrusion et le bug bounty (programme de récompense pour la découverte de vulnérabilités) ?</dt>
<dd>Un test d'intrusion est mené par un nombre limité de testeurs mandatés, sur une période définie ; un programme de bug bounty ouvre la recherche de vulnérabilités à une communauté plus large de chercheurs indépendants, généralement de façon continue, avec une récompense financière pour chaque découverte validée — les deux approches restent complémentaires plutôt que substituables.</dd>
</dl>

## Références et pour aller plus loin

- OWASP — Testing Guide : [https://owasp.org/www-project-web-security-testing-guide/](https://owasp.org/www-project-web-security-testing-guide/)
- NIST — Technical Guide to Information Security Testing and Assessment (SP 800-115) : [https://csrc.nist.gov/publications/detail/sp/800-115/final](https://csrc.nist.gov/publications/detail/sp/800-115/final)
- PTES — Penetration Testing Execution Standard : [http://www.pentest-standard.org/](http://www.pentest-standard.org/)

*Chapitre suivant : la gestion des vulnérabilités et le durcissement (hardening) — traiter systématiquement, et pas seulement lors d'un test ponctuel, les failles de sécurité découvertes tout au long du cycle de vie de l'infrastructure.*
