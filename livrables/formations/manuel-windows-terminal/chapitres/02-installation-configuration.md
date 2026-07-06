<div class="chapitre-titre-num">CHAPITRE 2</div>

# Installation et configuration

## Objectifs pédagogiques

Installer Windows Terminal, PowerShell 7, Git Bash et OpenSSH, puis personnaliser complètement Windows Terminal (profils, thèmes, police, couleurs, raccourcis).

## Prérequis

Chapitre 1 (vocabulaire de base). Windows 10 (2004+) ou Windows 11.

## 2.1 Installer Windows Terminal

```
$ winget install --id Microsoft.WindowsTerminal -e
```

<div class="encadre astuce">
<span class="encadre-titre">💡 winget : le gestionnaire de paquets officiel de Windows</span>
`winget` (Windows Package Manager) est préinstallé sur Windows 10/11 récents — l'équivalent de `apt` sur Debian/Ubuntu ou `brew` sur macOS. Il télécharge et installe des logiciels depuis un dépôt géré par Microsoft et la communauté, sans passer par un navigateur.
</div>

Alternative : Microsoft Store → rechercher "Windows Terminal" → Installer.

## 2.2 Installer PowerShell 7

```
$ winget install --id Microsoft.PowerShell -e
```

```
$ pwsh --version
PowerShell 7.4.1
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ pwsh, pas powershell, pour lancer PowerShell 7</span>
Une fois installé, PowerShell 7 se lance via la commande `pwsh` (pas `powershell`, qui reste réservée à Windows PowerShell 5.1 déjà présent sur le système). Les deux versions **coexistent** sans conflit, chacune avec son propre exécutable.
</div>

## 2.3 Installer Git Bash

```
$ winget install --id Git.Git -e
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi installer Git Bash même si on utilise principalement PowerShell</span>
Git Bash fournit un environnement Bash minimal sur Windows, utile pour exécuter des scripts shell existants (`.sh`), suivre des tutoriels écrits pour Linux/macOS, ou simplement disposer de commandes Unix familières (`grep`, `awk`, `sed`) sans installer WSL complet.
</div>

## 2.4 Installer OpenSSH

