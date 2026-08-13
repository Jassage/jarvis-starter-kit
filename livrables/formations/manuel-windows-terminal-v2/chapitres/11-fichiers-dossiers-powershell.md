<div class="chapitre-titre-num">CHAPITRE 11</div>

# Fichiers et dossiers en PowerShell

## 🎯 Objectifs

Créer, copier, déplacer, renommer, supprimer des fichiers et dossiers avec PowerShell, et lire/écrire le contenu de fichiers texte (`Get-Content`, `Set-Content`, `Add-Content`).

## Prérequis

Chapitres 9-10.

## 🧠 Comprendre : les mêmes tâches qu'en CMD, en mieux outillées

**Le problème.** Tu sais déjà faire tout ceci en CMD (chapitre 6). Pourquoi réapprendre les mêmes actions en PowerShell ?

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
En CMD, déplacer un carton revient à le porter à la main, sans savoir ce qu'il contient avant de l'ouvrir. En PowerShell, chaque "carton" (fichier ou dossier) est déjà étiqueté avec toutes ses propriétés (taille, date, extension) — tu peux **filtrer** avant même de le manipuler ("seulement les cartons de plus de 10 Mo créés ce mois-ci"), ce que CMD ne permet pas nativement.
</div>

## 💻 Démonstration : New-Item

```powershell
New-Item -Path C:\Projets\NouveauDossier -ItemType Directory
New-Item -Path C:\Projets\notes.txt -ItemType File
```

## 🔍 Décortiquons

`-Path` indique où créer l'élément, `-ItemType` précise **quoi** créer (`Directory` ou `File`) — une seule cmdlet, `New-Item`, remplace à la fois `mkdir` **et** la création de fichier vide de CMD (qui n'existait pas directement sans détour par `type nul >`).

## 11.1 Copy-Item, Move-Item, Rename-Item, Remove-Item

```powershell
Copy-Item -Path C:\Projets\rapport.docx -Destination D:\Sauvegarde\
Copy-Item -Path C:\Projets -Destination D:\Sauvegarde\Projets -Recurse

Move-Item -Path C:\Projets\ancien.docx -Destination D:\Archives\

Rename-Item -Path C:\Projets\rapport.docx -NewName rapport-2026.docx

Remove-Item -Path C:\Projets\temp.txt
Remove-Item -Path C:\Projets\DossierVide -Recurse -Force
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ -Force ne signifie pas "sois plus agressif", mais "ignore certaines protections"</span>
`-Force` sur `Remove-Item` permet de supprimer des fichiers cachés/lecture-seule sans erreur, mais ne contourne **pas** une protection de sécurité réelle (permissions NTFS insuffisantes, chapitre 22) — un piège fréquent est de croire que `-Force` résout tout problème de suppression, alors qu'il ne couvre qu'un sous-ensemble précis d'obstacles.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Remove-Item sur un dossier non vide sans -Recurse</span>
```powershell
Remove-Item C:\Projets\Ancien             ← ❌ erreur si le dossier contient des fichiers
Remove-Item C:\Projets\Ancien -Recurse    ← ✅ supprime le dossier ET son contenu
```
</div>

## 11.2 Get-Content, Set-Content, Add-Content : lire et écrire du texte

```powershell
Get-Content -Path C:\Projets\notes.txt

Set-Content -Path C:\Projets\notes.txt -Value "Nouveau contenu"     ← ECRASE tout le fichier
Add-Content -Path C:\Projets\notes.txt -Value "Ligne ajoutee"        ← AJOUTE a la fin, sans effacer
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : Set- vs Add-</span>
La distinction `Set-Content` (remplace tout) vs `Add-Content` (ajoute à la fin) reprend exactement la logique déjà vue entre `>` (écrase) et `>>` (ajoute) en CMD, chapitre 6. Ce n'est pas un hasard : cette même paire de comportements revient dans presque tout outil de manipulation de fichiers, quel que soit le shell.
</div>

