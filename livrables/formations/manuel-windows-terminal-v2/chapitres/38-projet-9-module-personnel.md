<div class="chapitre-titre-num">CHAPITRE 38</div>

# Projet 9 — Module PowerShell personnel

## 🎯 Objectifs

Regrouper les meilleurs outils construits dans ce manuel (chapitres 17 à 37) en un seul module PowerShell professionnel, avec manifeste, publié sur ton profil pour un chargement automatique.

## Prérequis

Chapitre 24, et l'ensemble de la Partie 22.

## 1. Cahier des charges

Un module `AdminToolkit` qui :
- regroupe au moins une fonction par grand domaine du manuel (processus, services, réseau, sauvegarde) ;
- documente chaque fonction (`.SYNOPSIS`/`.EXAMPLE`, rappel du chapitre 30) ;
- se charge automatiquement à l'ouverture de toute session PowerShell, via `$PROFILE`.

## 2. Analyse

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce projet est une consolidation, pas une nouvelle construction</span>
Contrairement aux projets précédents, celui-ci n'introduit presque aucune notion nouvelle : il s'agit d'organiser et documenter proprement ce qui a déjà été écrit au fil du manuel — une compétence tout aussi importante que d'écrire du nouveau code.
</div>

## 3. Conception : arborescence du module

```{.uml}
C:\Modules\AdminToolkit\
  |
  +-- AdminToolkit.psd1      (manifeste)
  +-- AdminToolkit.psm1      (point d'entree, importe les fichiers ci-dessous)
  +-- Public\
  |     Watch-ProcessusGourmands.ps1
  |     Test-ServicesCritiques.ps1
  |     Get-InventaireComplet.ps1
  |     Test-ChaineReseau.ps1
  |     Invoke-SauvegardeComplete.ps1
  +-- Private\
        Write-JournalAudit.ps1        (fonction interne, non exportee)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Public vs Private : une convention professionnelle courante</span>
Séparer les fonctions destinées aux utilisateurs du module (`Public\`) des fonctions utilitaires internes (`Private\`, jamais exportées via `Export-ModuleMember`) rend un module de plusieurs dizaines de fonctions bien plus facile à maintenir qu'un unique fichier `.psm1` monolithique — l'organisation en un seul fichier, vue au chapitre 24, restait adaptée à un module de quelques fonctions seulement.
</div>

## 4. Architecture : le fichier .psm1 comme chargeur

```powershell
# AdminToolkit.psm1
$dossierPublic = Join-Path $PSScriptRoot "Public"
$dossierPrivate = Join-Path $PSScriptRoot "Private"

Get-ChildItem -Path $dossierPublic, $dossierPrivate -Filter "*.ps1" -ErrorAction SilentlyContinue |
    ForEach-Object { . $_.FullName }

$fonctionsPubliques = (Get-ChildItem -Path $dossierPublic -Filter "*.ps1").BaseName
Export-ModuleMember -Function $fonctionsPubliques
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : dot-sourcing</span>
`. $_.FullName` (un point, un espace, puis le chemin) est appelé **dot-sourcing** : il exécute le contenu d'un script **dans la portée actuelle**, rendant ses fonctions disponibles, plutôt que dans une portée isolée comme le ferait un simple appel `& $_.FullName`. C'est ce mécanisme qui permet à `AdminToolkit.psm1` de "charger" chaque fichier de fonction séparé.
</div>

## 5. Développement étape par étape

**Étape 1 — extraire chaque fonction déjà écrite dans son propre fichier**, sous `Public\`. Par exemple, `Public\Test-ChaineReseau.ps1` contient uniquement la fonction du chapitre 33, avec son bloc de documentation `.SYNOPSIS` déjà écrit.

**Étape 2 — créer le manifeste.**
```powershell
New-ModuleManifest -Path "C:\Modules\AdminToolkit\AdminToolkit.psd1" `
    -RootModule "AdminToolkit.psm1" `
    -ModuleVersion "1.0.0" `
    -Author "Jaslin Occius" `
    -Description "Boîte à outils d'administration Windows personnelle (processus, services, réseau, sauvegarde)" `
    -PowerShellVersion "7.0"
```

**Étape 3 — chargement automatique via le profil.**
```powershell
# Dans $PROFILE
Import-Module "C:\Modules\AdminToolkit\AdminToolkit.psd1"
Write-Host "AdminToolkit chargé — $(($fonctionsPubliques).Count) outils disponibles." -ForegroundColor Cyan
```

## 6. Tests

```powershell
Import-Module "C:\Modules\AdminToolkit\AdminToolkit.psd1" -Force
Get-Command -Module AdminToolkit
Get-Help Test-ChaineReseau -Examples
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérification attendue</span>
`Get-Command -Module AdminToolkit` doit lister exactement les fonctions placées sous `Public\`, jamais celles de `Private\` — confirmant que la séparation public/privé fonctionne comme prévu.
</div>

## 7. Gestion des erreurs

```powershell
Get-ChildItem -Path $dossierPublic, $dossierPrivate -Filter "*.ps1" -ErrorAction SilentlyContinue |
    ForEach-Object {
        try {
            . $_.FullName
        } catch {
            Write-Warning "Échec du chargement de $($_.Name) : $($_.Exception.Message)"
        }
    }
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une seule fonction en erreur ne doit pas empêcher le chargement du module entier</span>
Sans ce `try`/`catch` autour du dot-sourcing, une simple faute de syntaxe dans un seul fichier de fonction ferait échouer **tout** `Import-Module` — un problème disproportionné par rapport à la cause réelle, isolable comme partout ailleurs dans ce manuel (chapitre 29).
</div>

## 8. Amélioration

- Ajouter des tests automatisés (module Pester, hors périmètre de ce manuel mais standard de l'écosystème PowerShell).
- Publier le module sur un dépôt Git privé, avec une routine de mise à jour (`git pull` + `Import-Module -Force`).
- Ajouter un fichier `CHANGELOG.md` documentant chaque nouvelle version du module.

## 9. Documentation

Chaque fonction publique conserve son propre bloc `.SYNOPSIS`/`.EXAMPLE` (chapitre 30) — la documentation du module lui-même (dans le manifeste, champ `-Description`) reste volontairement courte, un résumé d'une phrase suffisant puisque le détail vit dans chaque fonction.

## 🎯 Ce que tu sais maintenant

- Organiser un module en `Public`/`Private` avec un fichier par fonction facilite grandement sa maintenance au-delà de quelques fonctions.
- Le **dot-sourcing** (`. chemin`) charge un script dans la portée actuelle, contrairement à un simple appel `&`.
- Un module chargé depuis `$PROFILE` rend tous tes outils personnels disponibles instantanément, dans chaque nouvelle session.

*Chapitre suivant : Projet 10 — l'outil complet d'administration Windows, assemblage final de ce manuel.*
