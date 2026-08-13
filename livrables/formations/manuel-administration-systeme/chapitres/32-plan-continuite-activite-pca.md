<div class="chapitre-titre-num">CHAPITRE 32</div>

# Plan de Continuité d'Activité (PCA)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Élargir la perspective du PRA (chapitre 31), centré sur la reprise technique, à la continuité de l'ensemble de l'activité de l'entreprise — les personnes, les processus métier, la communication — au-delà des seuls systèmes informatiques. À la fin de ce chapitre, tu sauras réaliser une analyse d'impact métier (BIA), comprendre le rôle précis que joue l'IT dans un PCA sans en être le seul acteur, et concevoir une réponse de continuité adaptée aux risques spécifiques du contexte haïtien.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un mois après l'exercice de simulation du PRA (chapitre 31), une alerte cyclonique sérieuse est émise pour Port-au-Prince, avec une évacuation recommandée des bureaux pendant 48 heures. Le PRA du chapitre 31 couvre parfaitement la reprise des systèmes informatiques en cas de sinistre technique — mais cette fois, les serveurs eux-mêmes ne sont pas menacés directement, ce sont les **personnes** qui ne peuvent plus se rendre au bureau. Le service comptabilité, dont l'activité repose sur des employés physiquement présents consultant le NAS local (chapitre 28), se retrouve incapable de travailler, alors que l'infrastructure technique elle-même reste parfaitement intacte et fonctionnelle. Le DSI réalise que le PRA, aussi solide soit-il, ne répond pas à cette situation précise — la continuité de l'**activité**, pas seulement des systèmes. C'est exactement l'objet du PCA, le sujet de ce chapitre.
</div>

## 32.1 PCA vs PRA : deux périmètres complémentaires, pas interchangeables

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la distinction posée en toutes lettres</span>
Le **PRA** (chapitre 31) répond à : "comment restaurer nos systèmes informatiques après un sinistre technique ?" Le **PCA** répond à une question plus large : "comment l'entreprise continue-t-elle à fonctionner — servir ses clients, faire travailler ses employés, honorer ses obligations — malgré une perturbation majeure, qu'elle soit technique, humaine ou physique ?" Le scénario d'ouverture illustre précisément cette différence : les systèmes n'ont subi aucun sinistre, mais l'activité est quand même menacée d'interruption.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le PRA répare le pont, le PCA fait traverser la rivière autrement en attendant</span>
Si le PRA répare un pont endommagé pour rétablir la route habituelle, le PCA se demande comment les gens et les marchandises continuent de traverser la rivière **pendant** que le pont est en réparation — un bac de traversée temporaire, un itinéraire alternatif, ou simplement la décision consciente que certains déplacements peuvent attendre. Le PCA ne remplace jamais le PRA (le pont doit quand même être réparé), il couvre la période et les besoins que le PRA seul ne couvre pas.
</div>

## 32.2 Le BIA : identifier ce qui est vraiment critique pour l'activité

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — réaliser une analyse d'impact métier (BIA) avant de rédiger le PCA</span>
Une **Analyse d'Impact Métier** (*Business Impact Analysis*, BIA) identifie, pour chaque fonction métier de l'entreprise (pas seulement les systèmes informatiques), sa criticité réelle et sa tolérance à l'interruption — un exercice différent du RTO/RPO du chapitre 30, qui portait sur les systèmes techniques, ici étendu aux **processus métier** eux-mêmes. Par exemple : combien de temps le service comptabilité peut-il rester sans traiter les paiements fournisseurs avant qu'un impact financier réel (pénalités de retard, relations fournisseurs dégradées) ne se matérialise ?
</div>

| Fonction métier | Tolérance à l'interruption | Dépendance IT | Dépendance humaine physique |
|---|---|---|---|
| Réception des déclarations de sinistre en ligne | Faible (portail client, chapitre 24) | Élevée (serveur, réseau) | Faible (accessible à distance) |
| Traitement des paiements fournisseurs | Modérée (quelques jours) | Modérée | Élevée (validation actuellement en présentiel) |
| Accueil physique en agence | Faible pendant une évacuation | Faible | Élevée (présence physique requise) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Le BIA révèle des dépendances que le PRA seul ne capture pas</span>
Le tableau ci-dessus révèle exactement le problème du scénario d'ouverture : le traitement des paiements fournisseurs dépend fortement d'une présence physique, pas seulement d'un système informatique disponible — une dépendance qu'aucun PRA technique, aussi bien conçu soit-il, ne peut résoudre à lui seul. C'est précisément ce type de dépendance que le PCA doit identifier et adresser.
</div>

