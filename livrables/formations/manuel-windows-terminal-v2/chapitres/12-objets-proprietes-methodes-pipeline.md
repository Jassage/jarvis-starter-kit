<div class="chapitre-titre-num">CHAPITRE 12</div>

# Objets, propriétés, méthodes et pipeline

## 🎯 Objectifs

Comprendre en profondeur ce qu'est un objet PowerShell, distinguer propriétés et méthodes, et exploiter pleinement le pipeline avec `Select-Object`, `Where-Object`, `Sort-Object` et `Group-Object`.

## Prérequis

Chapitres 9-11.

## 🧠 Comprendre : qu'est-ce qu'un objet, vraiment ?

**Le problème.** Le chapitre 9 a annoncé que PowerShell manipule des "objets" plutôt que du texte. Il faut maintenant comprendre précisément ce que contient un objet, et comment l'exploiter.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **objet** est une fiche de renseignements complète sur une chose précise : une fiche "processus" contient son nom, son numéro (PID, chapitre 1), sa consommation CPU — ce sont ses **propriétés**, les cases remplies de la fiche. La fiche peut aussi avoir des boutons d'action collés dessus, comme "Arrêter ce processus" — ce sont ses **méthodes**, des actions que tu peux déclencher directement depuis la fiche.
</div>

## 💻 Démonstration : Get-Member

```powershell
Get-Process | Get-Member

   TypeName: System.Diagnostics.Process

Name                       MemberType     Definition
----                       ----------     ----------
Kill                       Method         void Kill()
Refresh                    Method         void Refresh()
CPU                        Property       double CPU {get;}
Id                         Property       int Id {get;}
Name                       Property       string Name {get;}
WorkingSet64               Property       long WorkingSet64 {get;}
```

## 🔍 Décortiquons

La colonne `MemberType` distingue précisément `Property` (une donnée à lire) de `Method` (une action à exécuter). `TypeName` en haut indique le type exact de l'objet (`System.Diagnostics.Process`) — une information .NET précise, pas juste une étiquette informelle.

## 12.1 Lire une propriété

```powershell
$processus = Get-Process -Name notepad
$processus.Name
notepad
$processus.Id
15234
$processus.CPU
2.34
```

## 12.2 Appeler une méthode

```powershell
$processus = Get-Process -Name notepad
$processus.Kill()          ← appelle la methode Kill() : termine le processus
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une propriété se lit, une méthode s'exécute (avec des parenthèses)</span>
Syntaxiquement, une propriété s'utilise sans parenthèses (`$processus.Name`), une méthode **avec** des parenthèses, même vides (`$processus.Kill()`) — cette distinction se retrouve partout en PowerShell, y compris avec les objets .NET manipulés directement (chapitre 27).
</div>

## 12.3 Select-Object : choisir précisément les propriétés

```powershell
Get-Process | Select-Object Name, Id, CPU
Get-Process | Select-Object -First 5
Get-Process | Select-Object -Property Name, CPU -First 3

# Créer une propriété CALCULÉE
Get-Process | Select-Object Name, @{Name="MemoireMo"; Expression={ $_.WorkingSet64 / 1MB }}
```

## 12.4 Where-Object : filtrer sur de vraies propriétés typées

```powershell
Get-ChildItem | Where-Object { $_.Length -gt 1MB }
Get-ChildItem | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
Get-Process | Where-Object Name -eq "chrome"     ← syntaxe simplifiee, sans bloc de script
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : $_</span>
À l'intérieur d'un bloc `{ ... }` passé à `Where-Object` (ou `ForEach-Object`, chapitre 15), `$_` désigne **l'objet actuellement traité** dans le pipeline — l'équivalent conceptuel d'une variable de boucle implicite.
</div>

## 12.5 Sort-Object et Group-Object

```powershell
Get-Process | Sort-Object CPU -Descending
Get-ChildItem -Recurse | Group-Object Extension | Sort-Object Count -Descending
```

