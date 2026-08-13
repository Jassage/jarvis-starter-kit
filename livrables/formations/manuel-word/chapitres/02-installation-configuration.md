<div class="chapitre-titre-num">CHAPITRE 2</div>

# Installation et configuration (Microsoft 365, Office 2021, Word Web, Word Mobile)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : choisir, parmi les options disponibles (Microsoft 365, Office 2021/2024, essai gratuit, licence étudiante ou professionnelle), celle qui correspond réellement à ta situation ; installer Word sur Windows et savoir ce qui diffère sur macOS ; vérifier la configuration système requise avant d'installer quoi que ce soit ; activer ton compte Microsoft et relier Word à ton abonnement ; configurer la langue d'affichage et de correction ; accéder à Word Online sans aucune installation ; installer Word Mobile sur Android ou iOS ; et diagnostiquer les problèmes d'installation les plus fréquents sans dépendre d'un support technique externe.
</div>

**Matrice de compétences MOS** : ce chapitre ne correspond à aucun objectif testé par l'examen MOS Word (MO-100/MO-101) — l'installation elle-même n'est jamais évaluée, l'examen commence directement à l'utilisation de l'application. Une exception partielle : la section 2.8 (langue d'édition/affichage) rejoint l'objectif Expert **1.3 Use and configure language options** (MO-101), approfondi au chapitre 4.

**Prérequis** : chapitre 1 (savoir situer Word dans l'écosystème Microsoft 365 et distinguer ses éditions).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
De retour de ton premier jour de stage à l'ONG (chapitre 1), tu ouvres l'ordinateur portable qu'on vient de te confier. Aucune application Office n'y est installée, et l'ordinateur est visiblement un ancien poste réaffecté, avec une version de Windows que tu ne connais pas bien. Ta responsable te donne un identifiant de messagerie professionnelle et te dit : <em>"Normalement l'organisation a une licence Microsoft 365, débrouille-toi pour l'installer, on n'a pas de service informatique dédié."</em> Tu dois donc, seul, vérifier ce que la machine peut supporter, retrouver comment activer la licence de l'organisation, installer Word correctement, et le configurer pour qu'il soit immédiatement utilisable en français. Ce chapitre te donne la méthode complète, du diagnostic initial à un poste de travail pleinement opérationnel.
</div>

## 2.1 Avant d'installer : vérifier la configuration système requise

Installer un logiciel sans vérifier au préalable qu'il est réellement supporté par la machine est une source fréquente de déconvenues : lenteurs extrêmes, plantages, voire impossibilité pure et simple de terminer l'installation.

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
La <strong>configuration système requise</strong> (souvent abrégée <em>system requirements</em>) désigne l'ensemble minimal de ressources matérielles et logicielles qu'un ordinateur doit posséder pour qu'un logiciel fonctionne correctement. Pour Microsoft 365 / Office 2021 sous Windows, elle porte principalement sur quatre éléments : la version du système d'exploitation, la mémoire vive (RAM), l'espace disque disponible, et la résolution d'écran minimale.
</div>

| Élément | Exigence minimale typique (Microsoft 365 / Office 2021, à la date de rédaction) | Pourquoi ça compte concrètement |
|---|---|---|
| Système d'exploitation | Windows 10 ou Windows 11 (les versions antérieures ne sont plus prises en charge) | Une machine encore sous Windows 8.1 ou plus ancien ne pourra tout simplement pas installer les versions récentes de Word |
| RAM | 4 Go minimum | En dessous, l'ouverture de documents longs ou contenant beaucoup d'images (Partie 6) devient très lente |
| Espace disque | Environ 4 Go libres pour la suite complète | L'installation échoue silencieusement ou partiellement si l'espace est insuffisant |
| Résolution d'écran | 1280 x 768 pixels minimum | En dessous, certains éléments du Ruban (chapitre 3) peuvent être tronqués ou inaccessibles |
| Compte Microsoft | Requis pour activer une licence Microsoft 365 | Sans compte, impossible de lier l'abonnement à l'installation |

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment vérifier rapidement la configuration de ta machine (Windows)</span>
Avant même de télécharger quoi que ce soit : ouvre le menu Démarrer, tape "informations système", puis ouvre l'application. L'écran affiche directement la version de Windows, la RAM installée et le type de processeur (32 ou 64 bits — Microsoft 365 est aujourd'hui distribué en 64 bits par défaut, ce qui convient à la quasi-totalité des machines vendues depuis 2015).
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Informations système Windows</span>

- **Objectif** : montrer où trouver la version de Windows et la RAM installée sans installer d'outil tiers.
- **Contenu exact** : la fenêtre "Informations système" de Windows, avec la section "Résumé système" visible.
- **Zones à mettre en évidence** : encadrer en rouge les lignes "Nom du système d'exploitation", "Version du système", "Mémoire physique installée (RAM)".
- **Annotations/flèches** : une flèche numérotée (1) vers "Nom du système d'exploitation", (2) vers la RAM.
- **Légende** : "Figure 2.1 — Vérifier la configuration de sa machine avant toute installation d'Office."
</div>

## 2.2 Choisir la bonne offre : abonnement, achat unique, essai ou licence incluse

Le chapitre 1 a distingué Microsoft 365 (abonnement) d'Office 2021/2024 (achat unique). Concrètement, voici les portes d'entrée réelles pour obtenir Word, de la plus courante à la plus rare :

1. **Abonnement Microsoft 365 personnel ou familial** — souscrit directement sur le site Microsoft, avec un paiement mensuel ou annuel. Inclut Word, Excel, PowerPoint, Outlook, 1 To de stockage OneDrive par personne, et l'accès à Copilot selon le marché et la formule.
2. **Abonnement Microsoft 365 professionnel ou éducation** — fourni par un employeur ou un établissement scolaire/universitaire via un compte professionnel ou scolaire (adresse e-mail institutionnelle). C'est la situation du scénario d'ouverture : l'ONG possède déjà une licence, il s'agit de l'activer, pas d'en acheter une nouvelle.
3. **Licence étudiante gratuite** — de nombreux établissements universitaires (dont certains en Haïti) offrent Microsoft 365 gratuitement à leurs étudiants inscrits, via leur adresse e-mail scolaire. À vérifier en priorité avant tout achat si tu es étudiant.
4. **Office 2021 ou 2024 (achat unique)** — une licence perpétuelle achetée une seule fois, sans abonnement, pour qui préfère ne pas payer récurremment et n'a pas besoin des toutes dernières fonctionnalités (dont Copilot, réservé à 365).
5. **Essai gratuit de Microsoft 365** — généralement un mois offert, sans engagement au-delà si l'essai est annulé avant renouvellement automatique.
6. **Word Online, gratuit avec un simple compte Microsoft** — sans aucune installation (section 2.6).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention à la confusion la plus coûteuse</span>
Un compte professionnel ou scolaire (souvent appelé <strong>compte Microsoft 365 Entreprise/Éducation</strong>) n'est <strong>pas</strong> le même type de compte qu'un compte Microsoft personnel (utilisé par exemple pour Xbox, Outlook.com ou Skype). Utiliser le mauvais type de compte lors de l'activation est la cause la plus fréquente d'un message "Aucune licence trouvée" alors que l'organisation en possède bien une. La section 2.5 détaille comment vérifier lequel utiliser.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Université</span>
Dans une université comme UJEPH, les étudiants disposent en général d'une adresse e-mail institutionnelle (`prenom.nom@etablissement.edu.ht` ou équivalent) qui donne automatiquement accès à Microsoft 365 Éducation gratuitement, y compris pour un usage personnel pendant toute la durée des études. Un réflexe à avoir avant tout achat : demander au service de scolarité si un tel accès existe.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — ONG</span>
Une ONG de taille moyenne souscrit fréquemment à une offre Microsoft 365 à tarif réduit via le programme Microsoft pour les organisations à but non lucratif (Microsoft Nonprofit), parfois même gratuite jusqu'à un certain nombre de licences. Ta responsable, dans le scénario d'ouverture, fait référence à ce type de licence organisationnelle — pas à un abonnement personnel qu'il faudrait souscrire toi-même.
</div>

## 2.3 Installer Word sous Windows, étape par étape

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 2 — Installer Microsoft 365 sur Windows de bout en bout</span>

**Objectif** : réaliser une installation complète et fonctionnelle de Word, prête à l'usage, sans étape manquée.

**Préparation** : une connexion Internet stable, un compte Microsoft (personnel, professionnel ou scolaire selon ta situation identifiée à l'atelier 1), et au moins 4 Go d'espace disque libre (section 2.1).

**Étapes détaillées** :
1. Rends-toi sur `https://www.office.com` et connecte-toi avec ton compte Microsoft (ou crée-en un gratuitement si tu n'en as pas).
2. Si un abonnement actif est associé à ton compte, un bouton **"Installer Office"** (ou **"Installer et plus"**) apparaît en haut à droite de la page d'accueil. Clique dessus, puis choisis **"Applications Microsoft 365"**.
3. Un petit fichier d'installation (`OfficeSetup.exe`) se télécharge. Exécute-le : il télécharge ensuite automatiquement l'intégralité de la suite en arrière-plan (Word, Excel, PowerPoint, Outlook, et les autres applications incluses dans la formule).
4. Une fenêtre affiche la progression de l'installation. Selon la vitesse de connexion, compte entre 10 et 30 minutes. **Ne ferme pas la fenêtre** avant le message "Tout est prêt ! Office est maintenant installé."
5. Lance Word depuis le menu Démarrer. Au premier lancement, une fenêtre demande de te connecter avec ton compte Microsoft : ressaisis les mêmes identifiants qu'à l'étape 1 pour que la licence soit reconnue automatiquement.
6. Vérifie l'activation : ouvre l'onglet **Fichier**, puis **Compte**. La mention "Produit activé" doit apparaître sous le nom du produit, avec le compte connecté visible.

**Résultat attendu** : Word s'ouvre sans message d'erreur ni bandeau "Produit non activé", et l'onglet Fichier > Compte confirme l'activation avec le bon compte.

**Dépannage** : si le bouton "Installer Office" n'apparaît pas à l'étape 2, c'est presque toujours qu'aucun abonnement actif n'est associé à ce compte précis — vérifie que tu utilises bien le compte auquel la licence est réellement rattachée (personnel vs professionnel/scolaire, section 2.2), avant de suspecter un problème technique.
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Page office.com avec bouton d'installation</span>

- **Objectif** : montrer précisément où se trouve le point de départ de toute installation de Microsoft 365.
- **Contenu exact** : la page d'accueil `office.com` une fois connecté, avec le bouton "Installer Office" visible en haut à droite.
- **Zones à mettre en évidence** : encadrer le bouton "Installer Office" et la mention du compte connecté (coin supérieur droit).
- **Annotations/flèches** : une flèche numérotée pointant vers le bouton, avec le texte "Cliquer ici en premier".
- **Légende** : "Figure 2.2 — Le point de départ de toute installation de Microsoft 365 : office.com."
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Fichier > Compte confirmant l'activation</span>

- **Objectif** : montrer à quoi ressemble une activation réussie, pour que le lecteur puisse comparer avec sa propre installation.
- **Contenu exact** : l'écran Backstage (chapitre 3) ouvert sur l'onglet "Compte", avec "Informations produit" affichant "Produit activé" en vert.
- **Zones à mettre en évidence** : entourer la mention "Produit activé" et le nom du compte affiché juste au-dessus.
- **Annotations/flèches** : encadré latéral "C'est ici qu'il faut vérifier en cas de doute sur l'activation."
- **Légende** : "Figure 2.3 — Vérifier l'activation depuis Fichier > Compte."
</div>

## 2.4 Particularités de l'installation sous macOS

Le principe général reste identique (connexion sur `office.com`, téléchargement, installation, activation), mais certains détails diffèrent sur Mac :

| Étape | Windows | macOS |
|---|---|---|
| Fichier téléchargé | `OfficeSetup.exe` | Un fichier `.pkg` |
| Lancement de l'installation | Double-clic, assistant Windows | Double-clic, assistant d'installation macOS natif |
| Autorisation système | Généralement automatique | macOS peut demander une autorisation explicite dans **Réglages Système > Confidentialité et sécurité** si l'installation est bloquée par Gatekeeper |
| Emplacement une fois installé | Menu Démarrer | Dossier **Applications** |
| Raccourcis clavier | Touche `Ctrl` comme touche de commande principale | Touche `Cmd` (⌘) remplace `Ctrl` dans la quasi-totalité des raccourcis (ex. `Ctrl+C` devient `Cmd+C`) |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — les raccourcis clavier de ce manuel</span>
Sauf mention contraire explicite, l'ensemble des raccourcis clavier présentés dans ce manuel (à partir du chapitre 5) sont donnés au format **Windows**. Sur macOS, remplace systématiquement `Ctrl` par `Cmd` (⌘) ; les autres touches (`Maj`, `Alt`) restent généralement identiques. Les rares raccourcis qui divergent au-delà de cette substitution simple seront signalés au cas par cas.
</div>

## 2.5 Se connecter avec le bon compte : personnel, professionnel ou scolaire

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Microsoft distingue deux grandes familles de comptes, visuellement identiques (une adresse e-mail et un mot de passe) mais gérées par des systèmes différents en coulisses : le <strong>compte Microsoft personnel</strong> (créé librement par n'importe qui, via Outlook.com, Gmail ou une autre adresse) et le <strong>compte professionnel ou scolaire</strong> (créé et administré par une organisation — entreprise, ONG, université — via Microsoft Entra ID, anciennement Azure Active Directory). Une licence Microsoft 365 fournie par un employeur ou un établissement est <strong>toujours</strong> associée à un compte professionnel ou scolaire, jamais à un compte personnel.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment savoir quel type de compte utiliser</span>
Si l'adresse e-mail que tu utilises pour te connecter se termine par le domaine de ton organisation (ex. `@ong-exemple.org`, `@ujeph.edu.ht`), il s'agit presque certainement d'un compte professionnel ou scolaire. Si elle se termine par `@outlook.com`, `@hotmail.com`, `@gmail.com` ou un domaine personnel, c'est un compte personnel — qui ne pourra pas récupérer une licence organisationnelle, même si la personne qui te l'indique en est convaincue.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Administration publique</span>
Dans une administration, l'adresse e-mail professionnelle est généralement créée par le service informatique en même temps que le contrat de travail, et sert automatiquement de compte pour Microsoft 365 si l'organisation y est abonnée. Un nouvel employé n'a donc, en principe, rien à souscrire lui-même : seulement à activer Word avec les identifiants fournis à son arrivée — exactement la situation de ta responsable dans le scénario d'ouverture.
</div>

## 2.6 Word Online : utiliser Word sans rien installer

Word Online (aussi appelé Word sur le Web) est une version de Word qui s'exécute entièrement dans un navigateur, sans aucune installation locale.

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Accès rapide à Word Online</span>

1. Rends-toi sur `https://www.office.com` (ou directement `https://word.office.com`).
2. Connecte-toi avec un compte Microsoft (personnel, professionnel ou scolaire — un compte gratuit suffit).
3. Clique sur l'icône Word, puis sur "Nouveau document vierge".
4. Le document s'ouvre directement dans le navigateur, s'enregistre automatiquement sur OneDrive au fil de la frappe (pas besoin de `Ctrl+S`), et reste accessible depuis n'importe quel autre appareil connecté au même compte.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Limites réelles de Word Online</span>
Word Online ne remplace pas totalement Word Desktop : certaines fonctionnalités avancées sont absentes ou limitées (macros VBA, certains outils de mise en page fine, certains SmartArt complexes). Pour une utilisation ponctuelle, un dépannage depuis un poste sans Word installé, ou un travail nomade léger, Word Online convient parfaitement. Pour un usage professionnel intensif (Parties 6 à 9 de ce manuel), Word Desktop reste recommandé. Le chapitre 48 détaille ce comparatif fonctionnalité par fonctionnalité.
</div>

## 2.7 Installer Word Mobile sur Android et iOS

Word Mobile est l'application dédiée aux smartphones et tablettes, disponible gratuitement sur le Google Play Store (Android) et l'App Store (iOS).

1. Recherche "Microsoft Word" dans le store correspondant à ton appareil, puis installe l'application (gratuite, aucun achat requis pour l'installation elle-même).
2. Au premier lancement, connecte-toi avec ton compte Microsoft.
3. Sans abonnement Microsoft 365 associé, l'application permet la **lecture** de documents et une **édition basique** (texte, mise en forme simple). Avec un abonnement actif, l'ensemble des fonctionnalités d'édition avancée devient disponible, avec une interface adaptée à l'écran tactile.

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Un consultant freelance en déplacement chez un client relit et corrige un contrat directement depuis Word Mobile sur sa tablette, entre deux rendez-vous, avant de finaliser la mise en page complète une fois de retour sur son ordinateur portable — un usage typique où Word Mobile complète Word Desktop plutôt qu'il ne le remplace.
</div>

## 2.8 Configurer la langue d'affichage et de correction

Une installation par défaut n'est pas toujours dans la langue souhaitée, en particulier sur un poste déjà configuré par quelqu'un d'autre (exactement la situation du scénario d'ouverture).

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 3 — Configurer Word entièrement en français</span>

**Objectif** : s'assurer que l'interface, la correction orthographique et grammaticale, et le dictionnaire par défaut sont bien réglés sur le français.

**Étapes détaillées** :
1. Onglet **Fichier > Options > Langue**.
2. Sous "Choisir les langues d'édition", vérifie que "Français" est bien présent et défini par défaut ; sinon, ajoute-le via "Ajouter des langues supplémentaires" puis "Définir par défaut".
3. Sous "Choisir la langue de l'aide et de l'affichage", sélectionne "Français" dans les deux menus, puis clique sur "Définir par défaut".
4. Redémarre Word pour que le changement d'interface soit pleinement appliqué (le changement de langue de correction, lui, s'applique immédiatement).

**Résultat attendu** : les menus, le Ruban et les infobulles s'affichent en français, et le correcteur souligne correctement les fautes selon les règles du français plutôt que d'une autre langue.

**Dépannage** : si le français n'apparaît pas du tout dans la liste des langues disponibles à l'étape 2, c'est que le pack de langue correspondant n'a pas été installé avec la suite — Fichier > Compte > "Mises à jour Office" > "Options de mise à jour" permet de forcer une vérification qui proposera alors le pack manquant.
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — définir la langue d'un texte spécifique sans changer tout le document</span>
Une portion de texte peut avoir sa propre langue de correction, indépendamment de la langue générale du document — utile pour une citation en anglais au sein d'un rapport en français, par exemple. Sélectionne le texte concerné, puis onglet **Révision > Langue > Définir la langue de vérification linguistique**, et choisis la langue voulue uniquement pour cette sélection. Le correcteur cessera alors de signaler comme fautives des expressions parfaitement correctes dans l'autre langue.
</div>

## 2.9 Mises à jour : automatiques ou manuelles

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Sous Microsoft 365, laisser les mises à jour automatiques activées (réglage par défaut) garantit l'accès continu aux dernières fonctionnalités, corrections de sécurité, et nouveautés Copilot (chapitre 49), sans action manuelle. Le réglage se vérifie via Fichier > Compte > "Options de mise à jour" > "Activer les mises à jour".
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention en environnement professionnel géré</span>
Dans certaines organisations, les mises à jour sont volontairement gelées ou centralisées par le service informatique (pour garantir que tous les postes restent sur une version identique et testée). Si le bouton de mise à jour manuelle reste grisé ou inactif, ce n'est généralement pas un bug mais une politique organisationnelle délibérée — à confirmer auprès du service concerné plutôt que de chercher à la contourner.
</div>

## 2.10 Désinstallation et réparation

Il arrive qu'une installation se corrompe (plantages récurrents à l'ouverture, fonctionnalités manquantes sans raison apparente). Avant de désinstaller complètement, une **réparation** suffit dans la grande majorité des cas :

1. Windows : **Paramètres > Applications > Applications installées**, rechercher "Microsoft 365" (ou "Office"), cliquer sur les trois points, puis **"Modifier"**.
2. Choisir **"Réparation rapide"** en premier (quelques minutes, ne nécessite pas de connexion Internet soutenue). Si le problème persiste, relancer avec **"Réparation en ligne"** (plus longue, retélécharge les fichiers corrompus).
3. La désinstallation complète (bouton "Désinstaller" au même endroit) ne doit être envisagée qu'en dernier recours, après une réparation en ligne infructueuse.

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Se connecter avec le mauvais type de compte</span>
Comme détaillé en section 2.5, tenter d'activer une licence organisationnelle avec un compte Microsoft personnel (ou l'inverse) provoque un message trompeur ("Aucun produit Office trouvé") qui laisse penser à un problème de licence alors qu'il s'agit simplement du mauvais compte utilisé pour la connexion.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Interrompre l'installation en pensant qu'elle est bloquée</span>
L'installation de Microsoft 365 se déroule en deux temps : un petit exécutable se télécharge d'abord rapidement, puis l'installation réelle continue en arrière-plan pendant plusieurs minutes sans barre de progression toujours visible. Fermer la fenêtre ou redémarrer l'ordinateur à ce stade, en pensant à un blocage, interrompt l'installation et oblige à tout recommencer.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Confondre installation réussie et activation réussie</span>
Word peut s'installer parfaitement (l'application se lance, l'interface s'affiche) tout en restant **non activé** si la connexion au compte à l'étape 5 de l'atelier 2 a échoué ou a été ignorée. Un Word non activé affiche un bandeau d'avertissement et limite certaines fonctionnalités d'enregistrement — toujours vérifier Fichier > Compte après l'installation, pas seulement le fait que l'application s'ouvre.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "Produit non activé" persiste après connexion</span>

