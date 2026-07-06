<div class="chapitre-titre-num">CHAPITRE 14</div>

# Fonctions, modules et scripts

## Objectifs pédagogiques

Écrire des fonctions PowerShell avec paramètres typés et validés, retourner des valeurs proprement, organiser du code réutilisable en modules, et exécuter des scripts `.ps1`.

## Prérequis

Chapitres 11-13.

## 14.1 Déclarer une fonction simple

```powershell
function Saluer {
    param(
        [string]$Nom
    )
    Write-Output "Bonjour $Nom !"
}

Saluer -Nom "Jaslin"
Saluer "Jaslin"    # le nom du paramètre est optionnel si l'ordre est respecté
```

## 14.2 Paramètres avancés : valeurs par défaut, obligatoires, validation

```powershell
function New-Utilisateur {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Nom,

        [Parameter(Mandatory=$true)]
        [ValidatePattern("^[^@]+@[^@]+\.[^@]+$")]
        [string]$Email,

        [ValidateRange(18, 120)]
        [int]$Age = 18,

        [ValidateSet("Utilisateur", "Admin", "Moderateur")]
        [string]$Role = "Utilisateur"
    )

    [PSCustomObject]@{
        Nom   = $Nom
        Email = $Email
        Age   = $Age
        Role  = $Role
    }
}

New-Utilisateur -Nom "Jaslin" -Email "jaslin@mail.com" -Age 24 -Role "Admin"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La validation intégrée évite d'écrire des if manuels</span>
`[Parameter(Mandatory=$true)]` rend un paramètre obligatoire (PowerShell le redemandera interactivement s'il manque) ; `[ValidateRange]`, `[ValidatePattern]`, `[ValidateSet]` rejettent automatiquement une valeur invalide **avant même** que le corps de la fonction ne s'exécute — remplaçant avantageusement les validations manuelles écrites à la main (comme Zod le fait pour Node.js, ou Bean Validation pour Java, mentionnés dans d'autres manuels de ce même auteur).
</div>

## 14.3 Valeur de retour

```powershell
function Get-Carre {
    param([int]$Nombre)
    return $Nombre * $Nombre
}

$resultat = Get-Carre -Nombre 5
Write-Output $resultat   # 25
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ TOUT ce qui n'est pas capturé/redirigé dans une fonction fait partie de la valeur de retour</span>
```powershell
function Get-CarreBogue {
    param([int]$Nombre)
    Write-Output "Calcul en cours..."   # ⚠️ ceci fait AUSSI partie du retour de la fonction !
    return $Nombre * $Nombre
}

$resultat = Get-CarreBogue -Nombre 5
$resultat.Count   # 2 ! $resultat contient EN RÉALITÉ un tableau : ("Calcul en cours...", 25)
```
Contrairement à la plupart des langages où seul `return` compte, PowerShell considère que **toute sortie non capturée** dans le corps de la fonction (y compris un `Write-Output` "de débogage" oublié) fait partie du résultat retourné — une source de bugs subtils très fréquente. Utiliser `Write-Verbose`/`Write-Debug` (chapitre 27) pour un affichage de progression qui ne pollue pas la valeur de retour.
</div>

## 14.4 Fonctions avancées : CmdletBinding

```powershell
function Backup-Dossier {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Source,

        [Parameter(Mandatory=$true)]
        [string]$Destination
    )

    Write-Verbose "Sauvegarde de $Source vers $Destination"
    Copy-Item -Path $Source -Destination $Destination -Recurse -Force
}

Backup-Dossier -Source "C:\Projets" -Destination "D:\Sauvegarde" -Verbose
```

`[CmdletBinding()]` transforme une fonction simple en **fonction avancée**, lui donnant accès à des paramètres communs standard (`-Verbose`, `-Debug`, `-ErrorAction`) exactement comme une vraie cmdlet native.

## 14.5 Scripts .ps1

```powershell
# sauvegarde.ps1
param(
    [string]$Source = "C:\Projets",
    [string]$Destination = "D:\Sauvegarde"
)

Write-Output "Début de la sauvegarde..."
Copy-Item -Path $Source -Destination $Destination -Recurse -Force
Write-Output "Sauvegarde terminée."
```

