<div class="chapitre-titre-num">CHAPITRE 1</div>

# Qu'est-ce qu'un terminal ?

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras définir ce qu'est un terminal, situer CMD, PowerShell et Windows Terminal les uns par rapport aux autres, comprendre pourquoi ils coexistent tous sur Windows, et choisir le bon outil selon la tâche à accomplir.

## Prérequis

Aucun — ce chapitre est le point de départ du manuel.

## 1.1 Définition : terminal, console, shell, invite de commandes

<div class="encadre astuce">
<span class="encadre-titre">💡 Quatre mots pour une même réalité, à bien distinguer</span>
- **Terminal** : le programme qui affiche du texte à l'écran et transmet ce que tu tapes. Historiquement, un vrai appareil physique (un écran + clavier relié à un gros ordinateur central) ; aujourd'hui, une simple application (Windows Terminal, par exemple).
- **Console** : le terme historique de Microsoft pour désigner la fenêtre texte de Windows (`conhost.exe`).
- **Shell** (interpréteur de commandes) : le programme qui **lit** ce que tu tapes, l'**interprète**, et exécute l'action correspondante. CMD et PowerShell sont des shells.
- **Invite de commandes** : le message affiché par le shell, indiquant qu'il attend une saisie (ex : `C:\Users\Jaslin>`).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ "CMD" désigne à la fois un shell et son fichier exécutable</span>
Quand on dit "ouvrir CMD", on ouvre en réalité une fenêtre de **terminal** (conhost.exe, ou Windows Terminal) qui héberge le **shell** `cmd.exe`. Cette distinction devient importante dès qu'on personnalise l'apparence (Windows Terminal, chapitre 2) indépendamment du shell utilisé à l'intérieur.
</div>

## 1.2 Histoire des terminaux : du télétype à Windows Terminal

```{.uml}
1870s : Télétype (téléscripteur)         — machines à écrire reliées par télégraphe
1960s : Terminaux "verts" (VT100...)     — écran + clavier relié à un ordinateur central (mainframe)
1980s : MS-DOS + COMMAND.COM              — le premier shell de Microsoft, sur IBM PC
1993  : Windows NT + cmd.exe              — CMD moderne, toujours vivant aujourd'hui
2006  : Windows PowerShell 1.0             — shell objet, pensé pour l'administration système
2016  : PowerShell Core (multiplateforme)  — PowerShell devient open source, tourne sur Linux/macOS
2019  : Windows Terminal                    — nouvelle application hôte, onglets, thèmes, plusieurs shells
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi CMD existe encore en 2026</span>
CMD n'a pratiquement pas évolué depuis les années 1990, mais Microsoft le maintient pour la **compatibilité** : des dizaines de milliers de scripts `.bat` et d'installateurs logiciels écrits depuis 30 ans continuent de fonctionner sans modification. Ce n'est pas de la nostalgie, c'est une contrainte de rétrocompatibilité assumée.
</div>

## 1.3 CMD (Command Prompt)

`cmd.exe` est le shell historique de Windows, héritier direct de `COMMAND.COM` (MS-DOS). Il comprend un jeu de commandes internes (`dir`, `cd`, `copy`...) et peut exécuter des scripts **Batch** (`.bat`, chapitre 7).

```
C:\Users\Jaslin>dir
 Le volume dans le lecteur C n'a pas de nom.
 Répertoire de C:\Users\Jaslin

06/07/2026  09:00    <DIR>          Documents
06/07/2026  09:00    <DIR>          Téléchargements
```

## 1.4 PowerShell et PowerShell Core

<div class="encadre astuce">
<span class="encadre-titre">💡 Windows PowerShell vs PowerShell 7 (PowerShell Core) : une distinction essentielle</span>
- **Windows PowerShell** (5.1 et antérieur) : intégré à Windows, **ne fonctionne que sur Windows**, basé sur le .NET Framework classique. Fichier : `powershell.exe`.
- **PowerShell 7** (anciennement "PowerShell Core", 6.x puis 7.x) : réécriture **multiplateforme** (Windows, Linux, macOS), basée sur .NET moderne, installée séparément. Fichier : `pwsh.exe`.
</div>

```
PS C:\Users\Jaslin> $PSVersionTable

Name                           Value
----                           -----
PSVersion                      7.4.1
PSEdition                      Core
OS                             Microsoft Windows 10.0.22631
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce manuel utilise PowerShell 7 comme référence</span>
PowerShell 7 est la version activement développée par Microsoft, recommandée pour tout nouveau script. Windows PowerShell 5.1 reste présent sur toute installation Windows (pour la compatibilité de certains modules plus anciens, notamment certains modules serveur), mais n'évoluera plus. Le chapitre 2 installe PowerShell 7 explicitement.
</div>

## 1.5 Windows Terminal

**Windows Terminal** n'est **pas** un shell : c'est une application **hôte** moderne (onglets, panneaux divisés, thèmes, polices avec ligatures) qui peut héberger **plusieurs** shells différents (CMD, PowerShell 5.1, PowerShell 7, WSL/Bash, Azure Cloud Shell), chacun dans son propre profil configurable (chapitre 2).

