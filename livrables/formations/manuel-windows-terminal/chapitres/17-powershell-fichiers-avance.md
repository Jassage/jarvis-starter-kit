<div class="chapitre-titre-num">CHAPITRE 17</div>

# Gestion des fichiers avancée

## Objectifs pédagogiques

Compresser/décompresser des archives, rechercher des fichiers par contenu ou par critères avancés, et introduire les expressions régulières appliquées à la recherche de fichiers.

## Prérequis

Chapitres 9-16.

## 17.1 Compression avec Compress-Archive

```powershell
Compress-Archive -Path C:\Projets\* -DestinationPath D:\Archives\Projets.zip
Compress-Archive -Path C:\Projets\rapport.docx, C:\Projets\notes.txt -DestinationPath D:\Archives\Docs.zip
Compress-Archive -Path C:\Projets\* -DestinationPath D:\Archives\Projets.zip -Update    # met à jour une archive existante
```

## 17.2 Décompression avec Expand-Archive

```powershell
Expand-Archive -Path D:\Archives\Projets.zip -DestinationPath C:\Restauration
Expand-Archive -Path D:\Archives\Projets.zip -DestinationPath C:\Restauration -Force    # écrase si déjà présent
```

## 17.3 Recherche de fichiers par nom, taille, date

```powershell
Get-ChildItem -Path C:\ -Filter "*.log" -Recurse -ErrorAction SilentlyContinue

Get-ChildItem -Path C:\Projets -Recurse | Where-Object { $_.Length -gt 50MB }

Get-ChildItem -Path C:\Projets -Recurse | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-7) }
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -ErrorAction SilentlyContinue : ignorer les erreurs d'accès refusé sans interrompre la recherche</span>
Une recherche récursive depuis `C:\` traverse inévitablement des dossiers systèmes protégés — sans ce paramètre, chaque accès refusé afficherait une erreur et pourrait interrompre le script. `SilentlyContinue` poursuit la recherche en ignorant silencieusement ces erreurs ponctuelles (approfondi au chapitre 27).
</div>

## 17.4 Recherche de contenu avec Select-String (équivalent de grep)

```powershell
Select-String -Path "C:\Logs\*.log" -Pattern "ERROR"
Select-String -Path "C:\Projets\*.js" -Pattern "TODO" -Recurse

Get-ChildItem -Path C:\Projets -Filter *.log -Recurse | Select-String -Pattern "Exception"
```

```
Logs\app.log:42:2026-07-06 10:15:23 ERROR Connexion refusée à la base de données
```

`Select-String` affiche le fichier, le numéro de ligne, et la ligne complète correspondant au motif — l'équivalent PowerShell de `grep`/`findstr`, mais retournant de vrais objets `MatchInfo` exploitables (rappel du chapitre 10).

## 17.5 Filtres avec expressions régulières (aperçu, détaillé au chapitre 27/annexe D)

```powershell
Select-String -Path "C:\Logs\*.log" -Pattern "ERROR|WARNING" -AllMatches
Get-ChildItem -Recurse | Where-Object { $_.Name -match "^rapport-\d{4}\.docx$" }
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -like (wildcards simples) vs -match (expressions régulières complètes)</span>
`-like` accepte seulement `*` (n'importe quelle séquence) et `?` (un seul caractère) — simple mais limité. `-match` accepte de véritables expressions régulières (`\d{4}` pour "exactement 4 chiffres", `^`/`$` pour ancrer début/fin) — bien plus puissant pour des motifs précis, développé en détail en annexe D.
</div>

## 17.6 Calculer un hash de fichier (vérifier l'intégrité)

```powershell
Get-FileHash -Path C:\Projets\installeur.exe -Algorithm SHA256

Algorithm       Hash                                                             Path
---------       ----                                                             ----
SHA256          A1B2C3D4E5F6...                                                  C:\Projets\installeur.exe
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Vérifier qu'un fichier téléchargé n'a pas été altéré</span>
Comparer le hash calculé à celui publié officiellement par l'éditeur du logiciel confirme que le fichier n'a été ni corrompu pendant le téléchargement, ni modifié par un tiers malveillant — une pratique de sécurité de base avant d'exécuter un installeur téléchargé depuis une source externe.
</div>

## 17.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier -Recurse sur Select-String pour chercher dans des sous-dossiers</span>
```powershell
Select-String -Path "C:\Projets\*.js" -Pattern "TODO"            # ❌ ne cherche QUE dans C:\Projets\, pas les sous-dossiers
Get-ChildItem C:\Projets -Filter *.js -Recurse | Select-String -Pattern "TODO"   # ✅ cherche partout
```
</div>

## 17.8 Bonnes pratiques

- Toujours `-ErrorAction SilentlyContinue` sur une recherche récursive depuis la racine d'un disque.
- Utiliser `Get-FileHash` pour vérifier l'intégrité de tout exécutable téléchargé avant exécution.
- Préférer `-match` (regex) à `-like` (wildcards) dès qu'un motif de recherche devient légèrement complexe.

## 17.9 Résumé du chapitre

- `Compress-Archive`/`Expand-Archive` gèrent les archives ZIP nativement, sans outil tiers.
- `Select-String` recherche du contenu textuel dans des fichiers, retournant des objets exploitables (fichier, ligne, numéro).
- `-like` (wildcards simples) et `-match` (expressions régulières complètes) couvrent deux niveaux de complexité de filtrage.
- `Get-FileHash` vérifie l'intégrité d'un fichier par empreinte cryptographique.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.1</span>

Recherche tous les fichiers `.log` de `C:\Windows\Logs` (récursivement) contenant le mot "error" (insensible à la casse), et affiche le nom de fichier et le numéro de ligne pour chaque correspondance.
</div>

**Corrigé :**
```powershell
Get-ChildItem C:\Windows\Logs -Filter *.log -Recurse -ErrorAction SilentlyContinue |
    Select-String -Pattern "error" |
    Select-Object Filename, LineNumber
```

*Chapitre suivant : le réseau — diagnostic, requêtes web, et création d'outils réseau en PowerShell.*
