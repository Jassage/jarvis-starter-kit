<div class="chapitre-titre-num">CHAPITRE 8</div>

# Créer son premier script .bat

## 🎯 Objectifs

Écrire des scripts Batch en partant d'un script de 5 lignes, et progresser jusqu'à un menu interactif complet combinant variables, conditions, boucles et fonctions.

## Prérequis

Chapitres 4-7.

## 🧠 Comprendre : automatiser une suite de commandes

**Le problème.** Retaper à la main, chaque jour, la même suite de dix commandes CMD pour nettoyer un dossier ou lancer une sauvegarde est une perte de temps et une source d'erreurs de frappe.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **script Batch** est une recette de cuisine écrite noir sur blanc : au lieu de dicter chaque étape en direct au chef, tu l'écris une fois sur une fiche, et n'importe qui (ou une machine, à une heure précise) peut ensuite l'exécuter à l'identique, autant de fois que nécessaire.
</div>

## 💻 Démonstration : 5 lignes

```bat
@echo off
echo Bonjour Jaslin
pause
```

## 🔍 Décortiquons

<div class="encadre astuce">
<span class="encadre-titre">💡 @echo off : la première ligne de quasi tout script Batch</span>
Sans `@echo off`, CMD affiche **chaque commande** avant de l'exécuter (utile pour déboguer, bruyant en usage normal). Le `@` supplémentaire devant `echo off` lui-même évite que cette ligne se propre s'affiche également.
</div>

`echo Bonjour Jaslin` affiche le texte (chapitre 4). `pause` attend une touche avant de fermer la fenêtre — sans elle, un script lancé par double-clic se fermerait instantanément après affichage, trop vite pour être lu.

Enregistre ce texte dans un fichier `bonjour.bat`, double-clique dessus. C'est ton premier script exécuté.

## 8.1 10 lignes : ajouter des variables

```bat
@echo off
set NOM=Jaslin
set /a AGE=24
echo Bonjour %NOM%, tu as %AGE% ans

set /p SAISIE=Entre ton nom : 
echo Bonjour %SAISIE% !
```

`set /a` : évaluation arithmétique (utile pour un compteur, une somme). `set /p` : demande une saisie interactive à l'utilisateur, comme au chapitre 7 pour les variables — mais ici définie dans le script lui-même.

## 8.2 20 lignes : ajouter une condition

```bat
@echo off
set /p AGE=Quel âge as-tu ? 

if %AGE% GEQ 18 (
    echo Tu es majeur
) else (
    echo Tu es mineur
)

if exist "C:\Projets" (
    echo Le dossier existe
) else (
    echo Le dossier n'existe pas
)
```

| Opérateur | Signification |
|---|---|
| `EQU` | égal à |
| `NEQ` | différent de |
| `LSS` | inférieur à |
| `LEQ` | inférieur ou égal |
| `GTR` | supérieur à |
| `GEQ` | supérieur ou égal |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser = au lieu de EQU pour comparer des nombres</span>
```bat
if %AGE% = 18 ( ... )      ← ❌ "=" compare du TEXTE, fonctionne par coincidence sur certains cas
if %AGE% EQU 18 ( ... )    ← ✅ comparaison NUMERIQUE explicite
```
</div>

## 8.3 Ajouter une boucle (for)

```bat
@echo off
REM Boucle sur une liste de valeurs
for %%F in (rouge vert bleu) do (
    echo Couleur : %%F
)

REM Boucle sur tous les fichiers .txt du dossier courant
for %%F in (*.txt) do (
    echo Fichier trouve : %%F
)

REM Boucle numerique : de 1 a 10
for /l %%i in (1,1,10) do (
    echo Compteur : %%i
)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ %%F dans un script, %F seul dans la console interactive</span>
Dans un fichier `.bat`, la variable de boucle `for` s'écrit avec **deux** signes pourcent (`%%F`) ; tapée directement dans la console CMD (hors script), un seul suffit (`%F`) — une source de confusion fréquente en copiant une commande de la console vers un script sans l'adapter.
</div>

## 8.4 Passer à une fonction (labels et call)

```bat
@echo off
call :Saluer Jaslin
call :Saluer Marie
goto :Fin

:Saluer
echo Bonjour %~1 !
exit /b

:Fin
echo Script termine.
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : label</span>
Un **label** (`:Saluer`) est une étiquette dans le script, un point que `goto` ou `call` peut cibler directement. Batch n'a pas de vraies fonctions comme un langage moderne (chapitre 16 pour les vraies fonctions PowerShell), mais `call :Label` "appelle" un label comme une fonction, avec `%~1` récupérant le premier argument passé. `exit /b` termine ce sous-programme et revient au point d'appel — sans lui, l'exécution continuerait dans le script principal au lieu de revenir.
</div>

## 8.5 Un menu interactif complet

