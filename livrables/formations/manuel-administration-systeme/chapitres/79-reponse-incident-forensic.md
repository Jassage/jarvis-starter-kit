<div class="chapitre-titre-num">CHAPITRE 79</div>

# Réponse à incident et forensic de base

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Traiter ce qu'il faut faire concrètement lorsque, malgré toutes les mesures de prévention et de détection déjà construites dans cette partie du manuel, un incident survient réellement — le traitement formel et procédural déjà annoncé comme manquant à la section 71.6. À la fin de ce chapitre, tu comprendras les six phases d'une réponse à incident structurée, les notions de base du forensic (préservation des preuves, chaîne de custody), et comment l'ensemble des outils construits dans cette partie (SIEM, IDS/IPS, EDR) se combinent lors d'un incident réel.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
En clôture de la Partie 12, la RSSI organise une relecture collective de l'incident fondateur du chapitre 4 — le rançongiciel exploitant l'accès RDP exposé. <em>"À l'époque,"</em> rappelle-t-elle, <em>"on a improvisé entièrement : personne ne savait qui devait décider quoi, certains postes ont été éteints immédiatement, effaçant probablement des preuves utiles, et une fois l'incident terminé, personne n'a formellement documenté ce qui avait été appris."</em> Aujourd'hui, l'entreprise dispose d'un SIEM (chapitre 74), d'un IDS/IPS (chapitre 75) et d'un EDR (chapitre 76) — mais sans procédure structurée pour orchestrer leur usage pendant un incident réel, une grande partie de cette maturité technique resterait sous-exploitée dans l'urgence. Ce chapitre construit cette procédure.
</div>

## 79.1 Le problème : revenir à l'improvisation du chapitre 4

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Sans procédure écrite préparée à l'avance, un incident réel se traite dans l'urgence et l'improvisation — exactement ce qui s'est produit au chapitre 4. Ce constat rejoint directement le même principe déjà établi pour le plan de reprise d'activité et le plan de continuité (chapitres 31-32) : la préparation doit précéder l'incident, jamais s'improviser pendant celui-ci, un enjeu d'autant plus critique que la pression et le stress d'un incident réel réduisent significativement la qualité du jugement improvisé.
</div>

## 79.2 Les six phases d'une réponse à incident structurée

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Une réponse à incident structurée suit généralement six phases : **préparation** (avant tout incident), **identification** (détecter et confirmer qu'un incident est en cours), **confinement** (limiter la propagation), **éradication** (éliminer la cause), **récupération** (restaurer un fonctionnement normal), et **retour d'expérience** (documenter les leçons apprises). Cette structure, largement reconnue et documentée (notamment par le NIST), transforme une réaction improvisée en un processus reproductible et amélioré à chaque nouvel incident.
</div>

```mermaid
flowchart LR
    P[Preparation] --> I[Identification]
    I --> C[Confinement]
    C --> E[Eradication]
    E --> R[Recuperation]
    R --> RE[Retour d'experience]
    RE -.-> P
```

## 79.3 Préparation : le plan écrit avant l'incident

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct des chapitres 31-32</span>
La phase de préparation définit à l'avance qui décide quoi durant un incident, quels contacts alerter (interne et externe, incluant potentiellement des autorités légales selon la nature de l'incident), et quels outils sont disponibles — exactement le même principe de préparation documentée déjà établi pour le plan de reprise d'activité et le plan de continuité, appliqué ici spécifiquement à la gestion d'un incident de sécurité en cours.
</div>

## 79.4 Identification : où tout ce qui a été construit converge

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct des chapitres 74, 75 et 76</span>
La phase d'identification s'appuie directement sur l'ensemble des outils de détection déjà construits dans cette partie du manuel — une alerte de corrélation du SIEM (chapitre 74), une détection réseau de l'IDS/IPS (chapitre 75), ou une alerte comportementale de l'EDR (chapitre 76) déclenchent généralement le point de départ formel d'une réponse à incident. C'est précisément à cette étape que la maturité technique accumulée tout au long de cette partie du manuel démontre sa valeur concrète, transformant une détection technique en déclenchement d'un processus organisationnel structuré.
</div>

