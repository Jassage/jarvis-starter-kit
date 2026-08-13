<div class="chapitre-titre-num">CHAPITRE 74</div>

# SIEM : centralisation et corrélation d'événements

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Centraliser et corréler les événements de sécurité de l'ensemble de l'infrastructure, au-delà de la simple centralisation des logs déjà couverte à la Partie 10 de ce manuel. À la fin de ce chapitre, tu comprendras la différence entre un système de centralisation de logs (ELK, Graylog) et un SIEM, tu sauras construire une règle de corrélation combinant plusieurs sources, et tu comprendras comment un SIEM formalise concrètement la fonction Détecter du NIST CSF déjà présentée au chapitre 71.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Une simulation d'intrusion menée par un prestataire externe reproduit un scénario réaliste : une tentative de connexion échouée sur un compte Active Directory (chapitre 23), suivie quelques minutes plus tard d'une connexion réussie sur ce même compte depuis une adresse IP inhabituelle, puis d'un volume de trafic sortant anormalement élevé détecté par le pare-feu Fortinet (chapitre 66). Chacun de ces trois événements, pris isolément dans Graylog ou dans les journaux Zabbix, semble mineur — une tentative échouée parmi tant d'autres, une connexion normale, un pic de trafic ponctuel. <em>"Aucune de vos alertes actuelles ne se serait déclenchée,"</em> conclut le rapport du prestataire, <em>"parce qu'aucun de vos outils ne relie ces trois événements entre eux."</em> C'est précisément le rôle d'un SIEM.
</div>

## 74.1 Le problème : des signaux épars, chacun anodin isolément

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le constat du scénario d'ouverture</span>
Une attaque réelle se manifeste rarement par un seul événement spectaculaire et évident — elle se compose généralement d'une séquence de signaux individuellement discrets, chacun explicable isolément par une activité normale. La centralisation des logs (Partie 10) rend ces événements consultables, mais ne les relie pas automatiquement entre eux — un analyste devrait chercher manuellement la corrélation, un exercice peu réaliste face au volume d'événements générés quotidiennement par une infrastructure entière.
</div>

## 74.2 SIEM : au-delà de la centralisation, la corrélation

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — assembler les pièces d'un puzzle, pas seulement les collectionner</span>
Un système de centralisation de logs comme Graylog ou ELK (chapitres 62-63) collectionne les pièces d'un puzzle et permet de les consulter individuellement. Un **SIEM** (Security Information and Event Management) va plus loin : il applique des règles de corrélation reliant automatiquement plusieurs événements distincts, potentiellement issus de sources différentes, pour révéler un scénario d'attaque cohérent qu'aucun événement isolé ne suffirait à démontrer — assemblant activement les pièces du puzzle plutôt que de se contenter de les collectionner.
</div>

## 74.3 Règles de corrélation : combiner plusieurs sources

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — répondre directement au scénario d'ouverture</span>
Une règle de corrélation SIEM définit une séquence ou une combinaison d'événements qui, ensemble, constituent un indicateur de compromission bien plus fort que chacun pris séparément. Pour le scénario d'ouverture, une règle pourrait se formuler ainsi : "une connexion réussie sur un compte ayant connu un échec récent, suivie dans les quinze minutes d'un volume de trafic sortant dépassant un seuil normal depuis le poste concerné" — une combinaison que ni Active Directory seul, ni le pare-feu seul, ne pouvaient détecter.
</div>

```
regle: connexion-suspecte-puis-exfiltration
  si:
    - evenement AD: echec_authentification(compte=X)
    - suivi_de evenement AD: succes_authentification(compte=X) dans les 30min
    - suivi_de evenement pare-feu: trafic_sortant(source=poste_de(X)) > seuil dans les 15min
  alors:
    severite: critique
    action: alerter equipe securite + isoler le poste
```

## 74.4 S'appuyer sur les sources déjà en place

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Un SIEM ne remplace pas la Partie 10, il s'appuie dessus</span>
Un SIEM n'exige généralement pas de reconstruire toute l'infrastructure de collecte — il s'intègre aux sources déjà en place : les journaux Active Directory déjà accessibles via les outils du chapitre 23, les événements du pare-feu Fortinet déjà centralisés via Graylog (chapitres 63 et 66), les logs applicatifs déjà indexés dans ELK (chapitre 62). Le SIEM ajoute une couche de corrélation par-dessus ces sources existantes, plutôt que de les dupliquer ou de les remplacer.
</div>

