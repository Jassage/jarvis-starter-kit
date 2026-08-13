<div class="chapitre-titre-num">ANNEXE G</div>

# Erreurs fréquentes récapitulées

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Toutes les erreurs signalées par un encadré ⚠️ « Attention » au fil du manuel, regroupées ici pour une révision rapide avant un examen, un entretien technique, ou simplement pour se rafraîchir la mémoire.
</div>

## Ordinateur et terminal (chapitres 1-2)

- Confondre "fermer une fenêtre" et "arrêter un processus" — fermer demande poliment, `Stop-Process -Force` (chapitre 17) force.
- Croire qu'un fichier supprimé disparaît instantanément du disque — il est seulement marqué réutilisable.
- Copier une commande Bash/Linux telle quelle dans PowerShell (`ls -la`) — fonctionne par coïncidence d'alias, pas par compatibilité réelle.

## CMD et Batch (chapitres 4-8)

- Chemin avec espaces sans guillemets (`cd Mes Documents` au lieu de `cd "Mes Documents"`).
- `cd` seul ne change pas de lecteur — `cd /d` est nécessaire.
- `echo` seul n'affiche pas une ligne vide — il faut `echo.` (avec le point).
- `xcopy` sans `/e` oublie les sous-dossiers vides.
- `robocopy` a des codes de sortie 0-7 qui sont des succès partiels — seul `≥ 8` est une vraie erreur.
- `setx` ne met pas à jour la session CMD actuelle ; `setx PATH` peut tronquer une valeur trop longue (limite de 1024 caractères).
- `%%F` dans un script Batch, `%F` seul en console interactive.
- Comparer des nombres avec `=` au lieu de `EQU` dans un `if` Batch.
- Guillemets manquants autour d'une variable Batch potentiellement vide (`if "%VAR%"=="1"`, jamais `if %VAR%==1`).

## PowerShell — bases (chapitres 9-16)

- Écrire un script avec des alias (`ls`, `curl`) plutôt que les vrais noms de cmdlets.
- Utiliser `Format-Table` avant la fin d'un pipeline — casse toute possibilité de tri/filtre ultérieur.
- Confondre `@()` (tableau) et `@{}` (hashtable).
- `+=` sur un tableau classique recrée toute la structure à chaque ajout — coûteux en boucle.
- Guillemets simples (`'...'`) n'interpolent jamais une variable, contrairement aux guillemets doubles.
- Utiliser `-eq` pour une comparaison de chaînes sensible à la casse (il faut `-ceq`).
- Confondre `foreach` (mot-clé) et `ForEach-Object` (cmdlet, seule utilisable dans un pipeline).
- Boucle infinie par oubli d'incrémentation dans un `while`.
- Tout `Write-Output` non capturé dans une fonction fait partie de sa valeur de retour.
- Oublier le `.\` obligatoire pour exécuter un script du dossier courant.

## Administration Windows (chapitres 17-19)

- `Stop-Process -Name` sur un nom correspondant à plusieurs processus les arrête tous, sans distinction.
- Oublier `-Force` sur `Stop-Service` quand des services dépendants tournent encore.
- Confondre le nom court (`wuauserv`) et le nom affiché (`Windows Update`) d'un service.
- Utiliser `Get-WmiObject` (obsolète, absente de PowerShell 7) au lieu de `Get-CimInstance`.

## Réseau et API (chapitres 20-21)

- Interpréter un ping échoué comme "le serveur est down" — de nombreux pare-feux bloquent ICMP en laissant passer HTTPS.
- Ne pas gérer les erreurs HTTP d'`Invoke-RestMethod` avec `try`/`catch`.
- Oublier `-ContentType "application/json"` avec un corps `ConvertTo-Json`.

## Sécurité (chapitre 22)

- Croire que `Set-ExecutionPolicy Bypass` est une solution acceptable en production.
- Stocker un secret en clair dans un script versionné, au lieu de `SecretManagement`/variables d'environnement.
- DPAPI (`ConvertFrom-SecureString` sans clé) ne déchiffre que sur la même machine/le même utilisateur.

## Automatisation et modules (chapitres 23-24)

- Ne jamais tester manuellement une tâche planifiée avant d'attendre son déclencheur programmé.
- Chemins relatifs dans un script destiné à une tâche planifiée — le répertoire de travail y diffère de la session interactive.
- Oublier `Export-ModuleMember` en fin de fichier `.psm1`.

## Remoting, Azure, DevOps (chapitres 25-28)

- Oublier de fermer (`Remove-PSSession`) une session distante persistante.
- Oublier d'arrêter/supprimer une VM Azure de test — elle facture tant qu'elle reste démarrée.
- Ne pas vérifier `$LASTEXITCODE` après une commande externe dans un pipeline CI/CD — un échec de test peut passer inaperçu.
- Croire que Git exécute nativement un fichier `.ps1` comme hook — un wrapper shell est nécessaire.

## Dépannage général (chapitre 29)

- Oublier `-ErrorAction Stop` sur une commande dont l'échec doit être intercepté par `catch`.
- `-Verbose` n'affiche rien sur une fonction sans `[CmdletBinding()]`.
- Sauter l'étape "collecter les informations" de la méthode de dépannage pour "gagner du temps" — c'est presque toujours ce qui en fait perdre le plus.

*Annexe suivante : les ressources officielles Microsoft pour aller plus loin.*