## 79.5 Confinement : isoler sans détruire les preuves

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une nuance essentielle par rapport à la réponse automatisée du chapitre 76</span>
L'isolement réseau automatique d'un poste par l'EDR (section 76.4) constitue une excellente première mesure de confinement — mais la phase de confinement complète va plus loin : elle doit isoler la menace tout en préservant l'état du système pour l'analyse forensic ultérieure (section 79.6). Éteindre immédiatement un poste compromis, un réflexe intuitif mais risqué, peut effacer des preuves précieuses présentes uniquement en mémoire vive, compliquant considérablement la compréhension complète de l'incident.
</div>

## 79.6 Notions de base du forensic : préserver avant de nettoyer

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — répondre directement au constat de la RSSI dans le scénario d'ouverture</span>
Le **forensic** numérique consiste à préserver et analyser méthodiquement les preuves d'un incident, en maintenant une **chaîne de custody** rigoureuse (une documentation continue de qui a accédé à quelle preuve, quand, et comment) garantissant l'intégrité de ces preuves. Avant toute action de nettoyage (réinstallation, suppression de fichiers), une image complète du système compromis devrait être capturée — répondant directement au constat du scénario d'ouverture, où des postes éteints précipitamment lors de l'incident du chapitre 4 avaient probablement effacé des informations qui auraient pu éclairer la compréhension complète de l'attaque.
</div>

## 79.7 Éradication et récupération : rappel direct du chapitre 31

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct des chapitres 27 et 31</span>
Une fois la cause de l'incident éliminée (éradication), la récupération s'appuie directement sur les stratégies de sauvegarde et le plan de reprise d'activité déjà établis aux chapitres 27 et 31 — restaurer les systèmes affectés à partir d'une sauvegarde saine et vérifiée, plutôt que de tenter une réparation incertaine d'un système potentiellement encore compromis de façon non détectée.
</div>

## 79.8 Retour d'expérience : boucler vers la fonction Identifier

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct du diagramme du chapitre 71</span>
Le retour d'expérience documente les leçons apprises et alimente directement la fonction **Identifier** du NIST CSF (chapitre 71) — exactement la flèche de rétroaction déjà représentée dans le diagramme de la section 71.2, reliant la fonction Récupérer à la fonction Identifier. Un incident correctement analysé après coup révèle souvent des angles morts dans l'inventaire des actifs, des lacunes dans les mesures de protection, ou des besoins de détection non couverts — nourrissant ainsi le cycle complet de gestion de la sécurité plutôt que de clore l'incident sans en tirer d'enseignement structuré.
</div>

## Atelier — Rejouer l'incident du chapitre 4 avec la maturité actuelle

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 79 — La synthèse de toute la Partie 12</span>

**Objectif** : rejouer, phase par phase, l'incident de rançongiciel du chapitre 4 en utilisant l'ensemble des outils et procédures construits tout au long de cette partie du manuel.

**Préparation** : une relecture du scénario original du chapitre 4, et l'ensemble des outils déjà déployés (NIST CSF, SIEM, IDS/IPS, EDR, CIS Benchmarks).

**Étapes détaillées** :