```bat
@echo off
:Menu
cls
echo ===================================
echo         MENU DE MAINTENANCE
echo ===================================
echo 1. Nettoyer les fichiers temporaires
echo 2. Afficher les infos systeme
echo 3. Quitter
echo ===================================
set /p CHOIX=Choix : 

if "%CHOIX%"=="1" goto Nettoyer
if "%CHOIX%"=="2" goto InfosSysteme
if "%CHOIX%"=="3" goto Quitter
echo Choix invalide
pause
goto Menu

:Nettoyer
del /q /s "%TEMP%\*.*" >nul 2>&1
echo Nettoyage termine.
pause
goto Menu

:InfosSysteme
systeminfo | findstr /c:"Nom du systeme" /c:"Version du systeme"
pause
goto Menu

:Quitter
echo Au revoir !
exit /b
```

<div class="encadre astuce">
<span class="encadre-titre">💡 >nul 2>&1 : masquer la sortie normale ET les erreurs</span>
`>nul` redirige la sortie standard vers "nulle part" (rien ne s'affiche) ; `2>&1` redirige aussi le flux d'erreur (canal 2) vers le même endroit que la sortie standard (canal 1) — utile pour exécuter une commande "silencieusement", sans bruit ni messages d'erreur parasites à l'écran.
</div>

## 8.6 Automatisation : un script de sauvegarde

```bat
@echo off
set SOURCE=C:\Projets
set DESTINATION=D:\Sauvegardes\Projets_%date:~-4%%date:~3,2%%date:~0,2%

echo Sauvegarde en cours vers %DESTINATION%...
robocopy "%SOURCE%" "%DESTINATION%" /mir /r:3 /w:5 >nul

if %ERRORLEVEL% GEQ 8 (
    echo ERREUR : la sauvegarde a echoue.
) else (
    echo Sauvegarde terminee avec succes.
)
pause
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Construire un nom de dossier daté automatiquement</span>
`%date:~-4%` extrait les 4 derniers caractères de la date système (l'année, dans le format français JJ/MM/AAAA) ; `%date:~3,2%` extrait 2 caractères à partir de la position 3 (le mois). Rappel du chapitre 6 sur `ERRORLEVEL` de robocopy : `GEQ 8` détecte une vraie erreur, pas un succès partiel normal.
</div>

## ⚠️ Attention : erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Guillemets manquants autour d'une variable pouvant contenir des espaces</span>
```bat
if %CHOIX%==1 goto Menu        ← ❌ plante si CHOIX est vide (devient "if ==1 goto Menu", invalide)
if "%CHOIX%"=="1" goto Menu    ← ✅ toujours valide, meme si CHOIX est vide
```
</div>

## Bonnes pratiques

- Toujours entourer les comparaisons de variables de guillemets (`"%VAR%"=="valeur"`), même si la variable "devrait" toujours contenir quelque chose.
- Utiliser `setlocal` en début de script pour que les variables définies ne "fuient" pas vers la session CMD appelante après la fin du script.
- Préférer PowerShell (Partie 6 et suivantes) pour toute nouvelle automatisation non contrainte par la compatibilité — Batch reste utile pour des tâches très simples ou historiques.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Écris un script Batch qui demande un nombre à l'utilisateur, puis affiche s'il est pair ou impair.
</div>

**✅ Correction.**
```bat
@echo off
set /p NOMBRE=Entre un nombre : 
set /a RESTE=%NOMBRE% %% 2
if %RESTE%==0 (
    echo %NOMBRE% est pair.
) else (
    echo %NOMBRE% est impair.
)
pause
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.2</span>

Crée un script `nettoyeur.bat` qui : (1) affiche l'espace libre sur le lecteur `C:` avant nettoyage, (2) supprime le contenu de `%TEMP%`, (3) affiche l'espace libre après nettoyage.
</div>

**✅ Correction.**
```bat
@echo off
echo === Avant nettoyage ===
fsutil volume diskfree C:

del /q /s "%TEMP%\*.*" >nul 2>&1

echo === Apres nettoyage ===
fsutil volume diskfree C:
pause
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 8.3</span>

Transforme le script de l'exercice 8.1 en fonction appelable (label + `call`), puis appelle-la trois fois avec trois nombres différents codés en dur dans le script (sans redemander de saisie à chaque fois).
</div>

**✅ Correction du défi.**
```bat
@echo off
call :TesterParite 7
call :TesterParite 12
call :TesterParite 33
goto :Fin

:TesterParite
set /a RESTE=%~1 %% 2
if %RESTE%==0 (
    echo %~1 est pair.
) else (
    echo %~1 est impair.
)
exit /b

:Fin
```

## 🎯 Ce que tu sais maintenant

- `@echo off`, `set`/`set /a`/`set /p`, `if`/`else` (avec `EQU`/`NEQ`/`GEQ`...), `for`/`for /l` couvrent l'essentiel du langage Batch.
- Les "fonctions" Batch sont des labels appelés via `call :Label`, terminés par `exit /b`.
- Un menu interactif combine `goto`, labels et boucle sur lui-même pour rester actif jusqu'au choix de sortie.
- `robocopy` reste la commande de choix pour l'automatisation de sauvegardes en Batch.

*Ceci clôt la Partie 5. Chapitre suivant : introduction à PowerShell — pourquoi ce shell change tout, en travaillant avec des objets plutôt que du texte.*