- **Diagnostic** : le compte utilisé pour se connecter dans Word n'est probablement pas celui auquel la licence est réellement associée.
- **Résolution** : Fichier > Compte > "Se déconnecter", puis se reconnecter en vérifiant précisément l'adresse e-mail saisie (attention aux fautes de frappe et aux comptes multiples sur la même personne).
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le bouton "Installer Office" n'apparaît pas sur office.com</span>

- **Diagnostic** : soit aucun abonnement actif n'est associé au compte connecté, soit l'abonnement existe mais sur un compte différent.
- **Résolution** : vérifier auprès du service informatique de l'organisation (ou du service de scolarité pour une licence étudiante) quelle adresse e-mail précise est liée à la licence, avant de suspecter un problème technique côté machine.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : Word plante systématiquement à l'ouverture après installation</span>

- **Diagnostic** : installation corrompue (téléchargement interrompu, conflit avec une ancienne version d'Office partiellement désinstallée) ou pilote graphique obsolète.
- **Résolution** : tenter d'abord une "Réparation rapide" (section 2.10) ; si le plantage persiste, une "Réparation en ligne" ; en dernier recours, désinstallation complète suivie d'une réinstallation propre.
</div>

## En entreprise

- **Bonne pratique répandue** : dans une organisation de plusieurs employés, documenter par écrit (même sommairement) quel compte utiliser pour activer Office, pour éviter que chaque nouvel arrivant reproduise la même confusion de la section 2.5.
- **Bonne pratique répandue** : privilégier les mises à jour automatiques (section 2.9) sauf politique interne explicite contraire, pour rester aligné avec le référentiel de la certification MOS (toujours basé sur la version courante de Microsoft 365).
- **Erreur classique observée** : un employé installe Office avec son compte personnel par habitude (plus rapide à saisir de mémoire), puis découvre des mois plus tard que ses documents professionnels sont mélangés avec son OneDrive personnel — un problème de gouvernance des données qui aurait été évité en clarifiant la question dès l'installation.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — installer uniquement Word sans le reste de la suite</span>
Sur la page de téléchargement de office.com, un lien discret "Autres options d'installation" (ou, selon les marchés, un menu déroulant à côté du bouton principal) permet parfois de choisir une installation personnalisée n'incluant que certaines applications. Utile sur une machine aux ressources limitées où Excel, PowerPoint et Outlook ne sont pas nécessaires — étant précisé que cette option n'est pas systématiquement proposée selon la formule d'abonnement.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — ce que ce chapitre couvre pour l'examen</span>
L'installation elle-même n'est **pas** un objectif d'examen MOS — le référentiel officiel commence directement à l'utilisation de l'application. **Piège fréquent** : passer l'examen sur un poste où Word n'est pas dans sa configuration par défaut (langue incorrecte, mises à jour désactivées ayant bloqué des fonctionnalités récentes) et perdre du temps à chercher des options à des emplacements inhabituels. **Recommandation** : avant toute session d'entraînement à la certification (Partie 14), vérifie systématiquement Fichier > Compte (activation à jour) et Fichier > Options > Langue (français configuré), pour t'entraîner dans des conditions strictement identiques à celles de l'examen.
</div>

## Résumé du chapitre

- La configuration système requise (Windows 10/11, 4 Go de RAM, 4 Go d'espace disque) doit être vérifiée avant toute installation, via "Informations système" sous Windows.
- Six portes d'entrée existent pour obtenir Word : abonnement personnel, professionnel/éducation, licence étudiante gratuite, achat unique (Office 2021/2024), essai gratuit, ou Word Online sans installation.
- L'installation se fait toujours depuis `office.com`, en se connectant d'abord avec le bon type de compte (personnel vs professionnel/scolaire) — la confusion entre ces deux types de compte est la cause la plus fréquente d'échec d'activation.
- macOS suit le même principe général que Windows, avec des différences de détail (fichier `.pkg`, touche `Cmd` au lieu de `Ctrl`).
- Word Online et Word Mobile offrent des alternatives sans installation lourde, avec des limites fonctionnelles réelles par rapport à Word Desktop.
- La langue d'affichage et de correction se configure dans Fichier > Options > Langue, indépendamment l'une de l'autre.
- Une réparation rapide ou en ligne résout la grande majorité des installations corrompues, sans nécessiter de désinstallation complète.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un message "Aucun produit Office trouvé" après connexion signifie le plus souvent :
   - a) Que la machine ne supporte pas Word
   - b) Que le compte utilisé n'est pas celui associé à la licence
   - c) Que Word n'a pas été correctement téléchargé
   - d) Qu'il faut redémarrer l'ordinateur