1. **Identification** : décris comment l'IDS/IPS (chapitre 75) et l'EDR (chapitre 76) auraient pu détecter l'intrusion à des étapes différentes et plus précoces que la découverte originale par les utilisateurs.
2. **Confinement** : décris l'action de confinement appropriée, en tenant compte de la nuance forensic de la section 79.5.
3. **Forensic** : identifie les preuves qui auraient dû être préservées avant toute action de nettoyage.
4. **Récupération** : explique comment le plan de reprise d'activité du chapitre 31 s'articule avec cette réponse à incident.
5. **Retour d'expérience** : propose une leçon apprise qui aurait dû alimenter la fonction Identifier du NIST CSF.
6. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : avec la maturité actuelle, l'IDS/IPS aurait pu détecter le scan de reconnaissance précédant l'exploitation de l'accès RDP exposé, et l'EDR aurait pu détecter le comportement de chiffrement caractéristique du rançongiciel dès ses premières secondes d'activité (rappel direct de la section 76.5) — une détection bien plus précoce que celle originale par les utilisateurs constatant l'indisponibilité de leurs fichiers. Le confinement approprié isolerait le poste affecté (via l'EDR) tout en capturant une image du système avant toute réinstallation, préservant les preuves du vecteur d'attaque initial. La récupération s'appuierait sur une restauration depuis une sauvegarde saine et testée (chapitre 27), plutôt qu'une tentative de réparation du système compromis. Le retour d'expérience documenterait que l'accès RDP exposé constituait un actif mal identifié dans son niveau de risque réel — alimentant directement une révision de l'inventaire et de l'analyse de risque de la fonction Identifier.

**Dépannage** : si l'exercice révèle qu'une phase entière (souvent le forensic ou le retour d'expérience) reste difficile à réaliser concrètement faute de procédure ou d'outillage existant, considère cette difficulté elle-même comme un résultat légitime de l'exercice — révélant une lacune réelle à combler avant qu'un véritable incident ne survienne, plutôt qu'un échec de l'atelier.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — éteindre ou réinstaller immédiatement un système compromis</span>
Rappel de la section 79.6 : un réflexe intuitif mais risqué, effaçant potentiellement des preuves forensic précieuses présentes uniquement en mémoire vive.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — aucun plan de réponse à incident écrit avant qu'un incident ne survienne</span>
Rappel de la section 79.1 : reproduit exactement l'improvisation déjà constatée lors de l'incident du chapitre 4, avec un jugement dégradé par le stress et l'urgence réels de la situation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — aucun retour d'expérience formel après la clôture d'un incident</span>
Rappel de la section 79.8 : un incident clos sans documentation structurée des leçons apprises prive l'organisation de la boucle d'amélioration continue déjà établie comme principe central du NIST CSF.
</div>

## Diagnostiquer un incident qui se reproduit de façon quasi identique

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un incident de sécurité similaire à un incident déjà survenu se reproduit, exploitant une cause proche ou identique</span>

- **Diagnostic** : ce symptôme, rappel direct du même pattern déjà observé pour des vulnérabilités récurrentes au chapitre 78, révèle généralement l'absence d'un retour d'expérience formel après le premier incident, ou un retour d'expérience réalisé mais dont les recommandations n'ont jamais été suivies d'une action concrète.
- **Comment vérifier** : rechercher si un rapport de retour d'expérience existe pour l'incident précédent, et si ses recommandations ont fait l'objet d'un suivi assigné et vérifié — le même processus de suivi déjà recommandé pour les rapports de test d'intrusion au chapitre 77.
- **Résolution** : formaliser (ou renforcer) le processus de retour d'expérience, avec un suivi structuré des actions correctives identifiées, empêchant qu'une même faille organisationnelle ou technique ne soit exploitée une seconde fois.
</div>

## En entreprise

- **Bonne pratique répandue** : réaliser des exercices de simulation de réponse à incident (*tabletop exercises*) périodiquement, testant le plan de réponse dans un contexte contrôlé plutôt que d'attendre un incident réel pour le découvrir défaillant — le même principe déjà établi pour tester une restauration de sauvegarde ou un plan de continuité.
- **Bonne pratique répandue** : désigner à l'avance les rôles et responsabilités précis durant un incident (qui décide, qui communique, qui agit techniquement), évitant toute ambiguïté au moment critique.
- **Erreur classique observée** : un plan de réponse à incident rédigé une fois, jamais mis à jour à mesure que l'infrastructure évolue (nouveaux outils, nouveaux contacts, nouvelle organisation) — devenant progressivement obsolète et moins utile au moment précis où il devrait s'appliquer.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelles sont les six phases d'une réponse à incident structurée ?"**
Réponse attendue : préparation, identification, confinement, éradication, récupération, retour d'expérience — une structure transformant une réaction improvisée en un processus reproductible et amélioré à chaque nouvel incident.

**Q2. "Pourquoi ne faut-il jamais éteindre immédiatement un système compromis avant toute analyse forensic ?"**
Réponse attendue : certaines preuves précieuses n'existent qu'en mémoire vive et disparaissent à l'extinction du système ; préserver l'état du système (via une image complète) avant toute action de nettoyage permet une analyse forensic ultérieure plus complète, cruciale pour comprendre pleinement l'incident.

**Q3. "Comment le retour d'expérience d'un incident se rattache-t-il au NIST CSF présenté au chapitre 71 ?"**
Réponse attendue : le retour d'expérience alimente directement la fonction Identifier, révélant souvent des angles morts dans l'inventaire des actifs ou des lacunes de protection, fermant ainsi la boucle du cycle continu entre les cinq fonctions du cadre.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne détruis jamais de preuves potentielles par précipitation lors du confinement d'un incident — une image du système avant nettoyage reste une précaution peu coûteuse comparée à la perte définitive d'informations utiles à la compréhension complète de l'incident.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Maintiens le plan de réponse à incident à jour à mesure que l'infrastructure évolue, et teste-le périodiquement via des exercices de simulation, plutôt que de le rédiger une fois et de le laisser devenir obsolète.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Une réponse à incident structurée et préparée à l'avance réduit significativement le temps de réaction global comparé à une improvisation complète — chaque minute gagnée durant la phase de confinement limite d'autant la propagation potentielle et l'impact final de l'incident.
</div>

## Résumé du chapitre

- Sans procédure écrite préparée à l'avance, un incident réel se traite dans l'urgence et l'improvisation, comme lors de l'incident fondateur du chapitre 4.
- Une réponse à incident structurée suit six phases : préparation, identification, confinement, éradication, récupération, retour d'expérience.
- La phase d'identification s'appuie directement sur le SIEM, l'IDS/IPS et l'EDR déjà construits dans cette partie du manuel.
- Le confinement doit isoler la menace tout en préservant l'état du système pour l'analyse forensic ultérieure, plutôt que de détruire des preuves par précipitation.
- La récupération s'appuie sur les stratégies de sauvegarde et le plan de reprise d'activité déjà établis aux chapitres 27 et 31.
- Le retour d'expérience alimente directement la fonction Identifier du NIST CSF, fermant la boucle complète du cycle de gestion de la sécurité.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Les six phases d'une réponse à incident structurée sont :
   - a) Scanner, Prioriser, Remédier, Vérifier, Documenter, Clôturer
   - b) Préparation, Identification, Confinement, Éradication, Récupération, Retour d'expérience
   - c) Reconnaissance, Exploitation, Post-exploitation, Rapport, Retest, Clôture
   - d) Identifier, Protéger, Détecter, Répondre, Récupérer, Documenter

