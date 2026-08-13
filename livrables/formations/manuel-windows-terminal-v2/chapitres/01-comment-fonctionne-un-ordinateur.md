<div class="chapitre-titre-num">CHAPITRE 1</div>

# Comment fonctionne un ordinateur ?

## 🎯 Objectifs

À la fin de ce chapitre, tu sauras expliquer avec tes propres mots ce que sont un processeur, une mémoire RAM, un disque, un système d'exploitation, un fichier, un dossier, un programme, un processus, un service et une connexion réseau — et pourquoi ces neuf notions sont indispensables pour comprendre tout ce que tu feras ensuite dans un terminal.

Aucune commande ne sera tapée dans ce chapitre. C'est normal : avant de conduire une voiture, il vaut mieux savoir à quoi servent le moteur, les roues et le volant. Avant de taper une commande, il vaut mieux savoir à quoi elle s'adresse réellement dans la machine.

## Prérequis

Aucun. Ce chapitre est le tout premier du manuel.

## 🧠 Comprendre : pourquoi commencer par la machine, pas par le terminal ?

**Le problème.** Un débutant qui apprend une commande sans comprendre ce qu'elle manipule finit par la retenir par cœur, comme une formule magique, sans savoir pourquoi elle fonctionne ni pourquoi elle échoue parfois. Résultat : la moindre erreur inattendue devient incompréhensible, et le débutant se sent perdu.