```{.uml}
┌─────────────────────────────────────────┐
│           Windows Terminal (l'hôte)          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Onglet 1    │ │ Onglet 2    │ │ Onglet 3    │  │
│  │ PowerShell 7│ │ CMD          │ │ WSL (Bash)   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

## 1.6 Différences entre CMD, PowerShell, Bash et un terminal Linux

| Critère | CMD | PowerShell | Bash (Linux/WSL) |
|---|---|---|---|
| Nature des données manipulées | Texte brut | **Objets** .NET structurés | Texte brut |
| Langage de script | Batch (limité) | Langage complet (types, fonctions, POO) | Shell scripting (puissant, textuel) |
| Origine | MS-DOS (1981) | Microsoft (2006), open source depuis 2016 | Unix (1970s) |
| Plateformes | Windows uniquement | Windows, Linux, macOS | Linux, macOS, WSL sur Windows |
| Cas d'usage typique | Scripts hérités, compatibilité | Administration Windows/Cloud moderne | Scripts Unix/Linux, outils de développement |

<div class="encadre astuce">
<span class="encadre-titre">💡 La différence la plus importante : texte vs objets</span>
C'est **le** concept qui distingue fondamentalement PowerShell des autres shells (CMD et Bash inclus) — développé en détail au chapitre 10. En résumé : dans CMD/Bash, chaque commande produit du **texte** que la commande suivante doit re-analyser (parser) ; dans PowerShell, chaque commande produit des **objets** structurés (avec de vraies propriétés typées), directement exploitables sans analyse de texte fragile.
</div>

## 1.7 Quand utiliser chacun

<div class="encadre astuce">
<span class="encadre-titre">💡 Guide de décision rapide</span>
- **CMD** : exécuter un vieux script `.bat`, une compatibilité stricte avec un outil ancien qui l'exige.
- **PowerShell** : toute administration Windows moderne, automatisation, manipulation d'objets .NET, Azure/Microsoft 365, DevOps.
- **Bash/WSL** : outils de développement issus de l'écosystème Linux (certains outils npm, scripts shell existants, environnements de développement Linux natifs).
</div>

## 1.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Copier une commande Bash/Linux telle quelle dans PowerShell</span>
```
ls -la          # fonctionne dans PowerShell (alias), mais -la n'est PAS un vrai paramètre PowerShell,
                # c'est juste toléré par coïncidence de nommage avec un alias historique
```
Certaines commandes Linux "semblent" fonctionner dans PowerShell grâce à des **alias** (`ls`, `cat`, `rm`, `pwd` existent comme alias vers de vraies cmdlets PowerShell, chapitre 9) — mais leurs **paramètres** ne sont pas garantis identiques. `ls -la` fonctionne car PowerShell ignore silencieusement un paramètre qu'il ne reconnaît pas dans certains cas, pas parce qu'il "comprend" la syntaxe Bash.
</div>

## 1.9 Bonnes pratiques

- Utilise PowerShell pour tout nouveau script, sauf contrainte explicite de compatibilité CMD.
- N'ouvre CMD que pour une tâche ponctuelle nécessitant un vieux script `.bat`.
- Installe Windows Terminal (chapitre 2) dès le départ : un seul hôte pour tous tes shells.

## 1.10 Résumé du chapitre

- Un **terminal** affiche le texte ; un **shell** (CMD, PowerShell) l'interprète et exécute des commandes.
- **CMD** est le shell historique, maintenu pour compatibilité ; **PowerShell** est le shell moderne d'administration ; **Windows Terminal** héberge plusieurs shells dans une seule application.
- **Windows PowerShell** (5.1, Windows uniquement) vs **PowerShell 7** (multiplateforme, activement développé) — ce manuel utilise PowerShell 7.
- La différence fondamentale entre PowerShell et les autres shells : **objets structurés** plutôt que texte brut (chapitre 10).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Ouvre successivement CMD (`Win+R`, taper `cmd`) et PowerShell (`Win+R`, taper `powershell`). Dans PowerShell, exécute `$PSVersionTable` et note la valeur de `PSEdition`. Que signifie "Desktop" par opposition à "Core" ?
</div>

**Corrigé :** `PSEdition = Desktop` signifie qu'il s'agit de **Windows PowerShell** (5.1, basé sur .NET Framework, Windows uniquement) ; `PSEdition = Core` signifie **PowerShell 7** (multiplateforme, basé sur .NET moderne). Si `powershell` ouvre une version "Desktop", PowerShell 7 n'est probablement pas encore installé (chapitre 2) — dans ce cas la commande serait `pwsh` une fois installé.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2 (défi pratique)</span>

Sans encore avoir appris de commande PowerShell (chapitre suivant), essaie de deviner puis vérifier : que produit la commande `Get-Process` ? Compare visuellement son affichage à celui de la commande CMD `tasklist`. Que remarques-tu sur la présentation des colonnes ?
</div>

**Corrigé :** Les deux listent les processus en cours d'exécution, mais `Get-Process` (PowerShell) affiche un tableau avec des **en-têtes de colonnes clairs et alignés automatiquement** (CPU, Id, ProcessName...), tandis que `tasklist` (CMD) produit un texte tabulé plus rudimentaire. C'est un premier aperçu concret de la section 1.6 : PowerShell manipule des objets avec de vraies propriétés (`CPU`, `Id`), que la commande met en forme automatiquement — pas juste du texte préformaté comme `tasklist`.

*Chapitre suivant : installation et configuration complète de Windows Terminal, PowerShell 7, Git Bash et OpenSSH.*