2. Pourquoi ne faut-il pas éteindre immédiatement un poste compromis ?
   - a) Cela n'a jamais aucune conséquence
   - b) Des preuves précieuses présentes en mémoire vive risquent d'être définitivement perdues
   - c) Un poste éteint continue de propager l'attaque
   - d) L'extinction accélère toujours la récupération

3. Le retour d'expérience d'un incident alimente principalement :
   - a) La fonction Protéger uniquement
   - b) La fonction Identifier du NIST CSF
   - c) Uniquement le rapport financier de l'incident
   - d) Rien, il s'agit d'une étape purement administrative sans effet pratique

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. L'isolement automatique d'un poste par l'EDR suffit à lui seul à constituer une phase de confinement complète et rigoureuse. — **Faux** (section 79.5, la préservation forensic reste également nécessaire).
2. La phase de récupération s'appuie directement sur les stratégies de sauvegarde déjà établies au chapitre 27. — **Vrai**.
3. Un plan de réponse à incident, une fois rédigé, n'a pas besoin d'être testé avant qu'un incident réel ne survienne. — **Faux** (section "En entreprise", exercices de simulation recommandés).
4. Un incident similaire à un incident déjà survenu peut se reproduire si le retour d'expérience du premier incident n'a jamais été suivi d'actions concrètes. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique en quoi la maturité technique accumulée tout au long de la Partie 12 (SIEM, IDS/IPS, EDR) aurait pu changer chacune des six phases de la réponse à l'incident du chapitre 4, phase par phase.
2. Un collègue affirme qu'une fois un incident correctement confiné et éradiqué, la réponse à incident est terminée et le retour d'expérience constitue une formalité optionnelle. Discute cette affirmation.