## 74.5 Reconnaître un scénario d'attaque en plusieurs étapes

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect du chapitre 4</span>
Une intrusion réelle, comme celle exploitant l'accès RDP exposé au chapitre 4, se déroule généralement en plusieurs étapes distinctes : reconnaissance, accès initial, escalade de privilèges, puis action finale (chiffrement, exfiltration). Un SIEM correctement configuré peut détecter cette progression à travers ses différentes étapes, offrant une chance de contenir l'attaque avant l'étape finale — une capacité de détection précoce qu'aucun outil isolé ne peut offrir seul, chaque étape individuelle restant potentiellement trop discrète pour déclencher une alerte à elle seule.
</div>

## 74.6 Faux positifs et calibrage des règles

<div class="encadre attention">
<span class="encadre-titre">⚠️ Encore le même piège, rencontré pour la sixième fois dans ce manuel</span>
Une règle de corrélation trop sensible génère un grand nombre de faux positifs — des combinaisons d'événements légitimes ressemblant superficiellement à un scénario d'attaque, comme un employé se trompant de mot de passe avant de se reconnecter correctement puis de télécharger un fichier volumineux légitime. Exactement le même risque de fatigue d'alerte déjà rencontré à plusieurs reprises dans ce manuel (sections 58.7, 59.5, 60.6, 61.5, 63.5) s'applique aux règles SIEM : un calibrage soigneux, affiné progressivement à partir de l'expérience réelle de l'environnement, reste indispensable pour que les analystes continuent à prendre chaque alerte au sérieux.
</div>

## 74.7 Le SIEM comme formalisation de la fonction Détecter

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct du chapitre 71</span>
Un SIEM constitue l'outillage technique le plus abouti de la fonction **Détecter** du NIST CSF (chapitre 71) — il ne se contente pas de collecter passivement des événements, mais applique une analyse active continue cherchant explicitement des schémas d'attaque connus. Adopter un SIEM représente ainsi un investissement concret et mesurable dans une fonction du cadre déjà identifiée, lors de l'exercice de cartographie du chapitre 71, comme potentiellement moins développée que la fonction Protéger.
</div>

## Atelier — Détecter le scénario du prestataire externe

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 74 — Construire la règle manquante du scénario d'ouverture</span>

**Objectif** : construire une règle de corrélation SIEM détectant le scénario précis identifié par le prestataire externe dans le scénario d'ouverture.

**Préparation** : un SIEM intégré aux journaux Active Directory et aux journaux du pare-feu Fortinet, déjà centralisés.

**Étapes détaillées** :

1. Décompose le scénario d'attaque en trois événements distincts et identifiables (section 74.3).
2. Définis une fenêtre temporelle raisonnable entre chaque événement de la séquence.
3. Détermine la sévérité appropriée pour cette règle et l'action associée (alerte simple, ou action automatique comme l'isolement du poste concerné).
4. Explique pourquoi une fenêtre temporelle trop large risquerait de générer des faux positifs, et une fenêtre trop courte risquerait de manquer l'attaque réelle.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la règle de corrélation combine les trois événements identifiés (échec puis succès d'authentification, suivi d'un trafic sortant anormal) avec une fenêtre temporelle de quelques dizaines de minutes, proportionnée à la vitesse réaliste d'une progression d'attaque. Une fenêtre trop large (plusieurs heures) risquerait de relier des événements sans rapport réel entre eux, provoquant des faux positifs ; une fenêtre trop courte (quelques secondes) risquerait de manquer une attaque se déroulant à un rythme légèrement plus lent que prévu, ne validant jamais la condition de séquence. Cette règle, une fois en place, aurait permis de détecter automatiquement le scénario que le prestataire externe a dû, dans les faits, reconstituer manuellement après coup.

**Dépannage** : si la règle de corrélation ne se déclenche jamais malgré un scénario de test reproduisant fidèlement les conditions prévues, vérifie que les horodatages des différentes sources d'événements (Active Directory, pare-feu) sont bien synchronisés — un décalage d'horloge entre systèmes (rappel indirect du chapitre 23) peut faire échouer une corrélation basée sur une fenêtre temporelle précise.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un SIEM déployé, mais aucune règle de corrélation réellement configurée</span>
Un SIEM utilisé uniquement comme un système de centralisation de logs, sans exploiter sa capacité de corrélation, n'apporte aucun bénéfice au-delà de ce que Graylog ou ELK offrent déjà — reproduisant exactement le problème du scénario d'ouverture malgré l'investissement dans l'outil.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — un nombre excessif de règles mal calibrées, provoquant une fatigue d'alerte</span>
Rappel de la section 74.6 : le même risque déjà rencontré à de multiples reprises dans ce manuel, avec un enjeu particulièrement élevé pour des alertes de sécurité potentiellement critiques.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des sources critiques non intégrées au SIEM, créant des angles morts</span>
Un SIEM ne peut corréler que les sources qu'il ingère réellement — une source de logs critique restée hors du périmètre d'intégration crée un angle mort dans lequel une étape entière d'une attaque pourrait passer totalement inaperçue.
</div>

