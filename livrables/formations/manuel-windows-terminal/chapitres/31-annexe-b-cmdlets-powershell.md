<div class="chapitre-titre-num">ANNEXE B</div>

# Référence des cmdlets PowerShell essentielles

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Cette référence regroupe les cmdlets réellement employées dans ce manuel et dans la pratique professionnelle courante, organisées par domaine. `Get-Command -Module <Nom>` permet à tout moment de retrouver la liste exhaustive et à jour des cmdlets d'un module donné directement depuis la console.
</div>

## B.1 Cœur du langage et objets

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-Command` | Rechercher une cmdlet par nom/verbe/module | 8 |
| `Get-Help` | Afficher l'aide d'une cmdlet | 8 |
| `Get-Member` | Lister propriétés et méthodes d'un objet | 10 |
| `Select-Object` | Sélectionner des propriétés ou un sous-ensemble d'objets | 10 |
| `Where-Object` | Filtrer des objets selon une condition | 10 |
| `Sort-Object` | Trier des objets | 10 |
| `Group-Object` | Regrouper des objets par propriété | 10 |
| `Measure-Object` | Calculer somme/moyenne/min/max sur une propriété | 10 |
| `ForEach-Object` | Appliquer une action à chaque objet du pipeline | 13 |
| `Format-Table` / `Format-List` | Contrôler l'affichage des résultats | 10 |
| `New-Object` | Créer une instance d'un type .NET | 10 |
| `Compare-Object` | Comparer deux ensembles d'objets | 10 |

## B.2 Variables, conditions, boucles, fonctions

| Cmdlet / mot-clé | Usage | Chapitre |
|---|---|---|
| `Get-Variable` / `Set-Variable` | Consulter/définir une variable par cmdlet | 11 |
| `if` / `elseif` / `else` | Structure conditionnelle | 12 |
| `switch` | Structure de choix multiples | 12 |
| `foreach` / `for` / `while` / `do-while` | Boucles | 13 |
| `function` | Déclarer une fonction | 14 |
| `param` | Déclarer les paramètres d'une fonction | 14 |
| `return` | Retourner une valeur depuis une fonction | 14 |

## B.3 Fichiers et système

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-ChildItem` | Lister fichiers/dossiers (équivalent `dir`/`ls`) | 9 |
| `Get-Content` / `Set-Content` | Lire/écrire le contenu d'un fichier | 9 |
| `Add-Content` | Ajouter du contenu à un fichier | 9 |
| `Copy-Item` / `Move-Item` / `Remove-Item` | Copier/déplacer/supprimer | 9 |
| `New-Item` | Créer un fichier ou dossier | 9 |
| `Test-Path` | Vérifier l'existence d'un chemin | 9 |
| `Select-String` | Rechercher du texte dans des fichiers (grep) | 17 |
| `Compress-Archive` / `Expand-Archive` | Compresser/décompresser des archives ZIP | 17 |
| `Get-FileHash` | Calculer l'empreinte cryptographique d'un fichier | 17 |

## B.4 Processus, services, tâches planifiées

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-Process` / `Start-Process` / `Stop-Process` | Gérer les processus | 15 |
| `Get-Service` / `Start-Service` / `Stop-Service` / `Restart-Service` | Gérer les services | 15 |
| `Set-Service` | Configurer un service (type de démarrage) | 15 |
| `New-ScheduledTaskAction` / `Trigger` / `Principal` | Composer une tâche planifiée | 15 |
| `Register-ScheduledTask` / `Get-ScheduledTask` / `Unregister-ScheduledTask` | Gérer les tâches planifiées | 15 |

## B.5 Utilisateurs, groupes, Active Directory

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-LocalUser` / `New-LocalUser` / `Remove-LocalUser` | Comptes locaux | 16 |
| `Get-LocalGroup` / `Add-LocalGroupMember` | Groupes locaux | 16 |
| `Get-ADUser` / `New-ADUser` / `Set-ADUser` | Utilisateurs Active Directory | 21 |
| `Get-ADGroup` / `Add-ADGroupMember` | Groupes Active Directory | 21 |
| `Search-ADAccount` / `Unlock-ADAccount` | Comptes verrouillés/expirés | 21 |

## B.6 Réseau

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-NetIPConfiguration` / `Get-NetIPAddress` | Configuration IP | 18 |
| `Test-Connection` | Équivalent objet de `ping` | 18 |
| `Test-NetConnection` | Tester un port/une route spécifique | 18 |
| `Get-NetTCPConnection` | Connexions TCP actives | 18 |
| `Resolve-DnsName` | Résolution DNS | 18 |
| `Get-NetAdapter` | Cartes réseau | 18 |
| `Invoke-WebRequest` / `Invoke-RestMethod` | Requêtes HTTP/API REST | 18 |

## B.7 Registre, pare-feu, Defender, disques, partages

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-Item` / `New-Item` (sur `HKLM:`/`HKCU:`) | Registre Windows | 19 |
| `Get-NetFirewallRule` / `New-NetFirewallRule` | Pare-feu Windows | 19 |
| `Get-MpComputerStatus` / `Start-MpScan` | Windows Defender | 19 |
| `Get-Disk` / `New-Partition` / `Format-Volume` | Gestion de disques | 19 |
| `Get-Volume` | Volumes et espace disque | 19 |
| `New-SmbShare` / `Grant-SmbShareAccess` | Partages réseau SMB | 19 |

## B.8 WMI/CIM

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-CimInstance` | Interroger une classe CIM/WMI | 20 |
| `Invoke-CimMethod` | Invoquer une méthode CIM | 20 |
| `New-CimSession` / `Remove-CimSession` | Session CIM distante | 20 |
| `Get-CimClass` | Explorer les classes CIM disponibles | 20 |

## B.9 Sécurité

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Get-Acl` / `Set-Acl` | Permissions NTFS | 22 |
| `Get-ExecutionPolicy` / `Set-ExecutionPolicy` | Politique d'exécution de scripts | 22 |
| `Set-AuthenticodeSignature` / `Get-AuthenticodeSignature` | Signature de scripts | 22 |
| `ConvertTo-SecureString` / `ConvertFrom-SecureString` | Chiffrement DPAPI | 22 |
| `Set-Secret` / `Get-Secret` | Gestion de secrets (SecretManagement) | 22 |
| `Get-WinEvent` / `Get-EventLog` | Journaux d'évènements | 22 |

## B.10 Modules, remoting, cloud

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Import-Module` / `Export-ModuleMember` | Modules PowerShell | 23 |
| `Install-Module` / `Find-Module` | PowerShell Gallery | 23 |
| `Invoke-Command` | Exécution distante | 23 |
| `New-PSSession` / `Enter-PSSession` / `Remove-PSSession` | Sessions distantes persistantes | 23 |
| `Connect-AzAccount` | Connexion à Azure | 24 |
| `Get-AzVM` / `New-AzVM` / `Remove-AzVM` | Machines virtuelles Azure | 24 |
| `New-AzResourceGroup` / `Remove-AzResourceGroup` | Groupes de ressources Azure | 24 |

## B.11 Débogage

| Cmdlet | Usage | Chapitre |
|---|---|---|
| `Set-PSBreakpoint` | Points d'arrêt (ligne, commande, variable) | 27 |
| `Write-Verbose` / `Write-Debug` | Sorties de diagnostic activables | 27 |
| `Measure-Command` | Mesurer le temps d'exécution | 27 |

*Annexe suivante : raccourcis clavier et alias PowerShell.*