**Corrigé 1** : en préparation, un plan écrit et des rôles définis auraient remplacé l'improvisation originale. En identification, le SIEM (chapitre 74), l'IDS/IPS (chapitre 75) et l'EDR (chapitre 76) auraient détecté l'intrusion à des étapes bien plus précoces que la découverte par les utilisateurs — potentiellement dès la phase de reconnaissance réseau ou dès les premières secondes de chiffrement. En confinement, l'isolement automatique de l'EDR (section 76.4) aurait contenu la propagation immédiatement, tout en préservant l'état du système pour analyse. En éradication, une compréhension précise de la cause (l'accès RDP exposé) aurait permis une correction ciblée plutôt qu'un nettoyage incertain. En récupération, une restauration depuis une sauvegarde testée (chapitre 27) aurait remplacé toute tentative de réparation d'un système potentiellement encore compromis. En retour d'expérience, l'incident aurait directement nourri une révision de l'inventaire des actifs et de l'analyse de risque, fermant la boucle vers la fonction Identifier du NIST CSF.

**Corrigé 2** : cette affirmation sous-estime gravement la valeur du retour d'expérience, déjà établie à la section 79.8 comme le mécanisme reliant directement la réponse à incident au cycle continu d'amélioration de la sécurité de l'organisation. Un incident confiné et éradiqué sans retour d'expérience formel laisse la cause profonde potentiellement non traitée à un niveau organisationnel — comme un actif mal identifié dans son niveau de risque réel, ou une lacune de détection non comblée. Le symptôme diagnostiqué dans ce chapitre (un incident similaire qui se reproduit) illustre précisément ce risque : sans retour d'expérience suivi d'actions concrètes, rien ne garantit qu'une cause organisationnelle similaire ne sera pas exploitée de nouveau, rendant le retour d'expérience aussi essentiel que les phases techniques de confinement et d'éradication, pas une simple formalité administrative optionnelle.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 79.1</span>

Rédige un plan de réponse à incident minimal (une page) pour l'entreprise du fil rouge, couvrant au minimum les rôles responsables de chaque phase et les contacts à alerter en cas d'incident critique.
</div>

**Corrigé (exemple de réponse) :** **Préparation** : le plan est révisé annuellement et après tout changement majeur d'infrastructure, avec un exercice de simulation semestriel. **Identification** : toute alerte critique du SIEM, de l'IDS/IPS ou de l'EDR est immédiatement transmise à l'équipe sécurité d'astreinte, chargée de confirmer ou d'écarter l'incident sous 30 minutes. **Confinement** : l'équipe sécurité d'astreinte est seule autorisée à décider d'un isolement de système, en capturant systématiquement une image du système avant toute action de nettoyage. **Éradication et récupération** : l'équipe infrastructure intervient une fois la cause confirmée, en s'appuyant sur les sauvegardes testées disponibles. **Communication** : la RSSI est informée immédiatement de tout incident critique confirmé, et décide de l'escalade éventuelle vers la direction ou les autorités compétentes selon la nature de l'incident. **Retour d'expérience** : un rapport de retour d'expérience est rédigé sous deux semaines suivant la clôture de tout incident critique, avec des actions correctives assignées et suivies jusqu'à leur clôture effective.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 79.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucun système compromis n'est nettoyé ou réinstallé sans capture préalable d'une image forensic, en t'appuyant sur le risque décrit à la section 79.6.
</div>

