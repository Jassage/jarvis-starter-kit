<div class="chapitre-titre-num">CHAPITRE 19</div>

# Administration Windows

## Objectifs pédagogiques

Manipuler le registre Windows, configurer le pare-feu et Windows Defender, gérer les disques via PowerShell, et créer/consulter des partages réseau.

## Prérequis

Chapitres 9-18. Droits administrateur nécessaires pour la majorité des commandes.

## 19.1 Le registre Windows : structure de base

<div class="encadre astuce">
<span class="encadre-titre">💡 Le registre est accessible comme un système de fichiers en PowerShell</span>
PowerShell traite le registre Windows comme un **lecteur** (`HKLM:`, `HKCU:`), navigable exactement comme `C:` — une unification élégante entre deux mondes historiquement séparés (fichiers vs registre).
</div>

| Racine | Signification |
|---|---|
| `HKLM:` | HKEY_LOCAL_MACHINE — paramètres machine, tous utilisateurs |
| `HKCU:` | HKEY_CURRENT_USER — paramètres de l'utilisateur actuel uniquement |
| `HKCR:` | HKEY_CLASSES_ROOT — associations de fichiers, objets COM |
| `HKU:` | HKEY_USERS — profils de tous les utilisateurs |

```powershell
Get-ChildItem HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion
Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion" -Name "ProgramFilesDir"

New-Item -Path "HKCU:\Software\MonApplication" -Force
Set-ItemProperty -Path "HKCU:\Software\MonApplication" -Name "Version" -Value "1.0.0"
Get-ItemProperty -Path "HKCU:\Software\MonApplication"
Remove-ItemProperty -Path "HKCU:\Software\MonApplication" -Name "Version"
Remove-Item -Path "HKCU:\Software\MonApplication" -Recurse
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une modification incorrecte du registre peut rendre Windows instable</span>
Contrairement à un fichier de configuration applicatif isolé, le registre est utilisé par **l'ensemble** du système d'exploitation. Toujours exporter une clé (`reg export`) avant modification, et ne jamais modifier une clé dont on ne comprend pas précisément le rôle.
</div>

```
C:\>reg export "HKLM\SOFTWARE\MaClé" sauvegarde.reg
```

## 19.2 Pare-feu Windows

```powershell
Get-NetFirewallRule | Where-Object { $_.Enabled -eq "True" -and $_.Direction -eq "Inbound" }

New-NetFirewallRule -DisplayName "Autoriser API sur port 3000" -Direction Inbound `
    -LocalPort 3000 -Protocol TCP -Action Allow

Disable-NetFirewallRule -DisplayName "Autoriser API sur port 3000"
Remove-NetFirewallRule -DisplayName "Autoriser API sur port 3000"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Direction Inbound vs Outbound</span>
`Inbound` : trafic **entrant** vers cette machine (une règle typique pour autoriser un serveur web local à recevoir des requêtes). `Outbound` : trafic **sortant** depuis cette machine — généralement plus permissif par défaut, restreint surtout dans des environnements à sécurité renforcée.
</div>

## 19.3 Windows Defender

```powershell
Get-MpComputerStatus
Get-MpThreatDetection

Start-MpScan -ScanType QuickScan
Start-MpScan -ScanType FullScan

Update-MpSignature    # met à jour les définitions de virus manuellement

Add-MpPreference -ExclusionPath "C:\Projets\node_modules"    # exclut un dossier de l'analyse (accélère le développement)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les exclusions Defender réduisent la protection : à utiliser avec parcimonie</span>
Exclure `node_modules` (fréquent chez les développeurs, pour accélérer les analyses lors de `npm install`) crée un angle mort de sécurité sur ce dossier précis — acceptable pour un dossier de dépendances de confiance connues, jamais pour un dossier de téléchargements généraux.
</div>

## 19.4 Gestion des disques via PowerShell (au-delà de diskpart, chapitre 5)

```powershell
Get-Disk
Get-Partition
Get-Volume

Get-Volume | Where-Object { $_.SizeRemaining / $_.Size -lt 0.1 }   # volumes remplis à plus de 90%

Initialize-Disk -Number 1 -PartitionStyle GPT
New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter
Format-Volume -DriveLetter E -FileSystem NTFS -NewFileSystemLabel "Données"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Les cmdlets modernes (Get-Disk, New-Partition) remplacent progressivement diskpart</span>
Ces cmdlets offrent la même puissance que `diskpart` (chapitre 5), mais avec la richesse du pipeline objet (filtrage, tri, export direct) — `diskpart` reste utile en mode interactif rapide, ces cmdlets sont préférables pour un script automatisé.
</div>

## 19.5 Partages réseau (SMB)

```powershell
Get-SmbShare

New-SmbShare -Name "Documents" -Path "C:\PartageDocuments" -FullAccess "Administrateurs" -ReadAccess "Utilisateurs"

Get-SmbShareAccess -Name "Documents"
Grant-SmbShareAccess -Name "Documents" -AccountName "Marie" -AccessRight Change

Remove-SmbShare -Name "Documents" -Force
```

```powershell
# Se connecter à un partage distant
New-SmbMapping -LocalPath "Z:" -RemotePath "\\serveur\Documents"
```

## 19.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Modifier le registre sans sauvegarde préalable</span>
Rappel de la section 19.1 : `reg export` avant toute modification manuelle n'est pas une précaution excessive, c'est une pratique professionnelle standard — un registre corrompu peut rendre Windows totalement inutilisable, nécessitant une réinstallation.
</div>

## 19.7 Bonnes pratiques

- Toujours exporter une clé de registre avant modification.
- Limiter les exclusions Windows Defender au strict nécessaire, documentées et revues périodiquement.
- Nommer les règles de pare-feu de façon explicite (`-DisplayName`), pour faciliter leur audit ultérieur.

## 19.8 Résumé du chapitre

- Le registre Windows est accessible comme un lecteur PowerShell (`HKLM:`, `HKCU:`), avec les mêmes cmdlets que pour les fichiers.
- `Get-NetFirewallRule`/`New-NetFirewallRule` gèrent le pare-feu ; `Get-MpComputerStatus`/`Start-MpScan` gèrent Windows Defender.
- Les cmdlets modernes de disque (`Get-Disk`, `New-Partition`, `Format-Volume`) complètent `diskpart` avec la richesse du pipeline objet.
- `New-SmbShare`/`Grant-SmbShareAccess` créent et sécurisent des partages réseau.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Crée une règle de pare-feu autorisant le trafic entrant sur le port 8080 (TCP), puis vérifie qu'elle apparaît bien dans la liste des règles actives.
</div>

**Corrigé :**
```powershell
New-NetFirewallRule -DisplayName "App locale port 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
Get-NetFirewallRule -DisplayName "App locale port 8080"
```

*Chapitre suivant : WMI et CIM, pour interroger en profondeur le matériel et le système.*
