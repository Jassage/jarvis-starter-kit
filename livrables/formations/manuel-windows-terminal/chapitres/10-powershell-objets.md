<div class="chapitre-titre-num">CHAPITRE 10</div>

# Les objets PowerShell

## Objectifs pédagogiques

Comprendre en profondeur ce qu'est un objet PowerShell (propriétés, méthodes), explorer un objet avec `Get-Member`, et mesurer concrètement l'avantage du pipeline orienté objet face au texte brut de CMD/Bash.

## Prérequis

Chapitres 8-9.

## 10.1 Rappel : texte (CMD/Bash) vs objets (PowerShell)

<div class="encadre astuce">
<span class="encadre-titre">💡 Le concept le plus important de tout ce manuel</span>
Dans CMD ou Bash, une commande produit du **texte** : pour en extraire une information précise (par exemple, juste le nom d'un processus), il faut analyser ce texte avec des outils comme `findstr`/`grep`, en espérant que le format ne change jamais. Dans PowerShell, une commande produit des **objets** — des structures de données réelles, avec des propriétés nommées et typées, directement accessibles sans aucune analyse de texte.
</div>

```{.uml}
CMD / Bash (texte)                    PowerShell (objets)
─────────────────────                 ─────────────────────
tasklist                               Get-Process
      │                                       │
      ▼                                       ▼
"chrome.exe  1234  ..."                 Objet System.Diagnostics.Process
(une CHAÎNE DE CARACTÈRES)                    {
      │                                          Name = "chrome"
      ▼                                          Id = 1234
findstr "chrome"                                 CPU = 45.2
(recherche TEXTUELLE fragile,                    WorkingSet = 524288000
casse si le format change)                     }
                                                      │
                                                      ▼
                                         $_.Name  ← accès DIRECT à la propriété,
                                                      jamais d'analyse de texte
```

## 10.2 Get-Member : explorer un objet en détail

```powershell
PS> Get-Process | Get-Member

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

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-Member révèle TOUT ce qu'un objet peut faire (méthodes) et contenir (propriétés)</span>
Face à un objet inconnu (par exemple, le résultat d'une cmdlet jamais utilisée), `| Get-Member` liste immédiatement toutes ses **propriétés** (données consultables) et **méthodes** (actions exécutables) — la meilleure façon de découvrir ce qu'on peut réellement faire avec un résultat, sans deviner ni chercher dans une documentation externe.
</div>

## 10.3 Propriétés : lire les données d'un objet

```powershell
PS> $processus = Get-Process -Name notepad
PS> $processus.Name
notepad
PS> $processus.Id
15234
PS> $processus.CPU
2.34
```

## 10.4 Méthodes : demander à un objet d'agir

```powershell
PS> $processus = Get-Process -Name notepad
PS> $processus.Kill()          # appelle la méthode Kill() : termine le processus
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une propriété se LIT, une méthode s'EXÉCUTE (avec des parenthèses)</span>
Syntaxiquement, une propriété s'utilise sans parenthèses (`$processus.Name`), une méthode **avec** des parenthèses, même vides (`$processus.Kill()`) — cette distinction se retrouve partout en PowerShell, y compris avec les objets .NET manipulés directement (chapitre 27).
</div>

## 10.5 Select-Object : choisir précisément les propriétés à afficher/garder

```powershell
PS> Get-Process | Select-Object Name, Id, CPU
PS> Get-Process | Select-Object -First 5
PS> Get-Process | Select-Object -Property Name, CPU -First 3

# Créer une propriété CALCULÉE
PS> Get-Process | Select-Object Name, @{Name="MemoireMo"; Expression={ $_.WorkingSet64 / 1MB }}
```

## 10.6 Where-Object : filtrer sur de vraies propriétés typées

```powershell
PS> Get-ChildItem | Where-Object { $_.Length -gt 1MB }
PS> Get-ChildItem | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
PS> Get-Process | Where-Object Name -eq "chrome"     # syntaxe simplifiée, sans bloc de script
```

<div class="encadre astuce">
<span class="encadre-titre">💡 $_ représente l'objet courant dans le pipeline</span>
À l'intérieur d'un bloc `{ ... }` passé à `Where-Object` (ou `ForEach-Object`, ou `ForEach` dans une boucle, chapitre 13), `$_` désigne **l'objet actuellement traité** — l'équivalent conceptuel d'une variable de boucle implicite.
</div>

## 10.7 Sort-Object et Group-Object

```powershell
PS> Get-Process | Sort-Object CPU -Descending
PS> Get-ChildItem -Recurse | Group-Object Extension | Sort-Object Count -Descending
```

`Group-Object Extension` regroupe automatiquement les fichiers par extension, produisant un décompte par groupe — impossible à faire aussi simplement avec du texte brut sans écrire une logique de comptage manuelle.

## 10.8 Comparaison directe avec le texte sous Linux/Bash

```bash
# Bash : extraire le nom du processus consommant le plus de CPU (fragile, dépend du format d'affichage)
ps aux | sort -k3 -rn | head -1 | awk '{print $11}'
```

```powershell
# PowerShell : direct, lisible, sans dépendre d'un format de colonnes
(Get-Process | Sort-Object CPU -Descending | Select-Object -First 1).Name
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le prix à payer : la portabilité du texte brut</span>
Le pipeline textuel de Bash a un avantage réel que PowerShell n'a pas nativement : n'importe quel programme, même écrit dans un langage totalement différent, peut produire du texte compatible avec `grep`/`awk`/`sed`. Le pipeline objet de PowerShell exige que les deux extrémités "parlent" le même système d'objets .NET — un compromis conscient, pas un défaut de conception.
</div>

## 10.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser Format-Table trop tôt dans un pipeline</span>
```powershell
Get-Process | Format-Table | Where-Object { $_.CPU -gt 100 }   # ❌ ne fonctionne PAS comme attendu !
```
`Format-Table` (et les autres cmdlets `Format-*`) convertit les objets en **texte formaté pour l'affichage** — une fois passé par `Format-Table`, l'objet perd ses vraies propriétés exploitables. Les cmdlets `Format-*` doivent **toujours** être la toute dernière étape d'un pipeline, jamais suivies d'un filtrage ou tri supplémentaire.
</div>

## 10.10 Bonnes pratiques

- Utiliser `Get-Member` systématiquement face à un type d'objet inconnu, avant de chercher ailleurs.
- Filtrer (`Where-Object`) et trier (`Sort-Object`) **avant** toute mise en forme (`Format-Table`, `Out-File`).
- Préférer `Select-Object` pour ne garder que les propriétés réellement utiles, plutôt que de manipuler des objets complets inutilement volumineux.

## 10.11 Résumé du chapitre

- PowerShell manipule des **objets** (propriétés + méthodes), contrairement au texte brut de CMD/Bash.
- `Get-Member` révèle toutes les propriétés et méthodes d'un objet, la meilleure façon de l'explorer.
- `Select-Object`, `Where-Object`, `Sort-Object`, `Group-Object` exploitent directement ces propriétés typées.
- Les cmdlets `Format-*` doivent toujours être la dernière étape d'un pipeline.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Explore les méthodes disponibles sur un objet fichier (`Get-Item` sur un fichier existant), et utilise l'une d'elles pour copier ce fichier.
</div>

**Corrigé :**
```powershell
$fichier = Get-Item C:\Projets\rapport.docx
$fichier | Get-Member -MemberType Method
$fichier.CopyTo("D:\Sauvegarde\rapport.docx")
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.2 (défi pratique)</span>

Regroupe tous les fichiers du dossier `C:\Windows\System32` par extension, et affiche les 5 extensions les plus fréquentes avec leur nombre.
</div>

**Corrigé :**
```powershell
Get-ChildItem C:\Windows\System32 -File |
    Group-Object Extension |
    Sort-Object Count -Descending |
    Select-Object -First 5
```

*Chapitre suivant : les variables, types et collections en PowerShell.*