Ce manuel prend le parti inverse : comprendre d'abord **ce qu'il y a dans la machine**, pour que chaque commande future se rattache à quelque chose de concret. Une commande comme `Get-Process` ne sera plus une formule à mémoriser, mais une question logique : « montre-moi la liste des programmes actuellement en train de tourner ».

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie générale du chapitre</span>
Un ordinateur, c'est une **cuisine de restaurant**. Le chef cuisinier (le processeur) exécute des recettes. Le plan de travail (la mémoire RAM) contient les ingrédients en cours d'utilisation, à portée de main mais qui disparaissent en fin de service. Le garde-manger et les frigos (le disque dur) conservent tout, même le restaurant fermé. Le règlement de la cuisine (le système d'exploitation) organise qui a le droit de faire quoi, dans quel ordre, avec quels outils. Et la porte vers la salle et les fournisseurs (le réseau) permet à la cuisine de communiquer avec l'extérieur.
</div>

## 1.1 Le processeur (CPU) : celui qui calcule

**Le problème.** Un ordinateur doit exécuter des instructions extrêmement simples (additionner deux nombres, comparer deux valeurs, déplacer une donnée) des milliards de fois par seconde. Il faut un composant physique dédié à ça, et seulement à ça.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **processeur** (CPU, *Central Processing Unit*) est le chef cuisinier. Il ne stocke rien lui-même, il **exécute** : il prend une instruction, la réalise, passe à la suivante. Un processeur "4 cœurs" (4 *cores*), c'est un peu comme 4 chefs qui peuvent cuisiner en même temps dans la même cuisine, chacun sur sa propre tâche.
</div>

**Explication simple.** Toute action sur un ordinateur — afficher une fenêtre, calculer une addition, vérifier un mot de passe — se traduit, au final, par des millions d'instructions données au processeur. Sa vitesse se mesure en GHz (gigahertz) : le nombre de milliards de cycles qu'il peut effectuer chaque seconde. Plus un programme demande de calculs complexes (montage vidéo, jeu vidéo), plus il sollicite le processeur.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur fréquente</span>
Croire que "plus de GHz" veut toujours dire "plus rapide en toutes circonstances". En réalité, le nombre de cœurs, l'architecture du processeur et le type de tâche comptent tout autant. Un programme mal écrit qui n'utilise qu'un seul cœur n'ira pas plus vite sur un processeur à 16 cœurs.
</div>

Tu croiseras ce mot très vite : au chapitre 17, la commande PowerShell `Get-Process` affichera justement une colonne `CPU`, qui indique combien de temps processeur chaque programme a consommé.

## 1.2 La mémoire RAM : l'espace de travail immédiat

**Le problème.** Le processeur calcule extrêmement vite, mais il a besoin que les données sur lesquelles il travaille soient disponibles tout aussi vite, à portée de main. Aller chercher chaque donnée sur le disque dur à chaque calcul serait beaucoup trop lent.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
La **mémoire RAM** (*Random Access Memory*) est le plan de travail du chef. Les ingrédients qu'il utilise là, maintenant, pour la recette en cours, sont posés dessus. Le plan de travail est rapide d'accès, mais limité en taille — et surtout, **à la fin du service (quand on éteint l'ordinateur), tout ce qui était sur le plan de travail est débarrassé**. Rien n'y reste durablement.
</div>

**Explication simple.** La RAM stocke temporairement les programmes ouverts et les données en cours de traitement. Elle est très rapide, mais **volatile** : tout son contenu disparaît à l'extinction de l'ordinateur (ou en cas de coupure de courant). C'est pourquoi un document non enregistré est perdu si le programme plante ou si l'ordinateur s'éteint brutalement — il n'existait que dans la RAM.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : volatile</span>
Une mémoire "volatile" perd son contenu dès qu'elle n'est plus alimentée en électricité. À l'inverse, une mémoire "non volatile" (comme le disque dur) conserve son contenu même hors tension.
</div>

## 1.3 Le disque : le stockage permanent

**Le problème.** Il faut bien que les fichiers, les photos, les programmes installés et le système d'exploitation lui-même survivent quand on éteint l'ordinateur.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **disque** (disque dur mécanique ou SSD plus moderne et plus rapide) est le garde-manger et les frigos du restaurant. Beaucoup plus grand que le plan de travail, beaucoup plus lent à y accéder qu'à saisir un ingrédient déjà posé devant soi, mais son contenu **reste en place même la cuisine fermée**.
</div>

**Explication simple.** Le disque conserve durablement tout ce qui doit survivre à un redémarrage : le système d'exploitation, les programmes installés, tes documents. Quand tu "enregistres" un fichier, tu demandes précisément que son contenu passe de la RAM (temporaire) au disque (permanent).

| Mémoire | Vitesse | Capacité typique | Contenu perdu à l'extinction ? |
|---|---|---|---|
| RAM | Très rapide | 8 à 32 Go sur un PC courant | Oui |
| Disque (SSD/HDD) | Plus lente que la RAM | 256 Go à plusieurs To | Non |

## 1.4 Le système d'exploitation : le règlement de la cuisine

**Le problème.** Le processeur, la RAM et le disque ne savent, seuls, rien faire d'utile : il faut un chef d'orchestre qui décide quel programme a le droit d'utiliser le processeur à quel moment, qui gère l'accès aux fichiers, qui pilote l'écran, le clavier, le réseau.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **système d'exploitation** (Windows, dans ce manuel) est le règlement de la cuisine : qui a accès à quel plan de travail, dans quel ordre les commandes sont préparées, comment on partage les ustensiles entre plusieurs chefs. Windows Terminal, CMD et PowerShell (chapitre 2) sont des façons de **parler directement** à ce règlement, plutôt que de cliquer sur des boutons.
</div>

**Explication simple.** Windows est le logiciel qui démarre en premier, prend le contrôle du matériel (processeur, RAM, disque, écran, clavier, réseau), et fournit aux autres programmes un terrain de jeu organisé et sécurisé. C'est lui qui décide, par exemple, qu'un programme ne peut pas lire les fichiers d'un autre utilisateur sans autorisation (notion développée au chapitre 22, sécurité).

## 1.5 Fichiers et dossiers : comment les données sont rangées

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **dossier** est une armoire. Un **fichier** est un document rangé dans cette armoire. Une armoire peut contenir d'autres armoires plus petites (des sous-dossiers), imbriquées les unes dans les autres — c'est ce qu'on appelle une **arborescence**.
</div>

**Explication simple.** Sur le disque, tout est organisé en fichiers (le contenu réel : un texte, une image, un programme) rangés dans des dossiers (des conteneurs qui les regroupent). L'adresse complète d'un fichier, du disque jusqu'à lui, s'appelle son **chemin** (*path*) — par exemple `C:\Users\Jaslin\Documents\rapport.docx`. Tu manipuleras des chemins dans presque chaque commande de ce manuel, dès le chapitre 4.

## 1.6 Programmes et processus : la différence essentielle

**Le problème.** "Ouvrir Word" et "Word en train de tourner sur ton écran en ce moment" ne désignent pas exactement la même chose, et cette nuance est présente partout en administration système.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **programme** est une recette écrite dans un livre de cuisine : figée, rangée sur une étagère, elle ne fait rien tant que personne ne la cuisine. Un **processus** est cette recette **en train d'être préparée**, ici et maintenant, par un chef, avec des ingrédients occupés sur le plan de travail (de la RAM consommée).
</div>

**Explication simple.** Un **programme** est un fichier stocké sur le disque (par exemple `notepad.exe`). Un **processus** est une instance de ce programme **en cours d'exécution**, avec de la mémoire RAM qui lui est allouée et un peu de temps processeur. Tu peux ouvrir le Bloc-notes deux fois : un seul programme sur le disque, mais deux processus distincts en RAM, chacun avec sa propre fenêtre. Le chapitre 17 te montrera comment lister, arrêter et démarrer des processus avec PowerShell.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : PID</span>
Chaque processus reçoit, à son démarrage, un numéro unique appelé **PID** (*Process ID*). C'est ce numéro, plutôt que le nom du programme (qui peut se répéter), que Windows utilise en interne pour désigner précisément un processus parmi tous ceux en cours d'exécution.
</div>

## 1.7 Les services : des programmes sans fenêtre

**Le problème.** Certains programmes doivent tourner en permanence, sans qu'un utilisateur soit connecté ni ne clique sur rien — par exemple, le programme qui gère l'impression, ou celui qui vérifie l'heure du système.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **service** est un employé de cuisine qui travaille en coulisses, sans jamais venir en salle : il n'a pas de fenêtre visible, il tourne en arrière-plan, souvent démarré automatiquement à l'ouverture du restaurant (au démarrage de Windows) et jamais arrêté tant que tout va bien.
</div>

**Explication simple.** Un service Windows est un processus particulier, sans interface graphique, conçu pour tourner en continu et démarrer automatiquement avec le système. Le service d'impression (`Spooler`), par exemple, doit être actif dès que Windows démarre, même si tu n'imprimes rien pendant des heures. Le chapitre 18 t'apprendra à lister, démarrer, arrêter et redémarrer des services.

## 1.8 Le réseau : parler à d'autres ordinateurs

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **réseau**, c'est la porte de service de la cuisine, reliée aux fournisseurs et à la salle. Sans elle, la cuisine tournerait en circuit fermé, incapable de recevoir des commandes de la salle ou des livraisons des fournisseurs.
</div>

**Explication simple.** Le réseau permet à ton ordinateur d'échanger des informations avec d'autres machines : ton routeur, un serveur web à l'autre bout du monde, une imprimante partagée. Chaque appareil sur un réseau possède une **adresse IP**, un peu comme une adresse postale, qui permet de savoir à qui envoyer quoi. La partie 12 de ce manuel (chapitre 20) est entièrement consacrée au diagnostic réseau.

## 🔍 Décortiquons : comment tout ça travaille ensemble

Prenons un exemple très concret : tu double-cliques sur l'icône du Bloc-notes.

```{.uml}
1. Tu double-cliques                → Windows (le systeme d'exploitation) recoit l'ordre
2. Windows lit le programme          → le fichier notepad.exe est lu depuis le DISQUE
3. Chargement en memoire             → le programme est copie dans la RAM (rapide d'acces)
4. Creation d'un PROCESSUS           → Windows attribue un PID, du temps de PROCESSEUR
5. Affichage                          → une fenetre apparait a l'ecran
6. Tu tapes du texte                  → le texte vit dans la RAM (pas encore sur le disque)
7. Tu cliques "Enregistrer"          → le contenu passe de la RAM vers un FICHIER sur le DISQUE
8. Tu fermes le Bloc-notes            → le PROCESSUS se termine, la RAM qu'il utilisait est liberee
```

C'est exactement cette chaîne d'événements que les commandes de ce manuel te permettront d'observer et de contrôler directement, sans passer par la souris.

## ⚠️ Attention : erreurs fréquentes de compréhension

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre "fermer une fenêtre" et "arrêter un processus"</span>
Cliquer sur la croix d'une fenêtre demande **poliment** au programme de se terminer. Le programme peut parfois ignorer cette demande (il est bloqué, il attend une réponse). C'est pour ça que le Gestionnaire des tâches — et plus tard la commande PowerShell `Stop-Process` (chapitre 17) — existe : pour forcer l'arrêt d'un processus qui ne répond plus.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Croire qu'un fichier "supprimé" disparaît instantanément du disque</span>
Supprimer un fichier (vers la Corbeille) ne fait, dans un premier temps, que marquer son emplacement comme "réutilisable" par Windows. C'est pour cette raison qu'un outil de récupération de données peut parfois retrouver un fichier supprimé récemment : les données physiques sur le disque n'ont pas forcément été réécrites tout de suite.
</div>

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Ouvre le Gestionnaire des tâches (`Ctrl+Maj+Échap`). Trouve l'onglet "Processus". Repère trois programmes actuellement ouverts sur ta machine et note, pour chacun, une estimation visuelle de leur consommation CPU et Mémoire.
</div>

**✅ Correction.** Tu devrais voir une liste de lignes, chacune représentant un **processus** (section 1.6), avec deux colonnes numériques : "CPU" (le pourcentage de temps processeur consommé en ce moment, section 1.1) et "Mémoire" (la quantité de RAM occupée, section 1.2). Un navigateur avec plusieurs onglets ouverts consomme généralement beaucoup plus de mémoire qu'un simple Bloc-notes vide — chaque onglet peut créer son propre processus.

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2</span>

Dans le Gestionnaire des tâches, clique sur l'onglet "Services". Trouve un service dont le statut est "En cours d'exécution" et un autre "Arrêté". D'après la section 1.7, pourquoi certains services tournent-ils en permanence alors que d'autres restent arrêtés la plupart du temps ?
</div>

**✅ Correction.** Un service tourne en permanence quand une fonctionnalité doit être disponible à tout moment sans intervention de l'utilisateur (le service Windows Update, par exemple, doit pouvoir vérifier les mises à jour même si personne n'est devant l'écran). Un service reste arrêté par défaut quand il correspond à une fonctionnalité rarement utilisée, démarrée uniquement à la demande (par exemple un service lié à un périphérique branché occasionnellement), pour ne pas consommer de RAM et de CPU inutilement en continu.

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 1.3</span>

Sans utiliser encore aucune commande (ce sera l'objet des chapitres suivants), essaie de deviner : si tu devais écrire, en une phrase, la différence entre "un programme installé sur mon ordinateur" et "l'utilisation d'Internet pour aller sur un site web", quels composants du chapitre (processeur, RAM, disque, réseau...) seraient impliqués dans chaque cas, et lesquels seraient communs aux deux ?
</div>

**✅ Correction du défi.** Un programme installé sollicite principalement le disque (où il est stocké), la RAM (quand il tourne) et le processeur (pour calculer) — le réseau n'intervient que s'il a besoin d'aller chercher des données en ligne. Visiter un site web sollicite en plus, et de façon indispensable, le réseau : ton ordinateur envoie une requête à un serveur distant (un autre ordinateur, ailleurs) et reçoit une réponse. Les deux cas utilisent systématiquement processeur, RAM et système d'exploitation ; seul le réseau distingue vraiment les deux usages.

## 🎯 Ce que tu sais maintenant

- Le **processeur** exécute des instructions ; la **RAM** est un espace de travail rapide mais temporaire ; le **disque** conserve les données de façon permanente.
- Le **système d'exploitation** (Windows) organise l'accès de tous les programmes au matériel.
- Un **fichier** est un document, un **dossier** est un conteneur de fichiers (et d'autres dossiers), organisés en **arborescence**.
- Un **programme** est un fichier inerte sur le disque ; un **processus** est ce programme en cours d'exécution, avec un **PID** unique.
- Un **service** est un processus sans fenêtre, tournant en arrière-plan, souvent démarré automatiquement.
- Le **réseau** permet à ton ordinateur de communiquer avec d'autres machines via des adresses IP.

*Chapitre suivant : qu'est-ce qu'un terminal, et pourquoi Windows en propose-t-il plusieurs (CMD, PowerShell, Windows Terminal) ?*