## Diagnostiquer une attaque passée inaperçue malgré un SIEM en place

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une intrusion réelle est découverte après coup, malgré la présence d'un SIEM opérationnel</span>

- **Diagnostic** : vérifier si une règle de corrélation couvrant ce scénario précis existait réellement, si toutes les sources d'événements nécessaires à cette règle étaient effectivement intégrées, et si les horodatages des différentes sources étaient correctement synchronisés.
- **Comment vérifier** : reconstituer manuellement, a posteriori, la séquence d'événements de l'intrusion découverte, et vérifier si une règle de corrélation existante aurait dû, en théorie, se déclencher sur cette séquence exacte.
- **Résolution** : combler la lacune identifiée — création d'une nouvelle règle de corrélation couvrant ce scénario précis, intégration d'une source manquante, ou correction d'un problème de synchronisation temporelle.
</div>

## En entreprise

- **Bonne pratique répandue** : construire progressivement les règles de corrélation à partir de scénarios d'attaque réalistes et documentés (comme le résultat d'une simulation d'intrusion), plutôt que de tenter de couvrir tous les scénarios théoriquement possibles dès le départ.
- **Bonne pratique répandue** : réviser périodiquement les règles de corrélation existantes à la lumière de nouveaux incidents ou de nouvelles simulations, affinant leur calibrage au fil du temps.
- **Erreur classique observée** : un SIEM acquis à grand coût pour répondre à une exigence de conformité, mais dont la configuration des règles de corrélation est déléguée entièrement au fournisseur lors de l'installation initiale, sans jamais être adaptée au contexte réel et évolutif de l'organisation par la suite.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence fondamentale entre un système de centralisation de logs comme ELK ou Graylog et un SIEM ?"**
Réponse attendue : la centralisation de logs collecte et rend consultables les événements ; un SIEM ajoute une couche de corrélation active, reliant automatiquement plusieurs événements distincts, potentiellement issus de sources différentes, pour révéler un scénario d'attaque cohérent qu'aucun événement isolé ne suffirait à démontrer.

**Q2. "Pourquoi une attaque réelle peut-elle passer inaperçue malgré l'existence d'alertes individuelles sur chaque type d'événement ?"**
Réponse attendue : une attaque se compose généralement d'une séquence de signaux individuellement discrets et explicables par une activité normale ; sans corrélation entre ces signaux, aucune alerte individuelle ne se déclenche, chaque événement restant sous le seuil de détection pris isolément.

**Q3. "Comment un SIEM se rattache-t-il au NIST CSF présenté au chapitre 71 ?"**
Réponse attendue : un SIEM constitue l'outillage technique le plus abouti de la fonction Détecter du cadre, appliquant une analyse active continue plutôt qu'une simple collecte passive d'événements.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Intègre systématiquement toute nouvelle source de logs critique au périmètre du SIEM dès sa mise en place, plutôt que de considérer cette intégration comme une amélioration optionnelle réalisable ultérieurement.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente la justification et le contexte de chaque règle de corrélation créée — un scénario d'attaque réel ou simulé ayant motivé sa création — facilitant sa révision future et évitant l'accumulation de règles obsolètes dont plus personne ne comprend le fondement.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un SIEM traitant un volume élevé d'événements en temps réel nécessite des ressources de traitement significatives — dimensionne l'infrastructure sous-jacente en fonction du volume réel d'événements attendu, particulièrement à mesure que de nouvelles sources sont intégrées au fil du temps.
</div>

## Résumé du chapitre

- Une attaque réelle se compose généralement d'une séquence de signaux individuellement discrets, chacun explicable isolément par une activité normale.
- Un SIEM applique des règles de corrélation reliant automatiquement plusieurs événements distincts pour révéler un scénario d'attaque cohérent.
- Un SIEM s'appuie sur les sources de centralisation déjà en place (Graylog, ELK, journaux Active Directory, pare-feu) plutôt que de les remplacer.
- Les règles de corrélation nécessitent un calibrage soigneux pour éviter la fatigue d'alerte, un piège rencontré à de multiples reprises dans ce manuel.
- Un SIEM constitue l'outillage technique le plus abouti de la fonction Détecter du NIST CSF déjà présenté au chapitre 71.
- Une source critique non intégrée au SIEM crée un angle mort dans lequel une étape entière d'une attaque pourrait passer inaperçue.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La principale différence entre un SIEM et un système de centralisation de logs comme ELK est :
   - a) Le SIEM ne collecte aucun log, contrairement à ELK
   - b) Le SIEM ajoute une corrélation active entre plusieurs événements, au-delà de la simple centralisation
   - c) ELK est toujours plus coûteux qu'un SIEM
   - d) Le SIEM remplace le besoin de tout pare-feu

