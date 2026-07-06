<div class="chapitre-titre-num">CHAPITRE 8</div>

# Introduction à PowerShell

## Objectifs pédagogiques

Comprendre pourquoi PowerShell a été créé, le concept de cmdlet, le pipeline, les alias, et savoir utiliser l'aide intégrée pour apprendre en autonomie.

## Prérequis

Partie 2 entière (aide à apprécier le contraste avec CMD/Batch).

## 8.1 Pourquoi PowerShell a été créé

<div class="encadre astuce">
<span class="encadre-titre">💡 Le problème que CMD ne résolvait pas</span>
CMD et le langage Batch (chapitre 7) suffisent pour des tâches simples, mais deviennent vite limités pour de l'administration système sérieuse : pas de vrai typage de données, manipulation de texte fragile, aucune notion d'objet, gestion d'erreurs rudimentaire. Microsoft a conçu **PowerShell** (projet "Monad", sorti en 2006) spécifiquement pour l'administration système avancée, en s'appuyant sur le framework .NET.
</div>

## 8.2 Les Cmdlets : le nom des commandes PowerShell

Une **cmdlet** (prononcé "command-lette") suit toujours la convention **Verbe-Nom** :

```
Get-Process       ← Verbe : Get (obtenir), Nom : Process (processus)
Set-Location      ← Verbe : Set (définir), Nom : Location (emplacement)
New-Item          ← Verbe : New (créer), Nom : Item (élément)
Remove-Item       ← Verbe : Remove (supprimer), Nom : Item
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une convention stricte et prévisible, contrairement à CMD</span>
CMD mélange des noms de commandes arbitraires (`dir`, `del`, `copy`, `md`) sans logique de nommage commune. PowerShell impose une liste **fermée** de verbes standardisés (`Get`, `Set`, `New`, `Remove`, `Start`, `Stop`, `Add`, `Test`...) — une fois cette convention comprise, on peut souvent **deviner** le nom d'une cmdlet qu'on n'a jamais utilisée.
</div>

```
PS> Get-Verb | Select-Object -First 5

Verb  Group
----  -----
Add   Common
Clear Common
Close Common
Copy  Common
Enter Common
```

## 8.3 Le pipeline : chaîner des commandes

```powershell
Get-Process | Where-Object { $_.CPU -gt 100 } | Sort-Object CPU -Descending | Select-Object -First 5
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le symbole | transmet le RÉSULTAT COMPLET (objets), pas juste du texte</span>
Rappel du chapitre 1 : dans CMD/Bash, `|` transmet du texte que la commande suivante doit re-analyser. Dans PowerShell, `|` transmet les **objets** eux-mêmes, avec toutes leurs propriétés intactes — `Where-Object` peut donc filtrer directement sur `.CPU` sans aucune analyse de texte, un sujet développé en détail au chapitre 10.
</div>

```{.uml}
Get-Process                    produit une COLLECTION D'OBJETS Process
      │  (chaque objet a des proprietes : Name, Id, CPU, WorkingSet...)
      ▼
Where-Object { $_.CPU -gt 100 } filtre : ne garde que les objets dont .CPU > 100
      │
      ▼
Sort-Object CPU -Descending     trie les objets restants par la propriete .CPU
      │
      ▼
Select-Object -First 5           ne garde que les 5 premiers objets
```

## 8.4 Les alias : des raccourcis vers de vraies cmdlets

```powershell
PS> Get-Alias ls

CommandType     Name
-----------     ----
Alias           ls -> Get-ChildItem

PS> Get-Alias gci
Alias           gci -> Get-ChildItem
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un alias n'est qu'un raccourci de NOM, pas une commande différente</span>
`ls`, `dir`, `gci` sont tous des **alias** vers la **même** cmdlet `Get-ChildItem` — ils se comportent **identiquement**, contrairement à CMD où `dir` est une vraie commande interne différente de tout équivalent Unix. Pratique dans la console interactive (moins de frappe), mais les scripts destinés à être lus/maintenus par d'autres devraient utiliser le **vrai nom** de la cmdlet (`Get-ChildItem`), plus explicite qu'un alias.
</div>

## 8.5 L'aide intégrée : Get-Help

```powershell
PS> Get-Help Get-Process
PS> Get-Help Get-Process -Examples     ← affiche SEULEMENT des exemples d'usage concrets
PS> Get-Help Get-Process -Full          ← documentation COMPLÈTE (paramètres détaillés, notes...)
PS> Get-Help Get-Process -Online        ← ouvre la documentation Microsoft officielle dans le navigateur
PS> Update-Help                          ← télécharge les dernières versions des fichiers d'aide
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Update-Help : indispensable après une installation fraîche</span>
Contrairement à CMD (`/?` fonctionne toujours immédiatement), PowerShell installe des fichiers d'aide **minimaux** par défaut — `Get-Help` peut afficher un message générique tant qu'`Update-Help` (nécessite une connexion internet et des droits administrateur) n'a pas téléchargé la documentation complète.
</div>

## 8.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Écrire un script avec des alias, puis être surpris qu'il ne fonctionne pas ailleurs</span>
Certains alias PowerShell (`curl`, `wget`, `ls`) portent le **même nom** qu'une vraie commande Unix, mais pointent vers une cmdlet PowerShell aux paramètres différents (`curl` est un alias de `Invoke-WebRequest`, pas le vrai curl Unix, chapitre 18). Un script écrit en pensant utiliser "curl Unix" peut échouer de façon déroutante.
</div>

## 8.7 Bonnes pratiques

- Utiliser les vrais noms de cmdlets (`Get-ChildItem`) dans tout script destiné à être partagé ou maintenu.
- Réserver les alias (`ls`, `gci`) à l'usage interactif personnel, jamais dans un script `.ps1`.
- `Get-Help -Examples` avant de chercher ailleurs : souvent suffisant pour comprendre une cmdlet inconnue.

## 8.8 Résumé du chapitre

- PowerShell a été conçu pour l'administration système avancée, avec des cmdlets suivant la convention **Verbe-Nom**.
- Le pipeline (`|`) transmet des **objets** complets entre cmdlets, pas du texte à re-analyser.
- Les alias (`ls`, `gci`, `dir`) sont de simples raccourcis vers de vraies cmdlets — à réserver à l'usage interactif.
- `Get-Help` (avec `-Examples`, `-Full`, `-Online`) et `Update-Help` sont les outils d'apprentissage en autonomie.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Trouve, sans chercher sur internet, le nom complet de la cmdlet derrière l'alias `kill`, puis consulte ses exemples d'usage.
</div>

**Corrigé :**
```powershell
PS> Get-Alias kill

CommandType     Name
-----------     ----
Alias           kill -> Stop-Process

PS> Get-Help Stop-Process -Examples
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.2 (défi pratique)</span>

En te basant uniquement sur la convention Verbe-Nom (section 8.2), devine le nom de la cmdlet permettant de créer un nouveau dossier, puis vérifie ton hypothèse avec `Get-Help`.
</div>

**Corrigé :** `New-Item` (avec le paramètre `-ItemType Directory`) — `Get-Help New-Item -Examples` confirme l'usage : `New-Item -Path "C:\Test" -ItemType Directory`.

*Chapitre suivant : les cmdlets essentielles à connaître dès le départ.*
