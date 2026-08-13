<div class="chapitre-titre-num">CHAPITRE 3</div>

# Installer et configurer Windows Terminal

## 🎯 Objectifs

Installer Windows Terminal, PowerShell 7, Git Bash et OpenSSH, puis personnaliser Windows Terminal (profils, thèmes, police, couleurs, raccourcis) pour en faire un poste de travail confortable pour un développeur et administrateur système.

## Prérequis

Chapitre 2. Windows 10 (version 2004 ou plus récente) ou Windows 11.

## 🧠 Comprendre : pourquoi installer avant de personnaliser

**Le problème.** Windows fournit CMD et PowerShell 5.1 nativement, mais ni Windows Terminal, ni PowerShell 7, ni Git Bash ne sont installés par défaut sur toutes les machines. Il faut les récupérer, et le faire manuellement (télécharger un installeur depuis un site, cliquer "Suivant" plusieurs fois) devient vite pénible dès qu'on doit répéter l'opération sur plusieurs machines.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un **gestionnaire de paquets** (`winget`) est comme un livreur qui connaît déjà l'adresse de tous les fournisseurs de la ville : au lieu d'aller toi-même chercher chaque logiciel sur son site, tu passes une seule commande standardisée, et il s'occupe du reste.
</div>

## 💻 Démonstration : installer avec winget

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : winget</span>
`winget` (*Windows Package Manager*) est préinstallé sur Windows 10/11 récents — l'équivalent de `apt` sur Debian/Ubuntu ou `brew` sur macOS. Il télécharge et installe des logiciels depuis un dépôt géré par Microsoft et la communauté, sans passer par un navigateur.
</div>

```
winget install --id Microsoft.WindowsTerminal -e
```

## 🔍 Décortiquons

- `winget install` : la sous-commande qui installe un paquet.
- `--id Microsoft.WindowsTerminal` : l'identifiant exact et unique du paquet dans le dépôt (évite toute ambiguïté avec un nom proche).
- `-e` (`--exact`) : n'installe que si l'identifiant correspond exactement — évite d'installer par erreur un paquet au nom approchant.

Alternative sans terminal du tout : Microsoft Store → rechercher "Windows Terminal" → Installer.

## 3.1 Installer PowerShell 7

```
winget install --id Microsoft.PowerShell -e
```

```
pwsh --version
PowerShell 7.4.1
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ pwsh, pas powershell, pour lancer PowerShell 7</span>
Une fois installé, PowerShell 7 se lance via la commande `pwsh` (pas `powershell`, réservé à Windows PowerShell 5.1, déjà présent). Les deux versions **coexistent** sans conflit, chacune avec son propre exécutable.
</div>

## 3.2 Installer Git Bash

```
winget install --id Git.Git -e
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi installer Git Bash même en utilisant surtout PowerShell</span>
Git Bash fournit un environnement Bash minimal sur Windows, utile pour exécuter des scripts shell existants (`.sh`), suivre des tutoriels écrits pour Linux/macOS, ou disposer de commandes Unix familières (`grep`, `awk`, `sed`) sans installer WSL en entier.
</div>

## 3.3 Installer OpenSSH (client et serveur)

```
# Vérifier ce qui est déjà présent
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'

# Installer le CLIENT (pour SE CONNECTER à un serveur distant) s'il est absent
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Installer le SERVEUR (pour RECEVOIR des connexions entrantes sur CETTE machine)
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Client vs serveur OpenSSH : ne pas confondre les deux installations</span>
Le **client** permet à ta machine de se connecter (`ssh utilisateur@serveur`) à une autre. Le **serveur** (`sshd`) permet à d'autres machines de se connecter **à la tienne**. N'installe le serveur que si tu dois réellement administrer cette machine à distance — l'activer inutilement élargit la surface d'attaque (rappel au chapitre 22, sécurité).
</div>

## 3.4 Configurer Windows Terminal : le fichier settings.json

Windows Terminal se configure entièrement via un fichier JSON, accessible via `Ctrl+,` depuis l'application, ou directement :

```
%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : JSON</span>
Le **JSON** (*JavaScript Object Notation*) est un format de texte structuré, très utilisé pour la configuration et l'échange de données (tu le recroiseras massivement au chapitre 21, API REST). Il s'écrit avec des accolades `{ }` pour les objets, des crochets `[ ]` pour les listes, et des paires `"clé": valeur`.
</div>

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
      { "name": "PowerShell 7", "commandline": "pwsh.exe" },
      { "name": "Invite de commandes", "commandline": "cmd.exe" },
      { "name": "Git Bash", "commandline": "C:\\Program Files\\Git\\bin\\bash.exe" }
    ]
  }
}
```

## 3.5 Profils : un onglet par shell, chacun personnalisable

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque profil peut avoir sa propre configuration complète</span>
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

## 3.6 Thèmes, police et raccourcis

```json
"schemes": [
  { "name": "Alerte Rouge", "background": "#2b0000", "foreground": "#f0f0f0", "cursorColor": "#ff0000" }
]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Cascadia Code : la police par défaut de Windows Terminal</span>
**Cascadia Code** (créée par Microsoft) inclut des **ligatures** de programmation : certaines séquences de caractères (`!=`, `=>`, `->`) s'affichent comme un symbole unique plus lisible, sans changer le texte réel sous-jacent. Purement cosmétique, mais très appréciée des développeurs.
</div>