```powershell
Get-Content -Path C:\Projets\notes.txt -TotalCount 5   ← les 5 PREMIERES lignes seulement
Get-Content -Path C:\Projets\notes.txt -Tail 5          ← les 5 DERNIERES lignes seulement
Get-Content -Path C:\Projets\notes.txt -Wait             ← reste actif, affiche les nouvelles lignes ajoutees en direct
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-Content -Wait : suivre un fichier journal en direct</span>
`-Wait` transforme `Get-Content` en outil de suivi permanent, comme `tail -f` sous Linux : très utile pour observer en direct un fichier de log alimenté par une application en cours d'exécution, sans avoir à relancer la commande à répétition.
</div>

## 11.3 Test-Path : vérifier avant d'agir

```powershell
if (Test-Path -Path C:\Projets) {
    Write-Host "Le dossier existe"
} else {
    Write-Host "Le dossier n'existe pas"
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours vérifier avant une opération destructive</span>
`Test-Path` renvoie simplement `$true` ou `$false` (les booléens, approfondis au chapitre 13). Un réflexe professionnel : vérifier qu'un chemin existe avant `Remove-Item`, ou qu'il n'existe **pas déjà** avant `New-Item`, plutôt que de laisser l'erreur se produire puis la gérer après coup.
</div>

## Tableau récapitulatif

| CMD | PowerShell |
|---|---|
| `mkdir`/`md` | `New-Item -ItemType Directory` |
| `copy` | `Copy-Item` |
| `move` | `Move-Item` |
| `ren` | `Rename-Item` |
| `del` | `Remove-Item` |
| `type` | `Get-Content` |
| `type f1 f2 > f3` | `Set-Content` / `Add-Content` |

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.1</span>

Crée un fichier `journal.txt`, écris-y "Début du journal", puis ajoute une seconde ligne "Première entrée" sans effacer la première.
</div>

**✅ Correction.**
```powershell
New-Item -Path journal.txt -ItemType File
Set-Content -Path journal.txt -Value "Début du journal"
Add-Content -Path journal.txt -Value "Première entrée"
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.2</span>

Avant de supprimer un dossier `C:\Temp\ASupprimer`, vérifie d'abord qu'il existe réellement ; si oui, supprime-le entièrement (contenu compris) sans confirmation.
</div>

**✅ Correction.**
```powershell
if (Test-Path -Path C:\Temp\ASupprimer) {
    Remove-Item -Path C:\Temp\ASupprimer -Recurse -Force
    Write-Host "Dossier supprimé."
} else {
    Write-Host "Le dossier n'existe pas, rien à faire."
}
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 11.3</span>

Affiche uniquement les 10 dernières lignes d'un fichier de log `C:\Logs\application.log`, puis reste en attente pour voir les nouvelles lignes s'ajouter en direct, sans relancer la commande.
</div>

**✅ Correction du défi.**
```powershell
Get-Content -Path C:\Logs\application.log -Tail 10 -Wait
```
`-Tail 10` limite l'affichage initial, `-Wait` bascule ensuite en mode suivi continu — une combinaison particulièrement utile pour diagnostiquer une application en cours d'exécution (approfondi au chapitre 29, méthode de dépannage).

## 🎯 Ce que tu sais maintenant

- `New-Item`, `Copy-Item`, `Move-Item`, `Rename-Item`, `Remove-Item` couvrent toute la gestion de fichiers/dossiers en PowerShell.
- `Get-Content`/`Set-Content`/`Add-Content` lisent et écrivent du texte, avec `-Tail`/`-Wait` pour le suivi en direct.
- `Test-Path` vérifie l'existence d'un chemin avant toute opération, un réflexe professionnel essentiel.

*Chapitre suivant : plonger dans les objets PowerShell — propriétés, méthodes et pipeline, en profondeur.*