2. Un compte professionnel ou scolaire est géré par :
   - a) Microsoft Entra ID, administré par l'organisation
   - b) Le même système qu'un compte personnel Outlook.com
   - c) Google Workspace
   - d) Aucun système : il s'agit d'un simple mot de passe local

3. Face à une installation Word qui plante systématiquement à l'ouverture, la première action recommandée est :
   - a) Désinstaller complètement puis réinstaller
   - b) Réinstaller Windows
   - c) Lancer une "Réparation rapide"
   - d) Changer d'ordinateur

**Corrigé** : 1-b, 2-a, 3-c.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Word Online nécessite une installation locale avant utilisation. — **Faux** (il fonctionne entièrement dans le navigateur).
2. Les raccourcis clavier de ce manuel sont donnés au format Windows par défaut. — **Vrai** (remplacer `Ctrl` par `Cmd` sur macOS, section 2.4).
3. Une licence étudiante Microsoft 365 est systématiquement payante. — **Faux** (souvent gratuite via l'adresse e-mail institutionnelle).
4. Interrompre l'installation dès que la barre de progression semble figée est sans risque. — **Faux** (cela peut interrompre un téléchargement en arrière-plan et obliger à tout recommencer).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi vérifier la configuration système avant d'installer Word peut éviter des problèmes qui, autrement, seraient attribués à tort à un "bug" du logiciel.
2. Un ami te dit que Word ne fonctionne pas chez lui malgré une "licence Microsoft 365 payée par son université". Quelles sont les deux premières vérifications à lui suggérer, dans l'ordre ?

**Corrigé 1** : une machine sous-dimensionnée (RAM insuffisante, ancien système d'exploitation non supporté) provoque des lenteurs ou des plantages qui ressemblent à des dysfonctionnements du logiciel, alors que la cause réelle est matérielle/système. Vérifier la configuration en amont permet de distinguer un vrai bug d'une limite matérielle connue et documentée.

**Corrigé 2** : d'abord vérifier qu'il se connecte bien avec son adresse e-mail **institutionnelle** (compte scolaire) et non un compte personnel (section 2.5) ; ensuite vérifier sur `office.com`, une fois connecté avec ce compte, que le bouton "Installer Office" apparaît bien, preuve qu'un abonnement actif y est réellement associé.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.1</span>

Sur ta propre machine (ou celle que tu utilises habituellement), ouvre "Informations système" (Windows) et note : version du système d'exploitation, RAM installée, type de processeur (32 ou 64 bits). Compare ces valeurs au tableau de la section 2.1 et conclus si ta machine dépasse, atteint tout juste, ou n'atteint pas la configuration minimale recommandée.
</div>

**Corrigé :** réponse personnelle ; l'objectif est la démarche de vérification, pas un résultat particulier. Une machine sous Windows 11 avec 8 Go de RAM ou plus dépasse largement le minimum recommandé.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.2</span>

Ouvre Fichier > Compte dans Word (si déjà installé) et identifie : le type de produit installé, si le produit est activé, et quel compte est actuellement connecté. Si Word n'est pas encore installé sur ta machine, décris par écrit les étapes que tu suivrais, dans l'ordre, en te basant sur l'atelier 2.
</div>

**Corrigé :** réponse personnelle pour la première partie. Pour la seconde : (1) se connecter sur office.com avec le bon type de compte, (2) cliquer sur "Installer Office", (3) exécuter le fichier téléchargé et attendre la fin de l'installation, (4) lancer Word et se reconnecter avec le même compte, (5) vérifier l'activation dans Fichier > Compte.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai vérifié la configuration système de ma machine avant d'installer Word.</li>
<li>☐ Je sais distinguer un compte Microsoft personnel d'un compte professionnel/scolaire.</li>
<li>☐ J'ai installé Word (ou je sais exactement comment procéder) et vérifié son activation dans Fichier > Compte.</li>
<li>☐ Je sais accéder à Word Online sans aucune installation.</li>
<li>☐ J'ai configuré (ou je sais configurer) la langue d'affichage et de correction en français.</li>
<li>☐ Je connais la différence entre "Réparation rapide" et "Réparation en ligne".</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- Configuration minimale : Windows 10/11, 4 Go de RAM, 4 Go d'espace disque libre.
- Installation toujours via `office.com` > "Installer Office", avec le **bon type de compte** (personnel vs professionnel/scolaire).
- Vérifier l'activation : **Fichier > Compte**, mention "Produit activé".
- Langue : **Fichier > Options > Langue**, deux réglages distincts (édition et affichage).
- Problème d'installation : **Réparation rapide** d'abord, **Réparation en ligne** ensuite, désinstallation en dernier recours.

Aucun raccourci clavier propre à ce chapitre : les premiers raccourcis d'usage courant apparaissent au chapitre 5.
</div>

## FAQ

<dl class="faq">
<dt>Puis-je installer Word sur plusieurs ordinateurs avec le même abonnement Microsoft 365 ?</dt>
<dd>Oui, la plupart des formules Microsoft 365 personnelles et familiales autorisent l'installation sur plusieurs appareils (généralement jusqu'à 5) simultanément avec le même compte. Les formules professionnelles/éducation dépendent des règles définies par l'organisation.</dd>

<dt>Que se passe-t-il si mon abonnement Microsoft 365 expire ?</dt>
<dd>Word passe en mode "lecture seule" limité : tu peux encore consulter et imprimer tes documents, mais plus les modifier ni en créer de nouveaux, jusqu'au renouvellement de l'abonnement.</dd>

<dt>Dois-je désinstaller une ancienne version d'Office avant d'en installer une nouvelle ?</dt>
<dd>En général non : l'installeur de Microsoft 365 gère lui-même la mise à niveau. Une désinstallation manuelle préalable n'est recommandée qu'en cas de conflit avéré (section 2.10, symptôme de plantage à l'ouverture).</dd>

<dt>Word Online fonctionne-t-il sur n'importe quel navigateur ?</dt>
<dd>Oui, sur les navigateurs modernes courants (Edge, Chrome, Firefox, Safari). Une connexion Internet stable reste nécessaire, contrairement à Word Desktop qui fonctionne aussi hors ligne.</dd>
</dl>

## Références et ressources complémentaires

- Configuration système requise officielle pour Microsoft 365 : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Portail d'installation Microsoft 365 : [https://www.office.com](https://www.office.com)
- Microsoft pour les organisations à but non lucratif : [https://www.microsoft.com/fr-fr/nonprofits](https://www.microsoft.com/fr-fr/nonprofits)
- Outil de diagnostic et réparation Microsoft Support and Recovery Assistant : [https://aka.ms/SaRA](https://aka.ms/SaRA)

*Chapitre suivant : découverte de l'interface de Word — Ruban, onglets, barre d'accès rapide et mode Backstage — pour transformer cette installation fraîchement opérationnelle en un environnement de travail réellement maîtrisé.*
