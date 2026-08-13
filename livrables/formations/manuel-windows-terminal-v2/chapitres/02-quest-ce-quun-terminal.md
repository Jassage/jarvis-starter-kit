<div class="chapitre-titre-num">CHAPITRE 2</div>

# Qu'est-ce qu'un terminal ?

## 🎯 Objectifs

À la fin de ce chapitre, tu sauras distinguer terminal, console et shell, situer CMD, PowerShell et Windows Terminal les uns par rapport aux autres, et choisir le bon outil selon la tâche à accomplir.

## Prérequis

Chapitre 1 (comment fonctionne un ordinateur).

## 🧠 Comprendre : pourquoi taper des commandes plutôt que cliquer ?

**Le problème.** Cliquer sur des icônes fonctionne très bien pour une action isolée. Mais dès qu'il faut répéter une tâche cent fois, l'enchaîner avec d'autres, ou l'exécuter automatiquement à 3h du matin sans personne devant l'écran, la souris devient un obstacle : elle ne se programme pas.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Cliquer dans une interface graphique, c'est comme cuisiner en montrant du doigt chaque ingrédient à un assistant qui ne comprend que les gestes. Taper une commande, c'est lui **dicter une instruction précise et sans ambiguïté**, qu'il peut aussi bien exécuter une fois... que mille fois d'affilée, sans jamais se fatiguer ni se tromper.
</div>

**Explication simple.** Un **terminal** est une fenêtre qui affiche du texte et transmet ce que tu tapes. Un **shell** est le programme qui lit ce texte, l'interprète comme une instruction, et l'exécute — CMD et PowerShell sont des shells. L'**invite de commandes** (*prompt*) est le message qui indique que le shell attend une saisie, par exemple `C:\Users\Jaslin>`.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : console, terminal, shell, invite</span>
- **Console** : le terme historique de Microsoft pour la fenêtre texte de Windows (`conhost.exe`).
- **Terminal** : l'application qui affiche le texte et transmet la saisie — aujourd'hui, Windows Terminal.
- **Shell** : le programme qui interprète et exécute tes commandes (CMD, PowerShell).
- **Invite de commandes** (*prompt*) : le message qui signale que le shell attend une instruction.
</div>

## 💻 Démonstration : un aperçu avant l'installation

Sans encore rien installer (ce sera le chapitre 3), tu peux déjà ouvrir ce qui existe nativement sur Windows : appuie sur `Win+R`, tape `cmd`, valide.

```
C:\Users\Jaslin>dir
 Le volume dans le lecteur C n'a pas de nom.
 Répertoire de C:\Users\Jaslin

06/07/2026  09:00    <DIR>          Documents
06/07/2026  09:00    <DIR>          Téléchargements
```

## 🔍 Décortiquons

- `C:\Users\Jaslin>` : l'invite. Elle indique le dossier "courant" (dans lequel tu te trouves actuellement, notion développée au chapitre 5).
- `dir` : la commande tapée, qui demande la liste du contenu du dossier courant.
- Le reste : la **réponse** du shell, affichée en texte.

Refais la même manipulation avec `Win+R`, tape cette fois `powershell`, valide, puis tape `$PSVersionTable` :

```
PS C:\Users\Jaslin> $PSVersionTable

Name                           Value
----                           -----
PSVersion                      5.1.22621.1
PSEdition                      Desktop
```

Deux shells différents, deux façons de dialoguer avec Windows — et déjà une différence visible : l'invite commence par `PS` en PowerShell.

## 2.1 Histoire express : du télétype à Windows Terminal

