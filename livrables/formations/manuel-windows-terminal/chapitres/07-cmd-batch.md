<div class="chapitre-titre-num">CHAPITRE 7</div>

# Les scripts Batch (.bat)

## Objectifs pédagogiques

Écrire des scripts Batch complets avec variables, conditions, boucles et fonctions, jusqu'à un menu interactif automatisant plusieurs tâches.

## Prérequis

Chapitres 3-6.

## 7.1 Structure de base d'un fichier .bat

```batch
@echo off
REM Ceci est un commentaire
echo Bonjour Jaslin
pause
```

<div class="encadre astuce">
<span class="encadre-titre">💡 @echo off : la première ligne de quasi tout script Batch</span>
Sans `@echo off`, CMD affiche **chaque commande** avant de l'exécuter (utile pour déboguer, bruyant en usage normal). Le `@` supplémentaire devant `echo off` lui-même évite que cette ligne se propre s'affiche également.
</div>

## 7.2 Variables

```batch
@echo off
set NOM=Jaslin
set /a AGE=24
echo Bonjour %NOM%, tu as %AGE% ans

set /p SAISIE=Entre ton nom : 
echo Bonjour %SAISIE% !
```

`set /a` : évaluation arithmétique. `set /p` : demande une saisie interactive à l'utilisateur.

## 7.3 Conditions (if / else)

```batch
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
```batch
if %AGE% = 18 ( ... )      ← ❌ "=" compare du TEXTE, fonctionne par coïncidence sur certains cas
if %AGE% EQU 18 ( ... )    ← ✅ comparaison NUMÉRIQUE explicite
```
</div>

## 7.4 Boucles (for)

```batch
@echo off
REM Boucle sur une liste de valeurs
for %%F in (rouge vert bleu) do (
    echo Couleur : %%F
)

REM Boucle sur tous les fichiers .txt du dossier courant
for %%F in (*.txt) do (
    echo Fichier trouvé : %%F
)

REM Boucle numérique : de 1 à 10
for /l %%i in (1,1,10) do (
    echo Compteur : %%i
)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ %%F dans un script, %F seul dans la console interactive</span>
Dans un fichier `.bat`, la variable de boucle `for` s'écrit avec **deux** signes pourcent (`%%F`) ; tapée directement dans la console CMD (hors script), un seul suffit (`%F`) — une source de confusion fréquente en copiant une commande de la console vers un script sans l'adapter.
</div>

## 7.5 Fonctions (labels et call)

```batch
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

<div class="encadre astuce">
<span class="encadre-titre">💡 Batch n'a pas de vraies fonctions, mais des labels appelables</span>
`:Saluer` est un **label** (une étiquette dans le script) ; `call :Saluer Jaslin` "appelle" ce label comme une fonction, avec `%~1` récupérant le premier argument passé. `exit /b` termine ce "sous-programme" et revient au point d'appel — sans lui, l'exécution continuerait dans le script principal au lieu de revenir.
</div>

## 7.6 Menu interactif complet

```batch
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

## 7.7 Automatisation : un script de sauvegarde simple

```batch
@echo off
set SOURCE=C:\Projets
set DESTINATION=D:\Sauvegardes\Projets_%date:~-4%%date:~3,2%%date:~0,2%

echo Sauvegarde en cours vers %DESTINATION%...
robocopy "%SOURCE%" "%DESTINATION%" /mir /r:3 /w:5 >nul

if %ERRORLEVEL% GEQ 8 (
    echo ERREUR : la sauvegarde a échoué.
) else (
    echo Sauvegarde terminee avec succes.
)
pause
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Construire un nom de dossier daté automatiquement</span>
`%date:~-4%` extrait les 4 derniers caractères de la date système (l'année, dans le format français JJ/MM/AAAA) ; `%date:~3,2%` extrait 2 caractères à partir de la position 3 (le mois) — une technique de manipulation de chaînes Batch permettant de créer un dossier de sauvegarde horodaté sans dépendance externe. Rappel du chapitre 4 sur `errorlevel` de robocopy : `GEQ 8` détecte une vraie erreur, pas un succès partiel normal.
</div>

## 7.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Guillemets manquants autour d'une variable pouvant contenir des espaces</span>
```batch
if %CHOIX%==1 goto Menu        ← ❌ plante si CHOIX est vide (devient "if ==1 goto Menu", invalide)
if "%CHOIX%"=="1" goto Menu    ← ✅ toujours valide, même si CHOIX est vide
```
</div>

## 7.9 Bonnes pratiques

- Toujours entourer les comparaisons de variables de guillemets (`"%VAR%"=="valeur"`), même si la variable "devrait" toujours contenir quelque chose.
- Utiliser `setlocal` en début de script pour que les variables définies ne "fuient" pas vers la session CMD appelante après la fin du script.
- Préférer PowerShell (partie 3) pour toute nouvelle automatisation non contrainte par la compatibilité — Batch reste utile pour des tâches très simples ou historiques.

## 7.10 Résumé du chapitre

- `@echo off`, `set`/`set /a`/`set /p`, `if`/`else` (avec `EQU`/`NEQ`/`GEQ`...), `for`/`for /l` couvrent l'essentiel du langage Batch.
- Les "fonctions" Batch sont des labels appelés via `call :Label`, terminés par `exit /b`.
- Un menu interactif combine `goto`, labels et boucle sur lui-même pour rester actif jusqu'au choix de sortie.
- `robocopy` reste la commande de choix pour l'automatisation de sauvegardes en Batch.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.1</span>

Écris un script Batch qui demande un nombre à l'utilisateur, puis affiche s'il est pair ou impair.
</div>

**Corrigé :**
```batch
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

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.2 (mini-projet)</span>

Crée un script Batch "nettoyeur.bat" qui : (1) affiche l'espace libre sur le lecteur C: avant nettoyage, (2) supprime le contenu de %TEMP%, (3) affiche l'espace libre après nettoyage.
</div>

**Corrigé :**
```batch
@echo off
echo === Avant nettoyage ===
fsutil volume diskfree C:

del /q /s "%TEMP%\*.*" >nul 2>&1

echo === Apres nettoyage ===
fsutil volume diskfree C:
pause
```

*Ceci clôt la Partie 2 (les bases de CMD). Chapitre suivant : introduction à PowerShell, première étape de la Partie 3.*
