<div class="chapitre-titre-num">CHAPITRE 9</div>

# L'étude de site professionnelle

## Objectifs pédagogiques

Conduire une étude de site complète, de la préparation avant la visite jusqu'au rapport final, sans oublier une seule mesure ou une seule question qui coûterait cher à découvrir seulement au moment de l'installation.

## Prérequis

Volumes 1-2.

## OBJECTIF

Recueillir, avant de concevoir quoi que ce soit (Volume 3-4), toutes les informations physiques et fonctionnelles nécessaires pour dimensionner correctement un projet réseau : dimensions réelles, contraintes du bâtiment, besoins exprimés par le client, emplacements envisageables pour chaque équipement.

## PRÉREQUIS

Un premier contact commercial déjà établi avec le client (l'étude de site n'est jamais la toute première prise de contact, mais l'étape qui suit un accord de principe sur le projet).

## MATÉRIEL NÉCESSAIRE

- Plans du bâtiment (si disponibles auprès du client — architecte, syndic, service technique) ;
- appareil photo (le smartphone suffit, mais avec un espace de stockage vérifié à l'avance) ;
- télémètre laser (bien plus rapide et fiable qu'un mètre ruban sur de grandes distances) ;
- testeur de câble réseau (pour vérifier l'état d'un câblage existant à réutiliser) ;
- testeur/certificateur réseau si le client dispose déjà d'une infrastructure à auditer ;
- ordinateur portable ;
- un mètre ruban classique en complément (recoins que le télémètre laser ne peut pas viser) ;
- une lampe torche (locaux techniques, faux plafonds, gaines) ;
- des étiquettes ou un marqueur (pour repérer temporairement les points mesurés).

## LOGICIELS NÉCESSAIRES

- Un outil de prise de notes structurées (traitement de texte ou tableur) ;
- un outil de dessin de plan simple (même un simple éditeur de schéma, la précision fine viendra au Volume 6) ;
- le questionnaire client de la section 9.2, imprimé ou en version numérique consultable hors ligne (la connexion Internet sur site n'est pas garantie).

## 9.1 Pourquoi cette étape ne peut jamais être sautée

<div class="encadre attention">
<span class="encadre-titre">⚠️ Concevoir un réseau sans étude de site, c'est deviner</span>
Un technicien qui accepte de chiffrer et concevoir un projet uniquement sur la base d'un appel téléphonique ("on est environ 80, on veut des caméras") prend un risque majeur : distance réelle entre le local technique et le poste le plus éloigné dépassant la limite de 100 m du cuivre (chapitre 2.10) découverte seulement le jour de l'installation, mur porteur empêchant le passage prévu, absence de prise électrique là où une caméra devait être installée, local technique sans climatisation adaptée à la charge thermique des équipements retenus... Chacune de ces découvertes tardives coûte du temps, de l'argent, et la confiance du client. L'étude de site n'est jamais une formalité — c'est l'étape qui évite tout cela.
</div>

## AVANT LA VISITE

### Étape 1 — Préparer le questionnaire client

Envoyer, ou préparer à poser en entretien, un questionnaire structuré couvrant chaque domaine du projet.

**Besoins généraux**

- Combien de personnes travaillent sur le site aujourd'hui, et quelle croissance est anticipée sur 3 à 5 ans ?
- Quels sont les horaires d'activité (24 h/24, horaires de bureau classiques) ?
- Existe-t-il déjà une infrastructure réseau ? Si oui, doit-elle être conservée en partie, ou tout est-il à refaire ?
- Quel est le budget approximatif envisagé, et existe-t-il une contrainte de délai ferme ?

**Besoins réseau et postes**

- Combien de postes de travail fixes, combien de portables/mobiles ?
- Y a-t-il des services à isoler les uns des autres (comptabilité, direction, R&D...) ?
- Téléphonie sur IP envisagée ? Combien de lignes ?
- Serveurs déjà existants ou à prévoir (fichiers, applicatif métier, sauvegarde) ?
- Wi-Fi corporate nécessaire ? Wi-Fi invité nécessaire (salle de réunion, accueil) ?

**Besoins de vidéosurveillance**

- Quelles zones doivent être couvertes (entrées, parkings, entrepôt, caisses, zones sensibles) ?
- Durée de conservation des enregistrements souhaitée (contrainte légale locale à vérifier, chapitre 33) ?
- Qui doit avoir accès à la consultation (sur site uniquement, à distance depuis un smartphone) ?
- Y a-t-il déjà des caméras existantes à conserver ou remplacer ?

**Contraintes et existant**

- Le bâtiment est-il en location (contraintes sur le perçage/câblage apparent) ou en propriété ?
- Existe-t-il un local technique dédié, ou faut-il en prévoir un ?
- Contraintes horaires d'intervention (site en activité continue, zones interdites en journée) ?

### Étape 2 — Réunir les plans disponibles

Demander au client tout plan existant du bâtiment (architecte, syndic, service technique, ou même un simple plan dessiné à la main par le client) — même approximatif, un plan de départ accélère considérablement la prise de mesures sur site.

### Étape 3 — Préparer le matériel

Vérifier la liste du matériel ci-dessus la veille de la visite : batterie du télémètre laser, espace de stockage du smartphone, questionnaire imprimé en secours si le portable tombe en panne.

## PENDANT LA VISITE

### Étape 4 — Parcourir le site pièce par pièce, méthodiquement

Ne jamais improviser un parcours au hasard : suivre un ordre systématique (par exemple, étage par étage, dans le sens des aiguilles d'une montre à chaque étage) et cocher chaque pièce visitée sur le plan au fur et à mesure — c'est la seule façon de garantir qu'aucune pièce n'est oubliée.

### Étape 5 — Mesurer

- **Dimensions** : longueur, largeur, hauteur sous plafond de chaque zone (la hauteur conditionne le choix et le positionnement des caméras, Volume 12) ;
- **Distances** : du local technique envisagé jusqu'au point le plus éloigné de chaque zone (vérifier la limite des 100 m du câblage cuivre, chapitre 2.10 — au-delà, la fibre optique ou un local technique secondaire devient nécessaire) ;
- **Emplacement de la baie/du local technique** envisagé : accessibilité, sécurité physique (porte verrouillable ?), présence d'une arrivée électrique dédiée ;
- **Emplacements envisageables pour chaque caméra** : hauteur disponible, angle de vue, present d'obstacles (piliers, végétation, enseignes) ;
- **Emplacements envisageables pour chaque borne Wi-Fi** : centralité par rapport à la zone à couvrir, présence de murs porteurs ou de matériaux atténuants (béton armé, métal) sur le trajet du signal ;
- **Chemins de câbles existants** (faux plafond, goulottes, gaines techniques) réutilisables, et chemins à créer.

### Étape 6 — Vérifier l'alimentation électrique

- Nombre de prises disponibles dans le local technique envisagé, et leur ampérage ;
- présence d'un tableau électrique dédié ou à prévoir pour la baie (Volume 6) ;
- faisabilité d'un onduleur (UPS) — espace au sol, ventilation.

### Étape 7 — Vérifier la climatisation du futur local technique

Un local technique fermé sans ventilation ni climatisation devient rapidement surchauffé une fois les équipements actifs installés (switches, serveurs, NVR) — un point de vigilance central du Volume 6 (installation de la baie) qui doit être identifié dès l'étude de site, avant que le choix du local ne soit définitivement validé avec le client.

### Étape 8 — Vérifier la sécurité physique

- La porte du futur local technique est-elle verrouillable ?
- Le local est-il à l'abri d'un risque d'inondation (jamais au sous-sol dans une zone inondable, jamais sous une arrivée d'eau) ?
- Y a-t-il un risque d'accès non autorisé (local partagé avec un autre usage, accessible au public) ?

### Étape 9 — Photographier systématiquement

Chaque zone mesurée, chaque emplacement envisagé pour un équipement, chaque point de passage de câblage existant ou prévu — les photos, associées aux mesures notées, sont indispensables à la rédaction du rapport (étape suivante) et resteront une référence tout au long du projet, y compris pour la documentation finale du client (Volume 15).

## APRÈS LA VISITE

### Étape 10 — Produire le rapport de visite

Le rapport de visite consolide, sous une forme exploitable pour l'étape de conception (chapitre 10 et Volume 4), l'ensemble des informations recueillies :

1. **Rapport narratif** : synthèse de la visite, contexte du client, contraintes principales identifiées.
2. **Plan annoté** : le plan du bâtiment (fourni par le client ou redessiné) avec les mesures relevées, l'emplacement retenu pour le local technique, les emplacements envisagés pour les caméras et les bornes Wi-Fi.
3. **Inventaire de l'existant** : tout équipement réseau déjà en place, avec son état (à conserver, à remplacer).
4. **Besoins consolidés** : la synthèse chiffrée du questionnaire client (nombre de postes, caméras, VLAN à prévoir), qui alimentera directement le recensement des besoins du chapitre 8.
5. **Contraintes identifiées** : limites de distance, murs porteurs, absence de climatisation, contraintes horaires d'intervention.
6. **Recommandations préliminaires** : premières pistes techniques (par exemple, "la distance entre le local technique et l'entrepôt dépasse 100 m — une liaison fibre sera nécessaire").

## RÉSULTAT ATTENDU

Un dossier complet (rapport + plan annoté + photos + inventaire + besoins consolidés) suffisamment précis pour que la phase de conception (chapitre 10) puisse démarrer sans avoir besoin de retourner sur site pour une information manquante.

## VÉRIFICATION

Avant de considérer l'étude de site terminée, relire le dossier produit et vérifier qu'il répond, sans exception, à la checklist complète ci-dessous.

## CHECKLIST DE FIN — étude de site complète

- [ ] Questionnaire client entièrement rempli (besoins généraux, réseau, vidéosurveillance, contraintes)
- [ ] Plan du bâtiment obtenu ou redessiné, à l'échelle ou avec cotes indiquées
- [ ] Dimensions de chaque zone mesurées (longueur, largeur, hauteur sous plafond)
- [ ] Distance du local technique envisagé à chaque point le plus éloigné mesurée
- [ ] Emplacement du local technique validé (accessibilité, sécurité, climatisation, électricité)
- [ ] Emplacements envisagés pour chaque caméra notés et photographiés
- [ ] Emplacements envisagés pour chaque borne Wi-Fi notés et photographiés
- [ ] Chemins de câbles existants et à créer identifiés
- [ ] Alimentation électrique du local technique vérifiée (nombre de prises, ampérage)
- [ ] Climatisation/ventilation du local technique évaluée
- [ ] Sécurité physique du local technique vérifiée (porte verrouillable, absence de risque d'inondation)
- [ ] Inventaire de l'existant réalisé (équipements déjà en place, état, à conserver ou remplacer)
- [ ] Rapport de visite rédigé et remis en interne pour la phase de conception

## DÉPANNAGE

### Si une information manque après la visite

Ne jamais deviner ni supposer une valeur pour combler un manque (chapitre 32) : reprendre contact avec le client pour clarifier, ou planifier une visite complémentaire ciblée sur le point manquant plutôt que de démarrer la conception avec une hypothèse non vérifiée.

### Si le client ne peut fournir aucun plan du bâtiment

Redessiner un plan à main levée pendant la visite, avec les mesures prises au télémètre laser directement reportées dessus — un plan approximatif mais mesuré reste largement suffisant pour démarrer la conception, contrairement à l'absence totale de plan.

## SAUVEGARDE

Conserver le dossier complet de l'étude de site (photos, mesures, questionnaire rempli, rapport) dans le dossier de projet dès sa production — il sera réutilisé tel quel dans la documentation finale remise au client (Volume 15), qui exige justement de pouvoir retracer les décisions prises depuis l'origine du projet.

## Résumé du chapitre

L'étude de site se déroule en trois temps : avant la visite (préparer le questionnaire, réunir les plans, préparer le matériel), pendant la visite (mesurer méthodiquement chaque zone, vérifier l'alimentation, la climatisation et la sécurité du futur local technique, photographier systématiquement), après la visite (produire un rapport complet — narratif, plan annoté, inventaire, besoins consolidés, recommandations). La checklist de fin garantit qu'aucune information nécessaire à la conception n'a été oubliée.

*Chapitre suivant : des besoins à l'architecture — la méthode de décision technique qui transforme le dossier d'étude de site en un premier schéma d'architecture réseau.*
