<div class="chapitre-titre-num">CHAPITRE 3</div>

# CMD — Navigation

## Objectifs pédagogiques

Naviguer efficacement dans le système de fichiers Windows via CMD, et personnaliser l'apparence de la console.

## Prérequis

Chapitres 1-2.

## 3.1 cd : changer de dossier

```
C:\Users\Jaslin>cd Documents
C:\Users\Jaslin\Documents>cd ..
C:\Users\Jaslin>cd \
C:\>cd /d D:\Projets
D:\Projets>
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ cd seul ne change pas de lecteur</span>
```
C:\>cd D:\Projets
C:\>                    ← toujours sur C: ! cd seul ignore le changement de lecteur
```
Sans `/d`, `cd` change de dossier **uniquement si on reste sur le même lecteur**. Pour changer de lecteur ET de dossier en une commande, `/d` est indispensable (`cd /d D:\Projets`), sinon il faut taper `D:` séparément puis `cd Projets`.
</div>

## 3.2 dir : lister le contenu d'un dossier

```
C:\Projets>dir
C:\Projets>dir /a          ← affiche AUSSI les fichiers cachés/système
C:\Projets>dir /s          ← parcourt AUSSI tous les sous-dossiers (récursif)
C:\Projets>dir /b          ← format "brut" : juste les noms, sans en-tête ni résumé
C:\Projets>dir *.txt       ← filtre par motif (wildcard)
C:\Projets>dir /o:d        ← trie par date
```

## 3.3 tree : visualiser l'arborescence

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

`/f` affiche aussi les fichiers (pas seulement les dossiers).

## 3.4 cls, echo, help

```
C:\>cls                        ← efface l'écran (n'efface PAS l'historique des commandes, juste l'affichage)
C:\>echo Bonjour Jaslin         ← affiche du texte
C:\>echo.                       ← affiche une ligne VIDE (le point est nécessaire, "echo" seul affiche l'état ON/OFF)
C:\>help                        ← liste toutes les commandes internes de CMD
C:\>help dir                    ← aide détaillée sur une commande précise
C:\>dir /?                      ← équivalent de "help dir", fonctionne pour presque toutes les commandes
```

## 3.5 color, title, prompt : personnaliser la session

```
C:\>color 0A        ← fond noir (0), texte vert clair (A) — code hexadécimal fond+texte
C:\>title Ma Console de Travail
C:\>prompt $P$G      ← restaure le prompt par défaut ("Chemin>")
C:\>prompt $$        ← prompt minimaliste : juste "$"
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

## 3.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Chemin avec espaces sans guillemets</span>
```
C:\>cd Mes Documents          ← ❌ interprété comme deux arguments séparés : "Mes" et "Documents"
C:\>cd "Mes Documents"        ← ✅ guillemets obligatoires dès qu'un chemin contient un espace
```
</div>

## 3.7 Bonnes pratiques

- Utiliser `dir /b` dans un script Batch (chapitre 7) pour obtenir une liste de noms exploitable, sans le bruit de l'en-tête/résumé.
- Toujours mettre entre guillemets un chemin susceptible de contenir des espaces.

## 3.8 Résumé du chapitre

- `cd` (avec `/d` pour changer de lecteur), `dir` (avec `/s`, `/b`, `/a` selon le besoin), `tree /f` couvrent l'essentiel de la navigation.
- `cls`, `echo`, `help`/`/?` sont les commandes utilitaires de base.
- `color`, `title`, `prompt` personnalisent l'apparence de la session CMD active.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Depuis `C:\`, navigue vers `C:\Windows\System32` en une seule commande, puis liste uniquement les fichiers `.exe` de ce dossier, triés par nom.
</div>

**Corrigé :**
```
C:\>cd C:\Windows\System32
C:\Windows\System32>dir *.exe /o:n
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.2 (défi pratique)</span>

Change la couleur de la console en fond bleu/texte blanc vif, renomme le titre de la fenêtre en "Session Admin", puis affiche l'arborescence complète (fichiers inclus) de `C:\Projets` si ce dossier existe, ou de ton dossier utilisateur sinon.
</div>

**Corrigé :**
```
C:\>color 1F
C:\>title Session Admin
C:\>tree "%USERPROFILE%" /f
```

*Chapitre suivant : la gestion des fichiers (copier, déplacer, supprimer, comparer) avec CMD.*