2. Dans le scénario d'ouverture, pourquoi aucune alerte individuelle ne s'est-elle déclenchée ?
   - a) Aucun outil de supervision n'était en place
   - b) Chaque événement, pris isolément, restait explicable par une activité normale
   - c) Le pare-feu était mal configuré
   - d) Les journaux Active Directory n'étaient pas centralisés

3. Un SIEM constitue l'outillage le plus abouti de quelle fonction du NIST CSF ?
   - a) Identifier
   - b) Protéger
   - c) Détecter
   - d) Récupérer

**Corrigé** : 1-b, 2-b, 3-c.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un SIEM nécessite généralement de reconstruire entièrement l'infrastructure de collecte de logs déjà en place. — **Faux** (section 74.4).
2. Une règle de corrélation trop sensible peut provoquer une fatigue d'alerte, réduisant l'attention portée aux alertes réellement critiques. — **Vrai**.
3. Une source de logs critique non intégrée au SIEM ne crée aucun risque, tant que les autres sources sont bien couvertes. — **Faux** (section "Erreur n°3").
4. Un décalage d'horloge entre systèmes peut faire échouer une règle de corrélation basée sur une fenêtre temporelle précise. — **Vrai** (atelier, dépannage).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le prestataire externe du scénario d'ouverture a pu reconstituer manuellement le scénario d'attaque, alors que les outils de supervision de l'entreprise ne l'ont pas détecté automatiquement.
2. Un collègue propose de créer une règle de corrélation extrêmement large, déclenchant une alerte dès qu'un employé se connecte depuis une nouvelle adresse IP, "pour ne rater aucune intrusion possible". Discute le risque de cette proposition.

**Corrigé 1** : le prestataire externe disposait, après coup, de la connaissance complète de la séquence d'événements qu'il avait lui-même orchestrée dans le cadre de la simulation — une information que les outils de supervision de l'entreprise n'avaient pas a priori. Ces outils, dans leur état au moment du scénario, centralisaient bien chaque événement individuellement (Active Directory, pare-feu) mais n'appliquaient aucune règle de corrélation reliant ces événements entre eux en temps réel. Un analyste humain aurait théoriquement pu détecter la même séquence en consultant manuellement chaque source, mais un tel exercice manuel, exhaustif et continu, reste irréaliste face au volume d'événements générés quotidiennement par une infrastructure entière — exactement le problème qu'un SIEM automatise et résout.

**Corrigé 2** : une connexion depuis une nouvelle adresse IP reste un événement extrêmement fréquent et généralement légitime — un employé en déplacement, travaillant depuis son domicile, ou utilisant une connexion mobile génère régulièrement ce type d'événement sans qu'aucune intrusion ne soit en cours. Une règle aussi large générerait un volume considérable d'alertes sans réelle valeur discriminante, provoquant rapidement la même fatigue d'alerte déjà dénoncée à la section 74.6 — les analystes finiraient par ignorer systématiquement ce type d'alerte, y compris lorsqu'elle signalerait effectivement une intrusion réelle. Une règle plus pertinente combinerait ce signal avec d'autres éléments contextuels plus discriminants (comme dans l'exemple du scénario d'ouverture), plutôt que de se fier à un seul indicateur aussi fréquent et peu spécifique pris isolément.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 74.1</span>

Propose une règle de corrélation SIEM pour détecter une tentative de mouvement latéral après une compromission initiale, combinant un événement d'authentification Active Directory et un événement de connexion réseau inhabituelle entre deux serveurs internes qui ne communiquent normalement pas entre eux.
</div>