## 32.3 Les scénarios de continuité au-delà de l'IT

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Le télétravail d'urgence comme réponse directe au scénario d'ouverture</span>
La solution au problème du service comptabilité n'est pas technique au sens du PRA — c'est une question d'**organisation du travail**. L'entreprise dispose déjà, depuis les chapitres précédents, de tous les moyens techniques nécessaires à un télétravail d'urgence : accès distant sécurisé via bastion et VPN (chapitre 4), MFA (chapitre 25), accès conditionnel évaluant le contexte de connexion (chapitre 8 et 26). Le PCA formalise **comment** et **quand** activer ce mode de fonctionnement, avec quelles priorités si tout le monde ne peut pas être équipé instantanément pour le télétravail.
</div>

**D'autres dimensions qu'un PCA complet doit couvrir**, au-delà du seul télétravail :

- **Redondance de personnel clé** : si une seule personne connaît une procédure critique (rappel direct du "bus factor" du chapitre 1), son indisponibilité pendant une crise devient un second problème cumulé au premier.
- **Déroutage des communications** : un numéro de téléphone d'entreprise ou une adresse email de contact doit rester joignable même si le bureau physique est fermé.
- **Accès aux documents papier critiques** : certains documents n'existent peut-être encore que sous forme physique (contrats originaux, par exemple) — un PCA doit identifier ces dépendances papier et prévoir leur accessibilité ou leur numérisation préventive.

## 32.4 Le contexte spécifique haïtien : au-delà des coupures déjà couvertes

