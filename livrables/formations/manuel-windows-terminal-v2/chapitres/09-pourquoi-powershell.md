<div class="chapitre-titre-num">CHAPITRE 9</div>

# Pourquoi PowerShell ?

## 🎯 Objectifs

Comprendre pourquoi PowerShell a été créé, ce que signifie "manipuler des objets plutôt que du texte", la convention de nommage Verbe-Nom des cmdlets, et le rôle des alias.

## Prérequis

Partie 4 et 5 entières (CMD et Batch — utile pour apprécier le contraste).

## 🧠 Comprendre : la limite de CMD

**Le problème.** CMD et le langage Batch (chapitre 8) suffisent pour des tâches simples, mais deviennent vite limités pour de l'administration système sérieuse : pas de vrai typage de données, manipulation de texte fragile, aucune notion d'objet, gestion d'erreurs rudimentaire.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Demander à CMD "quel est le processus qui consomme le plus de mémoire ?" revient à demander à un employé de te **lire à voix haute** un inventaire papier, en espérant que tu sauras repérer la bonne ligne toi-même. Demander la même chose à PowerShell revient à interroger une **base de données réelle** : "trie-moi ces fiches par consommation, donne-moi la première" — une vraie question, une vraie réponse structurée.
</div>

**Explication simple.** Microsoft a conçu **PowerShell** (projet "Monad", sorti en 2006) spécifiquement pour l'administration système avancée, en s'appuyant sur le framework .NET. Sa différence fondamentale avec CMD et Bash : chaque commande produit des **objets** — des structures de données réelles, avec des propriétés nommées et typées — plutôt que du texte brut à réinterpréter.

## 💻 Démonstration : le contraste texte vs objet

```{.uml}
CMD (texte)                            PowerShell (objets)
------------------                     ------------------------
tasklist                                Get-Process
      |                                       |
      v                                       v
"chrome.exe  1234  ..."                 Objet System.Diagnostics.Process
(une CHAINE DE CARACTERES)                    {
      |                                          Name = "chrome"
      v                                          Id = 1234
findstr "chrome"                                 CPU = 45.2
(recherche TEXTUELLE fragile,                    WorkingSet = 524288000
casse si le format change)                     }
                                                      |
                                                      v
                                         $_.Name  <- acces DIRECT a la propriete,
                                                      jamais d'analyse de texte
```

## 🔍 Décortiquons : ce que ça change concrètement

En CMD, extraire "juste le nom" d'un processus depuis `tasklist` exige d'analyser du texte avec `findstr`, en espérant que la mise en forme ne change jamais d'une version de Windows à l'autre. En PowerShell, `(Get-Process).Name` accède **directement** à la propriété `Name` de chaque objet — aucune analyse de texte, aucune fragilité liée à la mise en forme.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : cmdlet</span>
Une **cmdlet** (prononcé "command-lette") est le nom donné à une commande PowerShell native. Elle suit toujours la convention **Verbe-Nom** :
```
Get-Process       <- Verbe : Get (obtenir), Nom : Process (processus)
Set-Location      <- Verbe : Set (definir), Nom : Location (emplacement)
New-Item          <- Verbe : New (creer), Nom : Item (element)
Remove-Item       <- Verbe : Remove (supprimer), Nom : Item
```
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Une convention stricte et prévisible, contrairement à CMD</span>
CMD mélange des noms de commandes arbitraires (`dir`, `del`, `copy`, `md`) sans logique de nommage commune. PowerShell impose une liste **fermée** de verbes standardisés (`Get`, `Set`, `New`, `Remove`, `Start`, `Stop`, `Add`, `Test`...) — une fois cette convention comprise, on peut souvent **deviner** le nom d'une cmdlet qu'on n'a jamais utilisée.
</div>

```powershell
Get-Verb | Select-Object -First 5

Verb  Group
----  -----
Add   Common
Clear Common
Close Common
Copy  Common
Enter Common
```

## 9.1 Le pipeline : chaîner des commandes

```powershell
Get-Process | Where-Object { $_.CPU -gt 100 } | Sort-Object CPU -Descending | Select-Object -First 5
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le symbole | transmet le résultat complet (objets), pas juste du texte</span>
Dans PowerShell, `|` transmet les **objets** eux-mêmes, avec toutes leurs propriétés intactes, d'une cmdlet à la suivante — `Where-Object` peut donc filtrer directement sur `.CPU` sans aucune analyse de texte. Sujet développé en détail au chapitre 12.
</div>

## 9.2 Les alias : des raccourcis vers de vraies cmdlets

```powershell
Get-Alias ls

CommandType     Name
-----------     ----
Alias           ls -> Get-ChildItem
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un alias n'est qu'un raccourci de nom, pas une commande différente</span>
`ls`, `dir`, `gci` sont tous des **alias** vers la **même** cmdlet `Get-ChildItem` — ils se comportent **identiquement**, contrairement à CMD où `dir` est une vraie commande interne différente de tout équivalent Unix. Pratique dans la console interactive (moins de frappe), mais un script destiné à être lu/maintenu par d'autres devrait utiliser le **vrai nom** de la cmdlet, plus explicite qu'un alias.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Écrire un script avec des alias, puis être surpris qu'il ne fonctionne pas ailleurs</span>
Certains alias PowerShell (`curl`, `wget`, `ls`) portent le **même nom** qu'une vraie commande Unix, mais pointent vers une cmdlet PowerShell aux paramètres différents (`curl` est un alias de `Invoke-WebRequest`, pas le vrai curl Unix, chapitre 21). Un script écrit en pensant utiliser "curl Unix" peut échouer de façon déroutante.
</div>

## Bonnes pratiques

- Utiliser les vrais noms de cmdlets (`Get-ChildItem`) dans tout script destiné à être partagé ou maintenu.
- Réserver les alias (`ls`, `gci`) à l'usage interactif personnel, jamais dans un script `.ps1`.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.1</span>

Trouve, sans chercher sur internet, le nom complet de la cmdlet derrière l'alias `kill`.
</div>

**✅ Correction.**
```powershell
Get-Alias kill

CommandType     Name
-----------     ----
Alias           kill -> Stop-Process
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.2</span>

En te basant uniquement sur la convention Verbe-Nom, devine le nom de la cmdlet permettant de créer un nouveau dossier.
</div>

**✅ Correction.** `New-Item` (avec le paramètre `-ItemType Directory`, vu au chapitre 11) : `New-Item -Path "C:\Test" -ItemType Directory`.

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 9.3</span>

Sans encore connaître `Get-Help` en détail (chapitre 10), essaie de deviner combien de verbes standardisés PowerShell propose au total, puis vérifie avec `(Get-Verb).Count`.
</div>

**✅ Correction du défi.** Le nombre exact varie selon la version de PowerShell (une centaine environ), mais l'essentiel n'est pas le chiffre : c'est de constater qu'il s'agit d'une **liste fermée et documentée** — contrairement à CMD, où chaque nouvelle commande pourrait en théorie inventer son propre vocabulaire.

## 🎯 Ce que tu sais maintenant

- PowerShell a été conçu pour l'administration système avancée, avec des cmdlets suivant la convention **Verbe-Nom**.
- Le pipeline (`|`) transmet des **objets** complets entre cmdlets, pas du texte à re-analyser — la différence fondamentale avec CMD/Bash.
- Les alias (`ls`, `gci`, `dir`) sont de simples raccourcis vers de vraies cmdlets — à réserver à l'usage interactif.

*Chapitre suivant : tes premières vraies commandes PowerShell, et l'aide intégrée pour apprendre en autonomie.*
