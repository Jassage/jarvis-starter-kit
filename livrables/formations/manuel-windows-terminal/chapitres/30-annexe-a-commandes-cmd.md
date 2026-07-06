<div class="chapitre-titre-num">ANNEXE A</div>

# Référence des commandes CMD

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Cette annexe recense les commandes CMD réellement utiles en pratique, organisées par catégorie, avec leur syntaxe essentielle et un renvoi au chapitre où chacune est expliquée en détail. Plutôt que de lister artificiellement des centaines d'entrées redondantes ou obsolètes, ce choix privilégie une référence dense mais honnête — l'ensemble des commandes internes et externes couramment employées sous Windows.
</div>

## A.1 Navigation et système de fichiers

| Commande | Usage | Chapitre |
|---|---|---|
| `cd` / `chdir` | Changer de répertoire | 3 |
| `dir` | Lister le contenu d'un dossier | 3 |
| `md` / `mkdir` | Créer un dossier | 4 |
| `rd` / `rmdir` | Supprimer un dossier | 4 |
| `del` / `erase` | Supprimer un ou plusieurs fichiers | 4 |
| `copy` | Copier un ou plusieurs fichiers | 4 |
| `xcopy` | Copier des arborescences avec options avancées | 4 |
| `robocopy` | Copier/synchroniser des arborescences, robuste et reprenable | 4 |
| `move` | Déplacer ou renommer un fichier/dossier | 4 |
| `ren` / `rename` | Renommer un fichier ou dossier | 4 |
| `type` | Afficher le contenu d'un fichier texte | 3 |
| `attrib` | Afficher/modifier les attributs d'un fichier (lecture seule, caché...) | 4 |
| `tree` | Afficher l'arborescence d'un dossier | 3 |
| `fc` | Comparer le contenu de deux fichiers | 4 |
| `comp` | Comparer deux fichiers octet par octet | 4 |

## A.2 Disques et systèmes de fichiers

| Commande | Usage | Chapitre |
|---|---|---|
| `chkdsk` | Vérifier et réparer un disque | 5 |
| `format` | Formater un disque/partition | 5 |
| `diskpart` | Gestion avancée des disques et partitions (mode interactif) | 5 |
| `fsutil` | Utilitaires avancés du système de fichiers | 5 |
| `mountvol` | Gérer les points de montage de volumes | 5 |
| `vol` | Afficher le label et le numéro de série d'un volume | 5 |
| `label` | Modifier le label d'un volume | 5 |
| `defrag` | Défragmenter un disque | 5 |

## A.3 Variables, environnement et scripts batch

| Commande | Usage | Chapitre |
|---|---|---|
| `set` | Afficher/définir une variable d'environnement | 6 |
| `setx` | Définir une variable d'environnement de façon persistante | 6 |
| `echo` | Afficher du texte / activer-désactiver l'écho des commandes | 7 |
| `if` | Structure conditionnelle en script batch | 7 |
| `for` | Boucle en script batch | 7 |
| `goto` | Saut vers une étiquette dans un script batch | 7 |
| `call` | Appeler un autre script/sous-routine batch | 7 |
| `pause` | Suspendre l'exécution jusqu'à une touche | 7 |
| `exit` | Quitter CMD ou un script (avec code de sortie `/b`) | 7 |
| `cls` | Effacer l'écran | 3 |
| `title` | Changer le titre de la fenêtre CMD | 3 |

## A.4 Processus et système

| Commande | Usage | Chapitre |
|---|---|---|
| `tasklist` | Lister les processus en cours | 15 |
| `taskkill` | Arrêter un processus | 15 |
| `sc` | Gérer les services Windows (mode CMD) | 15 |
| `shutdown` | Éteindre, redémarrer, ou verrouiller la machine | 2 |
| `systeminfo` | Afficher des informations système détaillées | 2 |
| `whoami` | Afficher l'utilisateur actuellement connecté | 16 |
| `hostname` | Afficher le nom de la machine | 2 |
| `ver` | Afficher la version de Windows | 2 |

## A.5 Réseau

| Commande | Usage | Chapitre |
|---|---|---|
| `ipconfig` | Afficher/gérer la configuration IP | 18 |
| `ping` | Tester la connectivité vers une machine | 18 |
| `tracert` | Tracer le chemin réseau vers une destination | 18 |
| `pathping` | Combiner tracert et statistiques de perte de paquets | 18 |
| `netstat` | Afficher les connexions réseau actives | 18 |
| `nslookup` | Interroger le DNS | 18 |
| `arp` | Afficher/gérer la table ARP | 18 |
| `route` | Afficher/gérer la table de routage | 18 |
| `netsh` | Configuration réseau avancée (pare-feu, interfaces) | 19 |
| `net use` | Gérer les connexions à des partages réseau | 19 |

## A.6 Registre et divers

| Commande | Usage | Chapitre |
|---|---|---|
| `reg` | Consulter/modifier/exporter le registre depuis CMD | 19 |
| `findstr` | Rechercher du texte dans des fichiers (équivalent grep) | 4 |
| `sort` | Trier des lignes de texte | 4 |
| `more` | Afficher un fichier page par page | 3 |
| `clip` | Copier une sortie vers le presse-papiers | 3 |
| `help` | Afficher l'aide d'une commande CMD | 2 |
| `assoc` | Afficher/modifier les associations de fichiers | 4 |
| `ftype` | Afficher/modifier le type de fichier associé à une commande | 4 |

*Annexe suivante : la référence des cmdlets PowerShell essentielles.*