<div class="encadre securite">
<span class="encadre-titre">🔒 Un PCA doit couvrir des risques que le PRA technique ne couvre pas</span>
Ce manuel a déjà évoqué les coupures de courant et réseau fréquentes (chapitres 6, 23, 27) comme risques opérationnels réguliers en Haïti. Le PCA doit aller plus loin et couvrir des risques de nature différente, propres à ce contexte géographique : les **cyclones** (comme dans le scénario d'ouverture, avec un préavis de plusieurs jours généralement disponible, permettant une préparation), et les **séismes** (avec un risque bien documenté depuis 2010, sans préavis possible, exigeant une préparation permanente plutôt qu'une réaction au moment de l'alerte). Ces deux types de risques naturels appellent des réponses de continuité différentes : anticipation planifiée pour un cyclone annoncé, résilience permanente déjà en place pour un séisme imprévisible.
</div>

## 32.5 Le rôle précis de l'IT dans le PCA : fournisseur de moyens, pas seul responsable

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — le PCA dépasse le périmètre de l'équipe IT seule</span>
Contrairement au PRA, largement piloté par l'équipe technique (chapitre 31), le PCA implique nécessairement la direction, les ressources humaines et chaque responsable de service métier — l'IT y joue un rôle essentiel de **fournisseur de moyens techniques** (accès distant, communication, systèmes disponibles à distance), mais ne peut à lui seul décider des priorités métier ni de l'organisation humaine de la continuité. Un PCA rédigé uniquement par l'équipe IT, sans validation des responsables métier, risque de rater exactement le type de dépendance humaine révélée par le BIA (section 32.2).
</div>

## 32.6 Communication de crise : qui parle, et avec quel message

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — désigner à l'avance qui communique, vers qui, avec quel message</span>
Exactement comme le PRA désigne un décideur pour son activation (chapitre 31), le PCA doit désigner qui est habilité à communiquer vers les employés (consignes de sécurité, activation du télétravail), vers les clients (le portail reste-t-il accessible ? à qui s'adresser en cas de problème ?), et vers les partenaires ou fournisseurs critiques — sans cette clarté, une communication improvisée et contradictoire pendant une crise peut aggraver la confusion plutôt que la réduire, exactement le même risque déjà identifié pour l'absence de décideur PRA au chapitre 31.
</div>

## 32.7 Tester le PCA : un exercice à l'échelle de toute l'organisation

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — un exercice PCA implique bien plus de monde qu'un exercice PRA</span>
Rappel direct de la section 31.6 (exercice de simulation PRA), étendu ici à une échelle plus large : un exercice de test du PCA doit impliquer les responsables métier et, idéalement, un échantillon représentatif du personnel — pas seulement l'équipe IT. Un test qui confirme que "les serveurs de secours démarrent correctement" ne dit rien sur la capacité réelle du service comptabilité à continuer de traiter les paiements fournisseurs depuis le domicile de ses employés, l'exact problème du scénario d'ouverture.
</div>

## 32.8 Synthèse : la chaîne complète de la Partie 5

```mermaid
flowchart LR
    A["RAID\n(ch. 17, 27)\nprotege contre\nla panne disque"] --> B["NAS / SAN\n(ch. 28, 29)\ncentralise et\npartage le stockage"]
    B --> C["Sauvegardes\n(ch. 30)\nprotege contre la\nperte de donnees"]
    C --> D["PRA\n(ch. 31)\norchestre la reprise\ntechnique en crise"]
    D --> E["PCA\n(ce chapitre)\nmaintient l'activite\nmetier entiere"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque maillon protège contre un risque différent, aucun n'est substituable</span>
Cette chaîne résume la Partie 5 entière : le RAID protège contre une panne de disque isolée, mais pas contre une suppression de fichier ; le NAS/SAN centralise et partage le stockage, mais s'appuie toujours sur le RAID sous-jacent ; la sauvegarde protège contre une perte de données que le RAID ne couvre pas ; le PRA orchestre l'usage coordonné de ces sauvegardes en cas de sinistre technique ; le PCA, enfin, couvre ce qu'aucun des maillons précédents ne peut résoudre seul — la continuité de l'activité humaine et métier, au-delà des systèmes eux-mêmes.
</div>

## Atelier — Rédiger la réponse PCA au scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 32 — Maintenir l'activité comptabilité pendant l'évacuation</span>

**Objectif** : concevoir une réponse PCA concrète au scénario d'ouverture, en mobilisant les moyens techniques déjà construits dans ce manuel.

**Préparation** : aucune installation nécessaire — cet atelier est un exercice de synthèse et de rédaction.

**Étapes techniques** :

1. Identifie, à partir du tableau BIA de la section 32.2, quelle fonction métier nécessite la réponse la plus urgente pendant l'évacuation.
2. Liste les moyens techniques déjà disponibles (chapitres précédents) qui permettraient un télétravail d'urgence pour cette fonction.
3. Propose une mesure organisationnelle complémentaire (non technique) nécessaire pour que ce télétravail fonctionne réellement en pratique.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le traitement des paiements fournisseurs nécessite la réponse la plus urgente (tolérance modérée mais dépendance humaine physique forte, section 32.2). Les moyens techniques déjà disponibles incluent l'accès distant sécurisé via bastion (chapitre 4), le MFA (chapitre 25) et, si le NAS comptabilité (chapitre 28) est accessible via un accès distant sécurisé équivalent, la consultation des documents nécessaires à distance. La mesure organisationnelle complémentaire pourrait être une procédure de validation à distance des paiements (par exemple, une double validation électronique remplaçant temporairement la validation physique habituelle), documentée à l'avance plutôt qu'improvisée en pleine crise.

**Dépannage** : si tu identifies un moyen technique manquant (par exemple, le NAS comptabilité n'est pas encore accessible à distance de façon sécurisée), c'est exactement le type de lacune qu'un exercice PCA doit révéler avant une vraie crise — nota bene à ajouter au plan d'action IT, pas seulement au document PCA lui-même.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — traiter le PCA comme un problème purement IT</span>
Rappel de la section 32.5 : le PCA implique nécessairement la direction et les responsables métier — un document rédigé uniquement par l'équipe technique manque souvent les dépendances humaines les plus critiques, exactement celle révélée par le scénario d'ouverture.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — ne jamais réaliser de BIA formel</span>
Rappel de la section 32.2 : sans BIA, les priorités de continuité restent floues et intuitives plutôt que fondées sur une analyse réelle des dépendances et de la tolérance à l'interruption de chaque fonction métier.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — tester uniquement la dimension technique, jamais la dimension humaine et organisationnelle</span>
Rappel de la section 32.7 : un test qui confirme le bon fonctionnement des systèmes de secours ne garantit rien sur la capacité réelle des équipes métier à continuer leur activité dans des conditions dégradées.
</div>

## Diagnostiquer les lacunes d'un PCA existant

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Notre PCA existe mais n'a jamais vraiment été utilisé, comment savoir s'il couvre les vrais besoins ?"</span>

- **Diagnostic** : vérifier si un BIA formel a réellement été réalisé (section 32.2), ou si le document repose sur des suppositions non vérifiées sur ce qui est critique.
- **Comment vérifier** : interroger directement les responsables de chaque fonction métier sur leur tolérance réelle à l'interruption et leurs dépendances physiques/humaines — une information que l'équipe IT seule ne peut pas deviner avec précision, rejoignant directement le principe du chapitre 32.5.
- **Résolution** : compléter ou réviser le BIA avec cette implication directe des responsables métier, puis organiser un exercice impliquant réellement ces équipes (section 32.7), pas seulement l'équipe technique.
</div>

## En entreprise

- **Bonne pratique répandue** : impliquer la direction et chaque responsable de service métier dans la rédaction et la révision périodique du PCA, pas seulement l'équipe IT — une pratique qui distingue un PCA réellement utile d'un document théorique jamais approprié par l'organisation.
- **Bonne pratique répandue** : identifier et traiter préventivement les dépendances "papier" ou strictement physiques (documents originaux, présence obligatoire) qui pourraient bloquer la continuité même avec tous les systèmes informatiques parfaitement fonctionnels.
- **Erreur classique observée** : un PCA qui se limite en réalité à une copie renommée du PRA, sans réellement couvrir les dimensions humaines et organisationnelles distinctes que ce chapitre développe.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre un PRA et un PCA ?"**
Réponse attendue : le PRA restaure les systèmes informatiques après un sinistre technique ; le PCA couvre la continuité de l'ensemble de l'activité de l'entreprise (personnes, processus métier, communication), y compris dans des scénarios où les systèmes eux-mêmes ne sont pas directement affectés, comme une évacuation empêchant l'accès physique aux bureaux.

**Q2. "Qu'est-ce qu'un BIA, et pourquoi le réaliser avant de rédiger un PCA ?"**
Réponse attendue : une Analyse d'Impact Métier identifie, pour chaque fonction de l'entreprise, sa criticité réelle et sa tolérance à l'interruption, ainsi que ses dépendances techniques et humaines — sans cette analyse préalable, un PCA risque de se concentrer sur des priorités supposées plutôt que sur les vraies dépendances critiques de l'organisation.

**Q3. "Pourquoi l'équipe IT ne peut-elle pas rédiger un PCA seule ?"**
Réponse attendue : le PCA couvre des dimensions (organisation humaine, communication de crise, priorités métier) qui dépassent le périmètre de compétence et de décision de l'équipe technique seule — l'IT y fournit les moyens techniques nécessaires (accès distant, communication), mais les responsables métier et la direction doivent définir les priorités et l'organisation humaine réelle.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Assure-toi que les moyens d'accès distant activés en urgence (télétravail, section 32.3) respectent les mêmes exigences de sécurité que l'accès quotidien normal (bastion, MFA, chapitre 4 et 25) — une crise ne justifie jamais un relâchement des mesures de sécurité de base, un réflexe d'autant plus important que le stress d'une situation de crise pousse parfois à des raccourcis dangereux.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Réalise et actualise régulièrement le BIA (section 32.2) en collaboration directe avec les responsables métier, et documente le PCA au même titre que le PRA (chapitre 3) — un document vivant, révisé après chaque changement organisationnel significatif, pas seulement après un changement d'infrastructure technique.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Priorise les investissements de continuité selon les résultats du BIA plutôt qu'une intuition générale — les ressources limitées d'une organisation doivent se concentrer sur les fonctions à la fois les plus critiques et les plus vulnérables, une priorisation qui rejoint directement le principe impact/urgence déjà appliqué à la gestion d'incident au chapitre 2.
</div>

## Résumé du chapitre

- Le PCA couvre la continuité de l'ensemble de l'activité de l'entreprise, un périmètre plus large que le PRA (chapitre 31), centré sur la reprise technique.
- Le BIA identifie la criticité réelle et les dépendances (techniques ET humaines) de chaque fonction métier, une base indispensable à un PCA pertinent.
- Le télétravail d'urgence, la redondance de personnel clé, le déroutage des communications et l'accès aux documents physiques critiques sont des dimensions du PCA au-delà du seul périmètre informatique.
- Le contexte haïtien ajoute des risques spécifiques (cyclones avec préavis, séismes sans préavis) que le PRA technique seul ne couvre pas.
- Le PCA implique nécessairement la direction et les responsables métier, pas seulement l'équipe IT, qui y joue un rôle de fournisseur de moyens techniques.
- Un test PCA doit impliquer les équipes métier réelles, pas seulement une vérification technique des systèmes de secours.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le PCA se distingue du PRA car il couvre :
   - a) Uniquement la restauration des serveurs
   - b) La continuité de l'ensemble de l'activité de l'entreprise, au-delà des seuls systèmes techniques
   - c) Exactement le même périmètre, sous un nom différent
   - d) Uniquement les aspects financiers de l'entreprise

2. Un BIA (Business Impact Analysis) sert principalement à :
   - a) Calculer le budget informatique annuel
   - b) Identifier la criticité réelle et les dépendances de chaque fonction métier
   - c) Remplacer le besoin de sauvegardes techniques
   - d) Choisir un fournisseur cloud

3. Le rôle de l'équipe IT dans un PCA est principalement de :
   - a) Décider seule de toutes les priorités métier
   - b) Fournir les moyens techniques nécessaires à la continuité, en collaboration avec les responsables métier
   - c) Rédiger le document sans consultation d'autres services
   - d) Se limiter à la restauration des serveurs uniquement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un PRA parfaitement fonctionnel garantit automatiquement la continuité de l'activité métier de l'entreprise. — **Faux** (exactement la leçon du scénario d'ouverture).
2. Le BIA doit être réalisé avec la participation des responsables métier, pas uniquement par l'équipe IT. — **Vrai**.
3. Un exercice de test PCA se limite généralement à vérifier le bon fonctionnement des systèmes de secours. — **Faux** (il doit impliquer les équipes métier réelles, section 32.7).
4. Les séismes et les cyclones appellent le même type de préparation, avec le même délai d'anticipation. — **Faux** (préavis possible pour un cyclone, aucun préavis pour un séisme, section 32.4).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une entreprise avec un excellent PRA peut quand même voir son activité interrompue, comme dans le scénario d'ouverture.
2. Reprends le tableau BIA de la section 32.2. Explique pourquoi la "dépendance humaine physique" est une colonne aussi importante que la "dépendance IT" pour évaluer la vraie résilience d'une fonction métier.

**Corrigé 1** : le PRA couvre spécifiquement la reprise des systèmes techniques après un sinistre les affectant directement — mais une évacuation liée à une alerte cyclonique n'endommage pas nécessairement les systèmes eux-mêmes, elle empêche les personnes d'y accéder physiquement ou de travailler normalement. Le PRA, aussi bien conçu soit-il pour son périmètre technique, n'a simplement pas vocation à résoudre ce type de dépendance humaine et organisationnelle — un besoin qui relève spécifiquement du PCA.

**Corrigé 2** : une fonction métier avec une dépendance IT élevée mais une dépendance humaine physique faible (comme le portail client, accessible à distance) peut continuer à fonctionner même si personne ne peut se rendre physiquement au bureau, tant que les systèmes restent disponibles. À l'inverse, une fonction avec une dépendance humaine physique élevée (comme le traitement des paiements avec validation en présentiel) reste vulnérable à une interruption même si tous les systèmes informatiques sous-jacents fonctionnent parfaitement — la résilience réelle d'une fonction métier dépend donc de la combinaison des deux dimensions, jamais d'une seule évaluée isolément.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 32.1</span>

Une entreprise a un excellent PRA technique mais n'a jamais réalisé de BIA formel avec ses responsables métier. Explique le risque concret de cette lacune, en t'appuyant sur le scénario d'ouverture de ce chapitre.
</div>

**Corrigé :** Sans BIA, l'entreprise ne sait pas précisément quelles fonctions métier sont les plus critiques ni quelles sont leurs dépendances réelles (techniques ou humaines) — exactement la situation qui a surpris le DSI dans le scénario d'ouverture, où le service comptabilité s'est retrouvé bloqué malgré une infrastructure technique parfaitement intacte. Sans cette analyse préalable, l'entreprise découvre ses vraies dépendances critiques seulement au moment où une crise réelle les révèle, plutôt que de les avoir anticipées et préparées à l'avance — un risque directement comparable à celui d'une sauvegarde jamais testée (chapitre 30), appliqué ici à l'organisation humaine plutôt qu'à la technique.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 32.2</span>

Rédige, en 3 à 5 phrases, pourquoi un exercice de simulation PCA impliquant uniquement l'équipe IT (comme un exercice PRA classique) ne suffirait pas à valider la réponse au scénario d'ouverture de ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Un exercice limité à l'équipe IT vérifierait uniquement que les systèmes techniques (accès distant, VPN, MFA) fonctionnent correctement en cas de sollicitation — une vérification utile mais insuffisante, puisque le vrai problème du scénario d'ouverture concerne la capacité du service comptabilité à adapter ses processus métier (validation des paiements, par exemple) à un mode de fonctionnement à distance. Seul un exercice impliquant réellement les employés de la comptabilité peut révéler si les procédures métier elles-mêmes sont réalisables à distance, et identifier les ajustements organisationnels nécessaires que l'équipe IT seule ne peut ni deviner ni décider à leur place.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends la différence entre PRA (reprise technique) et PCA (continuité de l'activité entière).</li>
<li>☐ Je sais réaliser une analyse d'impact métier (BIA) de base.</li>
<li>☐ Je connais les dimensions du PCA au-delà du seul périmètre informatique (télétravail, redondance de personnel, communication de crise).</li>
<li>☐ Je comprends les risques spécifiques du contexte haïtien (cyclones avec préavis, séismes sans préavis).</li>
<li>☐ Je comprends pourquoi le PCA implique nécessairement la direction et les responsables métier, pas seulement l'IT.</li>
<li>☐ Je sais pourquoi un test PCA doit impliquer les équipes métier réelles, pas seulement une vérification technique.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Une petite entreprise a-t-elle besoin d'un PCA séparé d'un PRA ?</dt>
<dd>L'ampleur formelle des deux documents peut être adaptée à la taille de l'organisation (même principe que pour le PRA au chapitre 31), mais la distinction conceptuelle reste utile même informellement — se poser explicitement la question "et si nos systèmes fonctionnaient parfaitement mais que personne ne pouvait travailler ?" aide à identifier des lacunes qu'un PRA seul ne révèle jamais.</dd>

<dt>Le télétravail d'urgence pose-t-il des risques de sécurité spécifiques ?</dt>
<dd>Oui, potentiellement — des employés travaillant depuis des réseaux domestiques moins sécurisés, ou avec des équipements personnels non gérés par l'entreprise, élargissent la surface d'attaque. C'est pourquoi la section 32.5 insiste sur le maintien des mêmes exigences de sécurité (bastion, MFA) même en mode d'urgence, plutôt qu'un relâchement des contrôles habituels.</dd>

<dt>Comment prioriser les investissements de continuité avec un budget limité ?</dt>
<dd>Le BIA (section 32.2) fournit exactement cette priorisation : concentrer les ressources sur les fonctions à la fois les plus critiques (fort impact en cas d'interruption) et les plus vulnérables (dépendances non couvertes), plutôt que de répartir uniformément un budget limité sur l'ensemble de l'organisation sans distinction de criticité réelle.</dd>

<dt>Le PCA doit-il couvrir des scénarios extrêmes peu probables (comme un séisme majeur) ou se concentrer sur les incidents courants ?</dt>
<dd>Un bon PCA couvre un spectre de scénarios, des plus fréquents (coupures de courant/réseau déjà couvertes ailleurs dans ce manuel) aux plus rares mais à fort impact (séismes) — la profondeur de préparation pour chaque scénario devant rester proportionnée à sa probabilité réelle et à son impact potentiel, sans négliger complètement les scénarios extrêmes sous prétexte de leur rareté, particulièrement pertinents dans le contexte sismique documenté d'Haïti.</dd>
</dl>

## Références et pour aller plus loin

- ISO 22301 — norme internationale de gestion de la continuité d'activité : [https://www.iso.org/fr/standard/75106.html](https://www.iso.org/fr/standard/75106.html)
- NIST Special Publication 800-34 (déjà référencée au chapitre 31, couvre aussi les principes de BIA) : [https://csrc.nist.gov/pubs/sp/800/34/r1/final](https://csrc.nist.gov/pubs/sp/800/34/r1/final)
- Ready.gov (agence FEMA) — ressources de planification de continuité d'activité pour PME : [https://www.ready.gov/business](https://www.ready.gov/business)

*Fin de la Partie 5. La Partie 6 aborde maintenant la virtualisation — VMware vSphere, Microsoft Hyper-V et Proxmox VE — la brique qui a motivé le déploiement du SAN au chapitre 29, et qui va transformer la façon dont l'infrastructure entière de ce manuel est hébergée.*