**Corrigé :** La règle pourrait se formuler ainsi : "une authentification réussie sur un compte à privilèges élevés (chapitre 22), suivie dans les dix minutes d'une connexion réseau initiée depuis le poste de ce compte vers un serveur avec lequel ce compte n'a historiquement jamais communiqué, alors sévérité critique, alerter l'équipe sécurité et documenter la connexion réseau observée". Cette règle combine un événement d'identité (Active Directory) et un événement réseau (pare-feu ou capture, chapitre 64), reproduisant exactement le même principe de corrélation multi-source déjà illustré dans le scénario d'ouverture de ce chapitre — un mouvement latéral, étape typique d'une progression d'attaque après un accès initial (rappel de la section 74.5), se manifeste rarement par un seul signal isolé suffisamment distinctif pour être détecté sans corrélation.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 74.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant que chaque nouvelle règle de corrélation créée dans le SIEM est calibrée progressivement avant d'être configurée pour déclencher une action automatique critique, en t'appuyant sur le risque décrit à la section 74.6.
</div>

**Corrigé (exemple de réponse) :** Toute nouvelle règle de corrélation sera d'abord déployée en mode d'observation, générant une alerte visible pour l'équipe sécurité sans déclencher d'action automatique critique, pendant une période d'évaluation d'au moins deux semaines. Durant cette période, chaque déclenchement de la règle sera examiné pour déterminer s'il s'agit d'un véritable positif ou d'un faux positif, permettant d'ajuster les seuils et les conditions de la règle avant son passage en mode actif. Une règle ne sera configurée pour déclencher une action automatique critique, comme l'isolement d'un poste, qu'après cette période de calibrage ayant démontré un taux de faux positifs suffisamment faible, évitant qu'une règle mal calibrée n'isole automatiquement un poste légitime et ne perturbe l'activité normale de l'entreprise.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends la différence entre un système de centralisation de logs et un SIEM.</li>
<li>☐ Je sais expliquer pourquoi une attaque réelle peut passer inaperçue sans corrélation entre événements.</li>
<li>☐ Je sais construire une règle de corrélation combinant plusieurs sources d'événements.</li>
<li>☐ Je comprends pourquoi un SIEM s'appuie sur les sources déjà centralisées plutôt que de les remplacer.</li>
<li>☐ Je sais éviter la fatigue d'alerte lors du calibrage des règles de corrélation.</li>
<li>☐ Je comprends comment un SIEM formalise concrètement la fonction Détecter du NIST CSF.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Un SIEM nécessite-t-il une équipe dédiée pour être réellement efficace ?</dt>
<dd>Un SIEM produit d'autant plus de valeur qu'une équipe dispose du temps nécessaire pour créer, calibrer et réviser régulièrement ses règles de corrélation — un SIEM installé sans cet investissement continu en personnel risque de reproduire l'erreur déjà dénoncée d'un outil déployé mais jamais réellement exploité.</dd>

<dt>Existe-t-il des règles de corrélation prêtes à l'emploi, ou faut-il toutes les construire soi-même ?</dt>
<dd>De nombreux SIEM proposent des bibliothèques de règles préconfigurées pour des scénarios d'attaque courants et connus, réduisant le travail initial — ces règles prêtes à l'emploi méritent néanmoins d'être adaptées et calibrées au contexte réel de chaque organisation, plutôt qu'appliquées telles quelles sans ajustement.</dd>

<dt>Un SIEM peut-il détecter une attaque totalement nouvelle, jamais rencontrée auparavant ?</dt>
<dd>Les règles de corrélation classiques détectent des schémas déjà identifiés et modélisés ; certains SIEM modernes intègrent également des capacités d'analyse comportementale, cherchant des anomalies statistiques sans schéma prédéfini — une capacité complémentaire, mais qui ne remplace pas l'importance des règles de corrélation ciblées présentées dans ce chapitre.</dd>

<dt>Le SIEM remplace-t-il le besoin d'un IDS/IPS, présenté au chapitre suivant ?</dt>
<dd>Non, les deux se complètent — un IDS/IPS détecte et peut bloquer des signatures d'attaque au niveau réseau en temps réel, tandis qu'un SIEM corrèle des événements provenant de sources multiples et variées ; un IDS/IPS constitue d'ailleurs souvent lui-même une source d'événements précieuse à intégrer dans un SIEM.</dd>
</dl>

## Références et pour aller plus loin

- NIST — Guide to Computer Security Log Management (SP 800-92) : [https://csrc.nist.gov/publications/detail/sp/800-92/final](https://csrc.nist.gov/publications/detail/sp/800-92/final)
- MITRE ATT&CK — Base de connaissance des tactiques et techniques d'attaque : [https://attack.mitre.org/](https://attack.mitre.org/)

*Chapitre suivant : IDS/IPS — la détection et la prévention d'intrusion au niveau réseau, une source d'événements précieuse à intégrer directement au SIEM déjà construit dans ce chapitre.*
