<div class="chapitre-titre-num">CHAPITRE 5</div>

# Naviguer dans Windows

## 🎯 Objectifs

Changer de lecteur (`C:`, `D:`), maîtriser toutes les options utiles de `dir`, visualiser une arborescence complète avec `tree`, et personnaliser l'apparence de la session CMD.

## Prérequis

Chapitre 4.

## 🧠 Comprendre : plusieurs disques, un seul arbre... par lecteur

**Le problème.** Un ordinateur peut avoir plusieurs disques (chapitre 1, section 1.3) — un disque système `C:` et un disque de données `D:`, par exemple. Chacun possède **sa propre** arborescence de dossiers, indépendante des autres.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Si un dossier est une armoire (chapitre 1), un **lecteur** (`C:`, `D:`) est un **bâtiment entier** contenant plusieurs armoires. `cd` seul te déplace d'une pièce à l'autre à l'intérieur du même bâtiment ; pour changer de bâtiment, il faut une instruction différente.
</div>

## 💻 Démonstration : changer de lecteur

```
C:\>D:
D:\>
```

## 🔍 Décortiquons

Taper simplement `D:` (la lettre suivie de deux points) bascule le dossier courant vers le lecteur `D:`, à l'endroit où tu l'avais laissé la dernière fois sur ce lecteur.

<div class="encadre attention">
<span class="encadre-titre">⚠️ cd seul ne change pas de lecteur</span>
```
C:\>cd D:\Projets
C:\>                    ← toujours sur C: ! cd seul ignore le changement de lecteur
```
Sans `/d`, `cd` change de dossier **uniquement si on reste sur le même lecteur**. Pour changer de lecteur ET de dossier en une seule commande, `/d` est indispensable :
```
C:\>cd /d D:\Projets
D:\Projets>
```
</div>

## 5.1 dir : toutes les options utiles

```
C:\Projets>dir              ← liste simple
C:\Projets>dir /a            ← affiche AUSSI les fichiers cachés/systeme
C:\Projets>dir /s            ← parcourt AUSSI tous les sous-dossiers (recursif)
C:\Projets>dir /b            ← format "brut" : juste les noms, sans en-tete ni resume
C:\Projets>dir *.txt         ← filtre par motif (wildcard)
C:\Projets>dir /o:d          ← trie par date
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : wildcard (caractère générique)</span>
Un **wildcard** est un symbole qui représente "n'importe quoi" dans un motif de recherche. `*` remplace n'importe quelle suite de caractères (`*.txt` = tous les fichiers se terminant par `.txt`), `?` remplace un seul caractère.
</div>

## 5.2 tree : visualiser l'arborescence complète

```
C:\Projets>tree /f
C:\PROJETS
├───mon-api
│   │   package.json
│   │
│   └───src
│           index.js
└───site-web
        index.html
```

`/f` affiche aussi les fichiers (sans lui, `tree` ne montre que les dossiers).

## 5.3 Personnaliser la session : color, title, prompt

```
C:\>color 0A        ← fond noir (0), texte vert clair (A)
C:\>title Ma Console de Travail
C:\>prompt $P$G       ← restaure le prompt par defaut ("Chemin>")
C:\>prompt $$         ← prompt minimaliste : juste "$"
```

| Code couleur | Signification |
|---|---|
| 0 | Noir |
| 1 | Bleu |
| 2 | Vert |
| 4 | Rouge |
| 7 | Blanc/Gris clair |
| A | Vert clair |
| C | Rouge clair |
| F | Blanc vif |

## ⚠️ Attention : erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre "changer de dossier" et "changer de lecteur"</span>
Un débutant qui tape `cd D:\Projets` en pensant s'être déplacé, puis lance une commande de fichier qui échoue mystérieusement, oublie souvent qu'il est toujours sur `C:`. Toujours vérifier l'invite (`D:\Projets>` et non `C:\>`) après un changement de lecteur.
</div>

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Depuis `C:\`, navigue vers `C:\Windows\System32` en une seule commande, puis liste uniquement les fichiers `.exe` de ce dossier, triés par nom.
</div>

**✅ Correction.**
```
C:\>cd C:\Windows\System32
C:\Windows\System32>dir *.exe /o:n
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.2</span>

Change la couleur de la console en fond bleu/texte blanc vif, renomme le titre de la fenêtre en "Session Admin", puis affiche l'arborescence complète (fichiers inclus) de `C:\Projets` si ce dossier existe, ou de ton dossier utilisateur sinon.
</div>

**✅ Correction.**
```
C:\>color 1F
C:\>title Session Admin
C:\>tree "%USERPROFILE%" /f
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 5.3</span>

Sans utiliser `cd /d`, en deux commandes seulement, atteins `D:\Sauvegardes\2026` depuis `C:\`.
</div>

**✅ Correction du défi.**
```
C:\>D:
D:\>cd Sauvegardes\2026
```
Basculer d'abord de lecteur avec `D:` seul, puis se déplacer normalement avec `cd` (chemin relatif, section "Comprendre" du chapitre 4) — équivalent au résultat de `cd /d D:\Sauvegardes\2026` en une seule commande, mais en deux étapes.

## 🎯 Ce que tu sais maintenant

- Changer de **lecteur** (`D:`) est différent de changer de **dossier** (`cd`) — `cd /d` fait les deux à la fois.
- `dir` accepte des options puissantes : `/a` (cachés), `/s` (récursif), `/b` (brut), `/o:d` (tri par date), et des wildcards (`*.txt`).
- `tree /f` visualise toute une arborescence en un coup d'œil.
- `color`, `title`, `prompt` personnalisent l'apparence de la session CMD active.

*Chapitre suivant : créer, copier, déplacer et supprimer des fichiers avec CMD.*