```powershell
PS> .\sauvegarde.ps1
PS> .\sauvegarde.ps1 -Source "D:\Autre" -Destination "E:\Backup"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ .\ obligatoire pour exécuter un script du dossier courant</span>
```powershell
sauvegarde.ps1        # ❌ "n'est pas reconnu comme nom d'applet de commande..."
.\sauvegarde.ps1       # ✅ le préfixe .\ est OBLIGATOIRE pour un script du dossier courant
```
Contrairement à CMD (qui exécute directement un `.bat` du dossier courant), PowerShell exige un chemin explicite (même relatif, `.\`) pour exécuter un script — une mesure de sécurité empêchant qu'un fichier malveillant nommé comme une commande système courante ne s'exécute par erreur.
</div>

## 14.6 Modules : regrouper des fonctions réutilisables

```powershell
# MonModule.psm1
function Get-InfoSysteme {
    [PSCustomObject]@{
        OS        = (Get-CimInstance Win32_OperatingSystem).Caption
        Processeur = (Get-CimInstance Win32_Processor).Name
    }
}

Export-ModuleMember -Function Get-InfoSysteme
```

```powershell
PS> Import-Module .\MonModule.psm1
PS> Get-InfoSysteme
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Export-ModuleMember contrôle ce qui devient PUBLIC</span>
Sans `Export-ModuleMember`, toutes les fonctions d'un module sont exportées par défaut. En listant explicitement les fonctions à exporter, on peut garder des fonctions "privées" (utilitaires internes au module) totalement invisibles depuis l'extérieur — un principe d'encapsulation similaire à l'`private` vu dans d'autres langages (Java, TypeScript).
</div>

## 14.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Nommer une fonction sans respecter la convention Verbe-Nom</span>
```powershell
function FaireQuelqueChose { ... }   # ⚠️ fonctionne, mais génère un avertissement et casse la convention PowerShell
function Invoke-QuelqueChose { ... } # ✅ respecte la convention (rappel du chapitre 8)
```
</div>

## 14.8 Bonnes pratiques

- Toujours utiliser `[CmdletBinding()]` sur une fonction destinée à être réutilisée par d'autres.
- Valider les paramètres via les attributs `[Validate*]` plutôt que des `if` manuels en début de fonction.
- Regrouper les fonctions liées dans un module `.psm1`, avec `Export-ModuleMember` explicite.

## 14.9 Résumé du chapitre

- Les fonctions PowerShell utilisent `param()` avec des attributs de validation puissants (`Mandatory`, `ValidateRange`, `ValidateSet`, `ValidatePattern`).
- Toute sortie non capturée dans une fonction fait partie de sa valeur de retour — piège fréquent avec un `Write-Output` de débogage oublié.
- `[CmdletBinding()]` transforme une fonction en fonction avancée, avec accès à `-Verbose`/`-Debug`.
- Un script `.ps1` s'exécute avec `.\` explicite ; un module `.psm1` regroupe des fonctions réutilisables via `Import-Module`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Écris une fonction `Test-EmailValide` qui prend un email en paramètre obligatoire et retourne `$true`/`$false` selon un motif simple de validation.
</div>

**Corrigé :**
```powershell
function Test-EmailValide {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Email
    )
    return $Email -match "^[^@\s]+@[^@\s]+\.[^@\s]+$"
}

Test-EmailValide -Email "jaslin@mail.com"   # True
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.2 (mini-projet)</span>

Crée un module `Outils.psm1` avec une fonction `Get-EspaceDisque` retournant l'espace libre (en Go) de chaque lecteur, puis importe-le et utilise-le.
</div>

**Corrigé :**
```powershell
# Outils.psm1
function Get-EspaceDisque {
    Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{Name="LibreGo";Expression={[math]::Round($_.Free/1GB,2)}}
}
Export-ModuleMember -Function Get-EspaceDisque
```
```powershell
Import-Module .\Outils.psm1
Get-EspaceDisque
```

*Chapitre suivant : la gestion des processus, services et tâches planifiées.*
