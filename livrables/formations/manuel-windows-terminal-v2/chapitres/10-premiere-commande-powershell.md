<div class="chapitre-titre-num">CHAPITRE 10</div>

# Première commande PowerShell

## 🎯 Objectifs

Utiliser l'aide intégrée (`Get-Help`, `Get-Command`, `Get-Member`) pour apprendre en autonomie, et maîtriser les toutes premières cmdlets de navigation (`Get-ChildItem`, `Get-Location`, `Set-Location`).

## Prérequis

Chapitre 9.

## 🧠 Comprendre : apprendre à pêcher plutôt que recevoir un poisson

**Le problème.** Aucun manuel, aussi complet soit-il, ne pourra jamais couvrir les centaines de cmdlets existantes. Il faut donc savoir se documenter **soi-même**, directement dans le terminal, sans dépendre d'une recherche web à chaque question.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
`Get-Command` est l'index d'une bibliothèque : il te dit **quels livres existent** sur un sujet. `Get-Help` est le contenu de chaque livre : il t'explique **comment l'utiliser**. `Get-Member` est une loupe posée sur un objet précis : elle te montre **ce que cet objet précis contient et sait faire**.
</div>

## 💻 Démonstration : Get-Command

```powershell
Get-Command                          # liste TOUTES les cmdlets/fonctions/alias disponibles
Get-Command -Verb Get                # toutes les cmdlets commençant par "Get-"
Get-Command -Noun Process            # toutes les cmdlets liées à "Process" (Get-Process, Stop-Process...)
```

## 🔍 Décortiquons

`-Verb` et `-Noun` filtrent la liste selon la convention Verbe-Nom vue au chapitre 9. Face à un besoin nouveau ("comment gérer les services ?"), `Get-Command -Noun Service` révèle immédiatement toutes les cmdlets pertinentes (`Get-Service`, `Start-Service`, `Stop-Service`, `Restart-Service`, chapitre 18) — souvent plus rapide qu'une recherche web.

## 10.1 Get-Help : l'aide détaillée d'une cmdlet précise

```powershell
Get-Help Get-Process
Get-Help Get-Process -Examples     ← affiche SEULEMENT des exemples d'usage concrets
Get-Help Get-Process -Full          ← documentation COMPLETE (parametres detailles, notes...)
Get-Help Get-Process -Online        ← ouvre la documentation Microsoft officielle dans le navigateur
Update-Help                          ← telecharge les dernieres versions des fichiers d'aide
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Update-Help : indispensable après une installation fraîche</span>
Contrairement à CMD (`/?` fonctionne toujours immédiatement), PowerShell installe des fichiers d'aide **minimaux** par défaut — `Get-Help` peut afficher un message générique tant qu'`Update-Help` (nécessite une connexion internet et des droits administrateur) n'a pas téléchargé la documentation complète.
</div>

## 10.2 Get-Member : explorer un objet en détail

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
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-Member révèle TOUT ce qu'un objet peut faire et contenir</span>
Face à un objet inconnu (par exemple, le résultat d'une cmdlet jamais utilisée), `| Get-Member` liste immédiatement toutes ses **propriétés** (données consultables) et **méthodes** (actions exécutables) — la meilleure façon de découvrir ce qu'on peut réellement faire avec un résultat. Ce sujet est approfondi au chapitre 12.
</div>

## 10.3 Get-ChildItem : lister fichiers et dossiers

```powershell
Get-ChildItem
Get-ChildItem -Path C:\Projets -Recurse       ← equivalent de "dir /s" (chapitre 5)
Get-ChildItem -Path C:\Projets -Filter *.txt
Get-ChildItem -Path C:\Projets -Hidden         ← fichiers caches
```

## 10.4 Get-Location et Set-Location : où suis-je, où aller

```powershell
Get-Location
Set-Location C:\Projets
Set-Location ..
Push-Location C:\Temp     ← memorise l'emplacement actuel avant de changer
Pop-Location               ← revient a l'emplacement memorise par Push-Location
```

## Tableau récapitulatif : équivalences CMD → PowerShell

| CMD | PowerShell (nom complet) | Alias courant |
|---|---|---|
| `dir` | `Get-ChildItem` | `ls`, `gci` |
| `cd` | `Set-Location` | `cd`, `sl` |
| `cls` | `Clear-Host` | `cls`, `clear` |
| `tasklist` | `Get-Process` | `ps`, `gps` |

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre Get-Help et Get-Command</span>
`Get-Command` répond à "quelle cmdlet existe pour faire X ?" (découverte) ; `Get-Help` répond à "comment utiliser cette cmdlet précise que je connais déjà ?" (documentation). Chercher de l'aide sur une cmdlet dont on ne connaît pas encore le nom avec `Get-Help` échoue simplement — c'est `Get-Command` qu'il fallait utiliser en premier.
</div>

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Sans connaître son nom à l'avance, trouve la cmdlet qui permet d'obtenir la date et l'heure actuelles, puis affiche son aide avec des exemples.
</div>

**✅ Correction.**
```powershell
Get-Command -Noun Date
Get-Help Get-Date -Examples
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.2</span>

Déplace-toi dans `C:\Windows`, mémorise cet emplacement, va ensuite dans ton dossier utilisateur, puis reviens à `C:\Windows` sans retaper son chemin.
</div>

**✅ Correction.**
```powershell
Push-Location C:\Windows
Set-Location $env:USERPROFILE
Pop-Location
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 10.3</span>

Trouve, via `Get-Command`, le nom exact de la cmdlet permettant de tester si un chemin de fichier existe (tu en auras besoin dès le chapitre 11), sans utiliser `Get-Help` avant de l'avoir trouvée.
</div>

**✅ Correction du défi.**
```powershell
Get-Command -Verb Test -Noun Path
```
Révèle `Test-Path` — la convention `Verbe-Nom` (chapitre 9) rend ce genre de recherche systématique, plutôt qu'un pari.

## 🎯 Ce que tu sais maintenant

- `Get-Command` découvre une cmdlet inconnue ; `Get-Help` documente une cmdlet déjà identifiée ; `Get-Member` explore un objet précis.
- `Get-ChildItem` liste, `Get-Location`/`Set-Location` consultent/changent le dossier courant, `Push-Location`/`Pop-Location` mémorisent un aller-retour.

*Chapitre suivant : manipuler pleinement fichiers et dossiers avec PowerShell — création, copie, déplacement, lecture et écriture de contenu.*
