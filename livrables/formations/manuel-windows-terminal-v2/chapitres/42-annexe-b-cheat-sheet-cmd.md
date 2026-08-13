<div class="chapitre-titre-num">ANNEXE B</div>

# Cheat sheet — 100 commandes CMD essentielles

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Liste organisée par catégorie, commandes réellement natives ou universellement disponibles sur Windows (pas de padding artificiel) — utilise `<commande> /?` (chapitre 4) pour l'aide détaillée de chacune.
</div>

## B.1 Navigation et système de fichiers

| Commande | Rôle |
|---|---|
| `dir` | Lister le contenu d'un dossier |
| `cd` / `chdir` | Changer de dossier |
| `cd ..` | Remonter au dossier parent |
| `cd \` | Aller à la racine du lecteur courant |
| `cd /d` | Changer de lecteur et de dossier en une commande |
| `tree` | Afficher l'arborescence d'un dossier |
| `cls` | Effacer l'écran |
| `echo` | Afficher du texte |
| `type` | Afficher le contenu d'un fichier texte |
| `more` | Afficher un fichier page par page |
| `help` | Lister ou détailler l'aide d'une commande |
| `<commande> /?` | Aide détaillée d'une commande précise |

## B.2 Gestion des fichiers et dossiers

| Commande | Rôle |
|---|---|
| `mkdir` / `md` | Créer un dossier |
| `rmdir` / `rd` | Supprimer un dossier |
| `copy` | Copier un ou plusieurs fichiers |
| `xcopy` | Copier des arborescences avec options avancées |
| `robocopy` | Copier/synchroniser des arborescences, robuste et reprenable |
| `move` | Déplacer ou renommer un fichier/dossier |
| `ren` / `rename` | Renommer un fichier ou dossier |
| `del` / `erase` | Supprimer un ou plusieurs fichiers |
| `attrib` | Afficher/modifier les attributs (caché, lecture seule) |
| `fc` | Comparer le contenu de deux fichiers |
| `comp` | Comparer deux fichiers octet par octet |
| `findstr` | Rechercher du texte dans des fichiers |
| `sort` | Trier des lignes de texte |
| `clip` | Copier une sortie vers le presse-papiers |
| `assoc` | Afficher/modifier les associations de fichiers |
| `ftype` | Afficher/modifier le type de fichier associé |
| `expand` | Extraire un fichier compressé (.cab) |
| `compact` | Compresser/décompresser des fichiers NTFS |
| `subst` | Associer un chemin à une lettre de lecteur virtuelle |
| `takeown` | Prendre possession d'un fichier/dossier |
| `icacls` | Afficher/modifier les permissions NTFS |
| `cipher` | Chiffrer/déchiffrer des fichiers, ou effacer l'espace libre |

## B.3 Disques et systèmes de fichiers

| Commande | Rôle |
|---|---|
| `chkdsk` | Vérifier et réparer un disque |
| `format` | Formater un disque/partition |
| `diskpart` | Gestion avancée des disques et partitions (mode interactif) |
| `fsutil` | Utilitaires avancés du système de fichiers |
| `mountvol` | Gérer les points de montage de volumes |
| `vol` | Afficher le label et le numéro de série d'un volume |
| `label` | Modifier le label d'un volume |
| `defrag` | Défragmenter un disque |
| `sfc` | Vérifier/réparer les fichiers système protégés |
| `dism` | Gérer les images et fonctionnalités Windows |

## B.4 Variables et scripts Batch

| Commande | Rôle | Chapitre |
|---|---|---|
| `set` | Afficher/définir une variable (session courante) | 7 |
| `setx` | Définir une variable de façon persistante | 7 |
| `if` | Structure conditionnelle en script batch | 8 |
| `for` / `for /l` | Boucle en script batch | 8 |
| `goto` | Saut vers une étiquette | 8 |
| `call` | Appeler un sous-programme (label) | 8 |
| `pause` | Suspendre l'exécution jusqu'à une touche | 8 |
| `exit` | Quitter CMD ou un script (avec code `/b`) | 8 |
| `title` | Changer le titre de la fenêtre | 5 |
| `color` | Changer les couleurs de la console | 5 |
| `prompt` | Personnaliser l'invite de commandes | 5 |
| `doskey` | Rappeler et rééditer les commandes précédentes | 5 |
| `setlocal` / `endlocal` | Isoler les variables d'un script | 8 |

## B.5 Processus et système

| Commande | Rôle |
|---|---|
| `tasklist` | Lister les processus en cours |
| `taskkill` | Arrêter un processus |
| `sc` | Gérer les services Windows |
| `net start` / `net stop` | Démarrer/arrêter un service |
| `schtasks` | Gérer les tâches planifiées en CMD |
| `shutdown` | Éteindre, redémarrer, ou verrouiller la machine |
| `logoff` | Déconnecter la session utilisateur |
| `systeminfo` | Afficher des informations système détaillées |
| `whoami` | Afficher l'utilisateur actuellement connecté |
| `hostname` | Afficher le nom de la machine |
| `ver` | Afficher la version de Windows |
| `driverquery` | Lister les pilotes installés |
| `powercfg` | Gérer les options d'alimentation |
| `tzutil` | Afficher/modifier le fuseau horaire |
| `w32tm` | Gérer la synchronisation de l'heure |
| `wevtutil` | Consulter/gérer les journaux d'événements en CMD |
| `openfiles` | Lister les fichiers ouverts à distance |
| `runas` | Exécuter une commande avec un autre compte |

## B.6 Réseau

| Commande | Rôle | Chapitre |
|---|---|---|
| `ipconfig` | Afficher/gérer la configuration IP | 20 |
| `ping` | Tester la connectivité vers une machine | 20 |
| `tracert` | Tracer le chemin réseau vers une destination | 20 |
| `pathping` | Combiner tracert et statistiques de perte de paquets | 20 |
| `netstat` | Afficher les connexions réseau actives | 20 |
| `nslookup` | Interroger le DNS | 20 |
| `arp` | Afficher/gérer la table ARP | 20 |
| `route` | Afficher/gérer la table de routage | 20 |
| `netsh` | Configuration réseau avancée (pare-feu, interfaces) | 22 |
| `net use` | Gérer les connexions à des partages réseau | - |
| `net view` | Lister les ressources partagées d'un réseau | - |
| `getmac` | Afficher l'adresse MAC des cartes réseau | - |
| `nbtstat` | Statistiques et résolution NetBIOS | - |

## B.7 Registre et divers

| Commande | Rôle |
|---|---|
| `reg` | Consulter/modifier/exporter le registre depuis CMD |
| `bcdedit` | Gérer la configuration de démarrage |
| `gpupdate` | Forcer l'actualisation des stratégies de groupe |
| `gpresult` | Afficher les stratégies de groupe appliquées |
| `certutil` | Gérer les certificats et calculer des empreintes |
| `wmic` | Interroger WMI depuis CMD (obsolescent, cf. chapitre 19 pour l'équivalent PowerShell) |
| `msg` | Envoyer un message à un utilisateur connecté |
| `chcp` | Afficher/changer la page de codes active |
| `path` | Afficher/modifier le PATH de la session |
| `ftp` | Client FTP en ligne de commande |
| `telnet` | Client Telnet (à installer séparément) |

*Annexe suivante : cheat sheet des 200 cmdlets PowerShell essentielles.*