`Group-Object Extension` regroupe automatiquement les fichiers par extension, produisant un décompte par groupe — impossible à faire aussi simplement avec du texte brut sans écrire une logique de comptage manuelle.

## 12.6 Comparaison directe avec le texte sous Bash

```bash
# Bash : extraire le nom du processus consommant le plus de CPU (fragile, depend du format d'affichage)
ps aux | sort -k3 -rn | head -1 | awk '{print $11}'
```

```powershell
# PowerShell : direct, lisible, sans dependre d'un format de colonnes
(Get-Process | Sort-Object CPU -Descending | Select-Object -First 1).Name
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le prix à payer : la portabilité du texte brut</span>
Le pipeline textuel de Bash a un avantage réel que PowerShell n'a pas nativement : n'importe quel programme, même écrit dans un langage totalement différent, peut produire du texte compatible avec `grep`/`awk`/`sed`. Le pipeline objet de PowerShell exige que les deux extrémités "parlent" le même système d'objets .NET — un compromis conscient, pas un défaut de conception.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser Format-Table trop tôt dans un pipeline</span>
```powershell
Get-Process | Format-Table | Where-Object { $_.CPU -gt 100 }   ← ❌ ne fonctionne PAS comme attendu !
```
`Format-Table` (et les autres cmdlets `Format-*`) convertit les objets en **texte formaté pour l'affichage** — une fois passé par `Format-Table`, l'objet perd ses vraies propriétés exploitables. Les cmdlets `Format-*` doivent **toujours** être la toute dernière étape d'un pipeline, jamais suivies d'un filtrage ou tri supplémentaire.
</div>

## Bonnes pratiques

- Utiliser `Get-Member` systématiquement face à un type d'objet inconnu, avant de chercher ailleurs.
- Filtrer (`Where-Object`) et trier (`Sort-Object`) **avant** toute mise en forme (`Format-Table`, `Out-File`).
- Préférer `Select-Object` pour ne garder que les propriétés réellement utiles.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Explore les méthodes disponibles sur un objet fichier (`Get-Item` sur un fichier existant), et utilise l'une d'elles pour copier ce fichier.
</div>

**✅ Correction.**
```powershell
$fichier = Get-Item C:\Projets\rapport.docx
$fichier | Get-Member -MemberType Method
$fichier.CopyTo("D:\Sauvegarde\rapport.docx")
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.2</span>

Regroupe tous les fichiers du dossier `C:\Windows\System32` par extension, et affiche les 5 extensions les plus fréquentes avec leur nombre.
</div>

**✅ Correction.**
```powershell
Get-ChildItem C:\Windows\System32 -File |
    Group-Object Extension |
    Sort-Object Count -Descending |
    Select-Object -First 5
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 12.3</span>

Explique pourquoi `Get-Process | Format-Table -AutoSize | Sort-Object CPU` échouerait à trier correctement, et corrige l'ordre des cmdlets.
</div>

**✅ Correction du défi.** Comme vu dans l'encadré "Attention" : `Format-Table` transforme les objets `Process` en simple texte de mise en forme, avant même que `Sort-Object` ne puisse accéder à une vraie propriété `.CPU` numérique à trier — le tri porterait alors sur du texte déjà mis en page, sans effet cohérent. La bonne version place le tri **avant** la mise en forme :
```powershell
Get-Process | Sort-Object CPU -Descending | Format-Table -AutoSize
```

## 🎯 Ce que tu sais maintenant

- Un **objet** contient des **propriétés** (données, lues sans parenthèses) et des **méthodes** (actions, appelées avec parenthèses).
- `Get-Member` révèle tout ce qu'un objet contient et sait faire.
- `Select-Object`, `Where-Object`, `Sort-Object`, `Group-Object` exploitent directement ces propriétés typées, dans le pipeline.
- Les cmdlets `Format-*` doivent toujours être la dernière étape d'un pipeline — jamais suivies d'un tri ou d'un filtre.

*Chapitre suivant : les variables, types et collections en PowerShell.*