**Corrigé (exemple de réponse) :** Avant toute action de nettoyage, de réinstallation ou de suppression de fichiers sur un système identifié comme compromis, une image complète de son état (mémoire vive et disque) sera systématiquement capturée et conservée selon une chaîne de custody documentée. Cette capture sera réalisée par une personne formée aux bases du forensic numérique, garantissant qu'elle ne compromette pas elle-même l'intégrité des preuves collectées. Aucune exception ne sera tolérée à cette règle, même sous la pression d'une remise en service rapide du système concerné, l'urgence opérationnelle ne devant jamais l'emporter sur la préservation de preuves potentiellement essentielles à la compréhension complète de l'incident et à la prévention de sa réapparition.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi une réponse à incident improvisée reproduit les faiblesses déjà constatées au chapitre 4.</li>
<li>☐ Je sais nommer et expliquer les six phases d'une réponse à incident structurée.</li>
<li>☐ Je comprends comment le SIEM, l'IDS/IPS et l'EDR interviennent concrètement lors de la phase d'identification.</li>
<li>☐ Je sais expliquer pourquoi le confinement doit préserver les preuves plutôt que de simplement éteindre un système compromis.</li>
<li>☐ Je comprends les notions de base du forensic : préservation des preuves et chaîne de custody.</li>
<li>☐ Je sais expliquer comment le retour d'expérience boucle vers la fonction Identifier du NIST CSF.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Une petite organisation a-t-elle réellement besoin d'un plan de réponse à incident aussi formalisé ?</dt>
<dd>Le niveau de formalisme peut être adapté à la taille de l'organisation, mais les principes fondamentaux (rôles définis à l'avance, préservation des preuves, retour d'expérience) restent pertinents même pour une structure modeste — l'absence totale de préparation, quelle que soit la taille de l'organisation, reproduit systématiquement le risque d'improvisation déjà illustré au chapitre 4.</dd>

<dt>Faut-il toujours faire appel à un expert forensic externe en cas d'incident majeur ?</dt>
<dd>Pour un incident particulièrement complexe ou aux implications légales significatives, une expertise externe spécialisée apporte souvent une rigueur et une expérience que l'équipe interne pourrait ne pas posséder — une décision à anticiper dans le plan de préparation plutôt qu'à improviser au moment de l'incident.</dd>

<dt>Combien de temps faut-il conserver les preuves forensic après un incident ?</dt>
<dd>La durée de conservation dépend souvent d'exigences légales ou réglementaires applicables à l'organisation, et peut être significativement plus longue que la durée de rétention standard des logs déjà évoquée au chapitre 62 — une politique spécifique de conservation des preuves forensic mérite d'être définie séparément.</dd>

<dt>Ce chapitre clôt-il définitivement le sujet de la cybersécurité dans ce manuel ?</dt>
<dd>Non, la Partie 12 pose les fondations conceptuelles et procédurales de la cybersécurité et de la gouvernance ; la Partie 13, consacrée au projet final, mettra en application l'ensemble des connaissances de ce manuel — administration système, réseau, virtualisation, cloud, automatisation, supervision et sécurité — dans la conception complète d'une infrastructure hybride pour une entreprise de 300 employés.</dd>
</dl>

## Références et pour aller plus loin

- NIST — Computer Security Incident Handling Guide (SP 800-61) : [https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final)
- SANS Institute — Incident Handler's Handbook : [https://www.sans.org/white-papers/33901/](https://www.sans.org/white-papers/33901/)

*Cette partie du manuel se termine ici. La Partie 13 s'ouvre sur le projet final — la conception complète d'une infrastructure hybride pour une entreprise de 300 employés, multi-sites, mobilisant l'ensemble des connaissances accumulées à travers ce manuel, de l'architecture Active Directory jusqu'à la cybersécurité et la gouvernance.*