```{.uml}
1870s : Teletype (telescripteur)          - machines a ecrire reliees par telegraphe
1960s : Terminaux "verts" (VT100...)      - ecran + clavier relies a un ordinateur central
1980s : MS-DOS + COMMAND.COM               - le premier shell de Microsoft, sur IBM PC
1993  : Windows NT + cmd.exe               - CMD moderne, toujours vivant aujourd'hui
2006  : Windows PowerShell 1.0              - shell oriente objet, pense pour l'administration
2016  : PowerShell Core (multiplateforme)   - PowerShell devient open source, tourne sur Linux/macOS
2019  : Windows Terminal                     - nouvelle application hote, onglets, themes, plusieurs shells
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi CMD existe encore aujourd'hui</span>
CMD n'a quasiment pas évolué depuis les années 1990, mais Microsoft le maintient pour la **compatibilité** : des dizaines de milliers de scripts `.bat` et d'installateurs logiciels écrits depuis des décennies continuent de fonctionner sans modification. Ce n'est pas de la nostalgie, c'est une contrainte assumée.
</div>

## 2.2 PowerShell 5.1 et PowerShell 7 : deux versions à ne pas confondre

<div class="encadre attention">
<span class="encadre-titre">⚠️ Distinction essentielle</span>
- **Windows PowerShell** (5.1 et antérieur) : intégré à Windows, fonctionne **uniquement** sur Windows, basé sur le .NET Framework classique. Fichier : `powershell.exe`.
- **PowerShell 7** (anciennement "PowerShell Core") : réécriture **multiplateforme** (Windows, Linux, macOS), basée sur .NET moderne, installée séparément. Fichier : `pwsh.exe`.
</div>

Ce manuel utilise **PowerShell 7** comme référence à partir du chapitre 9 : c'est la version activement développée par Microsoft, recommandée pour tout nouveau script. PowerShell 5.1 reste présent sur toute installation Windows (compatibilité de certains modules serveur plus anciens), mais n'évoluera plus.

## 2.3 Windows Terminal : l'hôte qui réunit tout

**Windows Terminal** n'est **pas** un shell : c'est une application **hôte** moderne (onglets, panneaux divisés, thèmes) qui héberge **plusieurs** shells différents, chacun dans son propre profil configurable (chapitre 3).

```{.uml}
+-------------------------------------------------+
|            Windows Terminal (l'hote)             |
|  +----------+   +----------+   +----------+     |
|  | Onglet 1 |   | Onglet 2 |   | Onglet 3 |     |
|  |PowerShell 7|  |   CMD    |   |WSL (Bash)|     |
|  +----------+   +----------+   +----------+     |
+-------------------------------------------------+
```

## 2.4 CMD, PowerShell, Bash : le tableau comparatif

| Critère | CMD | PowerShell | Bash (Linux/WSL) |
|---|---|---|---|
| Nature des données | Texte brut | **Objets** .NET structurés | Texte brut |
| Langage de script | Batch (limité) | Langage complet (types, fonctions) | Shell scripting (puissant, textuel) |
| Origine | MS-DOS (1981) | Microsoft (2006), open source depuis 2016 | Unix (années 1970) |
| Plateformes | Windows uniquement | Windows, Linux, macOS | Linux, macOS, WSL sur Windows |
| Cas d'usage typique | Scripts hérités | Administration Windows/Cloud moderne | Scripts Unix, outils de dev |

<div class="encadre astuce">
<span class="encadre-titre">💡 La différence la plus importante : texte vs objets</span>
C'est **le** concept qui distingue fondamentalement PowerShell — développé en détail au chapitre 12. En résumé : dans CMD/Bash, chaque commande produit du **texte** que la commande suivante doit re-analyser ; dans PowerShell, chaque commande produit des **objets** structurés, directement exploitables sans analyse de texte fragile.
</div>

## ⚠️ Attention : erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Copier une commande Bash/Linux telle quelle dans PowerShell</span>

```
ls -la          # fonctionne dans PowerShell par coincidence (alias), pas parce que
                 # PowerShell "comprend" la syntaxe Bash
```

Certaines commandes Linux "semblent" fonctionner dans PowerShell grâce à des **alias** (`ls`, `cat`, `rm`, `pwd` pointent vers de vraies cmdlets PowerShell, chapitre 10) — mais leurs **paramètres** ne sont pas garantis identiques.
</div>

## Guide de décision rapide

<div class="encadre astuce">
<span class="encadre-titre">💡 Quel outil pour quelle tâche</span>
- **CMD** : exécuter un vieux script `.bat`, compatibilité stricte avec un outil ancien qui l'exige.
- **PowerShell** : toute administration Windows moderne, automatisation, Azure/Microsoft 365, DevOps.
- **Bash/WSL** : outils de développement issus de l'écosystème Linux.
</div>

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.1</span>

Ouvre successivement CMD et PowerShell (`Win+R`). Dans PowerShell, exécute `$PSVersionTable` et note la valeur de `PSEdition`. Que signifie "Desktop" par opposition à "Core" ?
</div>

**✅ Correction.** `PSEdition = Desktop` signifie Windows PowerShell (5.1, .NET Framework, Windows uniquement) ; `PSEdition = Core` signifie PowerShell 7 (multiplateforme, .NET moderne). Si `powershell` ouvre une version "Desktop", PowerShell 7 n'est probablement pas encore installé (chapitre 3) — la commande serait alors `pwsh`.

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.2</span>

Sans avoir encore appris de commande PowerShell (chapitre 10), essaie `Get-Process` dans PowerShell, puis compare visuellement avec `tasklist` dans CMD. Que remarques-tu sur la présentation ?
</div>

**✅ Correction.** Les deux listent les processus (chapitre 1, section 1.6), mais `Get-Process` affiche un tableau avec des **en-têtes de colonnes clairs et alignés automatiquement** (`CPU`, `Id`, `ProcessName`...), tandis que `tasklist` produit un texte tabulé plus rudimentaire. Premier aperçu concret de la section 2.4 : PowerShell manipule de vrais objets avec des propriétés typées, que la commande met en forme automatiquement.

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 2.3</span>

Sans documentation, essaie de deviner ce que fait `cls` dans CMD et `Clear-Host` en PowerShell. Vérifie ton hypothèse.
</div>

**✅ Correction du défi.** Les deux effacent le contenu affiché à l'écran (sans effacer l'historique des commandes tapées). C'est un exemple précoce d'un motif que tu reverras partout dans ce manuel : une même action existe presque toujours en CMD (nom court, historique) et en PowerShell (nom `Verbe-Nom`, plus explicite — chapitre 9).

## 🎯 Ce que tu sais maintenant

- Un **terminal** affiche le texte ; un **shell** (CMD, PowerShell) l'interprète et exécute des commandes.
- **CMD** est maintenu pour compatibilité ; **PowerShell** est le shell moderne d'administration ; **Windows Terminal** héberge plusieurs shells.
- **Windows PowerShell 5.1** (Windows uniquement) vs **PowerShell 7** (multiplateforme) — ce manuel utilise PowerShell 7 dès le chapitre 9.
- La différence fondamentale entre PowerShell et les autres shells : **objets structurés** plutôt que texte brut.

*Chapitre suivant : installer et configurer Windows Terminal, PowerShell 7 et Git Bash.*