```
$ # Client OpenSSH (pour SE CONNECTER à un serveur distant) - souvent déjà présent
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

$ # Installer le CLIENT s'il est absent
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

$ # Installer le SERVEUR (pour RECEVOIR des connexions SSH entrantes sur CETTE machine)
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Client vs Serveur OpenSSH : ne pas confondre les deux installations</span>
Le **client** permet à ta machine de se connecter (`ssh utilisateur@serveur`) à une autre. Le **serveur** (`sshd`) permet à d'autres machines de se connecter **à la tienne**. N'installe le serveur que si tu as réellement besoin d'administrer cette machine à distance — l'activer inutilement élargit la surface d'attaque de sécurité (rappel du chapitre 22).
</div>

## 2.5 Configurer Windows Terminal : le fichier settings.json

Windows Terminal se configure entièrement via un fichier JSON, accessible via `Ctrl+,` (virgule) depuis l'application, ou directement :

```
%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json
```

```json
{
  "defaultProfile": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
  "profiles": {
    "defaults": {
      "fontFace": "Cascadia Code",
      "fontSize": 12,
      "colorScheme": "One Half Dark",
      "cursorShape": "bar"
    },
    "list": [
      {
        "name": "PowerShell 7",
        "commandline": "pwsh.exe",
        "icon": "ms-appx:///ProfileIcons/{574e775e-4f2a-5b96-ac1e-a2962a402336}.png"
      },
      {
        "name": "Invite de commandes",
        "commandline": "cmd.exe"
      },
      {
        "name": "Git Bash",
        "commandline": "C:\\Program Files\\Git\\bin\\bash.exe"
      }
    ]
  }
}
```

## 2.6 Profils : un onglet par shell, chacun personnalisable

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque profil peut avoir SA PROPRE configuration complète</span>
Un profil définit non seulement quel exécutable lancer (`commandline`), mais aussi son propre thème de couleurs, sa police, son dossier de démarrage (`startingDirectory`), et même une image de fond distincte — utile pour distinguer visuellement, par exemple, un profil "Production" (fond rouge) d'un profil "Développement" (fond neutre).
</div>

```json
{
  "name": "Serveur Production (attention !)",
  "commandline": "pwsh.exe -NoExit -Command \"ssh admin@serveur-prod.com\"",
  "colorScheme": "Alerte Rouge",
  "startingDirectory": "C:\\Scripts"
}
```

## 2.7 Thèmes et schémas de couleurs

```json
"schemes": [
  {
    "name": "Alerte Rouge",
    "background": "#2b0000",
    "foreground": "#f0f0f0",
    "cursorColor": "#ff0000"
  }
]
```

## 2.8 Police avec ligatures

<div class="encadre astuce">
<span class="encadre-titre">💡 Cascadia Code : la police par défaut de Windows Terminal</span>
**Cascadia Code** (créée par Microsoft) inclut des **ligatures** de programmation : certaines séquences de caractères (`!=`, `=>`, `->`) s'affichent comme un symbole unique plus lisible, sans changer le texte réel sous-jacent. Purement cosmétique, mais très appréciée des développeurs.
</div>

## 2.9 Raccourcis clavier personnalisés

```json
"actions": [
  { "command": { "action": "splitPane", "split": "auto" }, "keys": "alt+shift+d" },
  { "command": "newTab", "keys": "ctrl+t" },
  { "command": { "action": "closeTab" }, "keys": "ctrl+shift+w" },
  { "command": { "action": "find" }, "keys": "ctrl+shift+f" }
]
```

## 2.10 Personnalisation complète : exemple final assemblé

```json
{
  "defaultProfile": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
  "profiles": {
    "defaults": { "fontFace": "Cascadia Code", "fontSize": 12, "opacity": 90, "useAcrylic": true },
    "list": [
      { "name": "PowerShell 7", "commandline": "pwsh.exe", "colorScheme": "One Half Dark" },
      { "name": "CMD", "commandline": "cmd.exe", "colorScheme": "Campbell" },
      { "name": "Git Bash", "commandline": "C:\\Program Files\\Git\\bin\\bash.exe" }
    ]
  },
  "actions": [
    { "command": "newTab", "keys": "ctrl+t" },
    { "command": { "action": "splitPane", "split": "auto" }, "keys": "alt+shift+d" }
  ]
}
```

## 2.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Éditer settings.json avec une virgule en trop ou en moins</span>
Le JSON est strict sur la syntaxe (virgules entre éléments, jamais après le dernier) — une virgule oubliée ou surnuméraire empêche Windows Terminal de charger la configuration au redémarrage. Toujours éditer via `Ctrl+,` (qui ouvre un éditeur avec validation), ou vérifier la syntaxe avant de sauvegarder manuellement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre le profil par défaut du terminal et le shell par défaut du système</span>
Changer `defaultProfile` dans Windows Terminal ne change **que** l'onglet ouvert par défaut dans cette application — cela n'affecte pas quel shell s'ouvre si tu lances `cmd` ou `powershell` directement depuis une autre application (menu Démarrer, raccourci existant).
</div>

## 2.12 Bonnes pratiques

- Toujours passer par PowerShell 7 (`pwsh`) comme profil par défaut pour un usage moderne.
- Versionner son `settings.json` personnel dans un dépôt Git privé, pour le retrouver facilement sur une nouvelle machine.
- Nommer explicitement les profils sensibles (production, serveurs critiques) avec un code couleur distinct.

## 2.13 Résumé du chapitre

- `winget` installe Windows Terminal, PowerShell 7 et Git Bash en une commande chacun.
- OpenSSH existe en client (se connecter) et serveur (recevoir des connexions) — à installer distinctement selon le besoin réel.
- Windows Terminal se configure entièrement via `settings.json` : profils, thèmes, police, raccourcis clavier.
- Chaque profil peut avoir sa propre apparence, utile pour distinguer visuellement des environnements sensibles.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.1</span>

Installe Windows Terminal et PowerShell 7 via `winget`. Ouvre `settings.json` (`Ctrl+,` puis "Ouvrir le fichier JSON") et change la police par défaut pour "Cascadia Code", avec une taille de 13.
</div>

**Corrigé :**
```json
"profiles": {
  "defaults": {
    "fontFace": "Cascadia Code",
    "fontSize": 13
  }
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.2 (mini-projet)</span>

Crée un profil Windows Terminal nommé "Urgence" qui, à l'ouverture, se connecte automatiquement via SSH à une machine de ton choix, avec un fond de couleur orange distinctif.
</div>

**Corrigé :**
```json
{
  "name": "Urgence",
  "commandline": "pwsh.exe -NoExit -Command \"ssh utilisateur@monserveur.com\"",
  "colorScheme": "Urgence Orange"
},
```
```json
"schemes": [
  { "name": "Urgence Orange", "background": "#3d1f00", "foreground": "#ffffff", "cursorColor": "#ff9800" }
]
```

*Ceci clôt la Partie 1. Chapitre suivant : les bases de CMD, en commençant par la navigation dans le système de fichiers.*