```json
"actions": [
  { "command": { "action": "splitPane", "split": "auto" }, "keys": "alt+shift+d" },
  { "command": "newTab", "keys": "ctrl+t" },
  { "command": { "action": "closeTab" }, "keys": "ctrl+shift+w" },
  { "command": { "action": "find" }, "keys": "ctrl+shift+f" }
]
```

## Exemple final assemblé

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

## ⚠️ Attention : erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Éditer settings.json avec une virgule en trop ou en moins</span>
Le JSON est strict sur la syntaxe (virgules entre éléments, jamais après le dernier) — une virgule oubliée ou surnuméraire empêche Windows Terminal de charger la configuration au redémarrage. Toujours éditer via `Ctrl+,` (qui ouvre un éditeur avec validation), ou vérifier la syntaxe avant de sauvegarder manuellement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre le profil par défaut du terminal et le shell par défaut du système</span>
Changer `defaultProfile` dans Windows Terminal ne change **que** l'onglet ouvert par défaut dans cette application — cela n'affecte pas quel shell s'ouvre si tu lances `cmd` ou `powershell` directement depuis une autre application.
</div>

## Bonnes pratiques

- Toujours passer par PowerShell 7 (`pwsh`) comme profil par défaut pour un usage moderne.
- Versionner son `settings.json` personnel dans un dépôt Git privé, pour le retrouver facilement sur une nouvelle machine.
- Nommer explicitement les profils sensibles (production, serveurs critiques) avec un code couleur distinct.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Installe Windows Terminal et PowerShell 7 via `winget`. Ouvre `settings.json` (`Ctrl+,` puis "Ouvrir le fichier JSON") et change la police par défaut pour "Cascadia Code", taille 13.
</div>

**✅ Correction.**
```json
"profiles": {
  "defaults": { "fontFace": "Cascadia Code", "fontSize": 13 }
}
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.2</span>

Crée un profil nommé "Développement" qui démarre directement dans `C:\Scripts`, avec une couleur de fond différente du profil par défaut.
</div>

**✅ Correction.**
```json
{
  "name": "Développement",
  "commandline": "pwsh.exe",
  "startingDirectory": "C:\\Scripts",
  "colorScheme": "One Half Dark"
}
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 3.3</span>

Crée un profil Windows Terminal nommé "Urgence" qui, à l'ouverture, se connecte automatiquement via SSH à une machine de ton choix, avec un fond de couleur orange distinctif.
</div>

**✅ Correction du défi.**
```json
{
  "name": "Urgence",
  "commandline": "pwsh.exe -NoExit -Command \"ssh utilisateur@monserveur.com\"",
  "colorScheme": "Urgence Orange"
}
```
```json
"schemes": [
  { "name": "Urgence Orange", "background": "#3d1f00", "foreground": "#ffffff", "cursorColor": "#ff9800" }
]
```

## 🎯 Ce que tu sais maintenant

- `winget` installe Windows Terminal, PowerShell 7 et Git Bash en une commande chacun.
- OpenSSH existe en client (se connecter) et serveur (recevoir des connexions) — à installer distinctement selon le besoin réel.
- Windows Terminal se configure entièrement via `settings.json` : profils, thèmes, police, raccourcis clavier.
- Chaque profil peut avoir sa propre apparence, utile pour distinguer visuellement des environnements sensibles.

*Ceci clôt la Partie 3. Chapitre suivant : les premières commandes CMD, en commençant par la navigation dans le système de fichiers.*
