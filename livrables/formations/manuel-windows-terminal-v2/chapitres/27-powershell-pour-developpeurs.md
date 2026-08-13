<div class="chapitre-titre-num">CHAPITRE 27</div>

# PowerShell avec Git, Node.js, Python et Docker

## 🎯 Objectifs

Intégrer PowerShell dans un flux de travail de développement quotidien : Git, npm/Node.js, variables d'environnement de projet, Docker, et automatisation de tâches répétitives.

## Prérequis

Chapitres 3, 16, 21-24.

## 🧠 Comprendre : PowerShell comme chef d'orchestre du poste de développement

**Le problème.** Un développeur enchaîne, chaque jour, les mêmes gestes autour d'un projet : vérifier la branche Git, installer les dépendances si besoin, lancer le serveur de dev, reconstruire un conteneur Docker. Sans script, chaque geste se retape à la main.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
PowerShell devient ici un **assistant de plateau** sur ton poste de développement : il ne remplace pas Git, npm ou Docker (les vrais outils), mais orchestre leur enchaînement, vérifie les prérequis avant de les lancer, et t'évite de retenir la bonne suite de commandes à chaque fois.
</div>

## 💻 Démonstration : Git depuis PowerShell

```powershell
git status
git log --oneline -10

function Get-BrancheActuelle {
    (git rev-parse --abbrev-ref HEAD).Trim()
}

function New-BranchePropre {
    param([Parameter(Mandatory=$true)][string]$Nom)
    git checkout main
    git pull
    git checkout -b $Nom
}

New-BranchePropre -Nom "feature/nouvelle-fonctionnalite"
```

## 🔍 Décortiquons

PowerShell n'a besoin d'aucune intégration spéciale pour appeler `git` : c'est un programme externe comme un autre, dont la sortie texte peut être capturée (`(git rev-parse ...)`) et enrichie par une vraie fonction PowerShell avec paramètres validés (chapitre 16).

<div class="encadre astuce">
<span class="encadre-titre">💡 Afficher la branche Git active dans le prompt</span>
```powershell
function prompt {
    $branche = git rev-parse --abbrev-ref HEAD 2>$null
    if ($branche) {
        "PS $(Get-Location) [$branche]> "
    } else {
        "PS $(Get-Location)> "
    }
}
```
Placée dans `$PROFILE` (chapitre 24), cette fonction affiche la branche Git courante directement dans le prompt — évitant un `git status` répété pour se rappeler où l'on se trouve.
</div>

## 27.1 npm et Node.js

```powershell
npm install
npm run dev
npm run build

function Start-ProjetNode {
    if (-not (Test-Path "node_modules")) {
        Write-Output "node_modules absent, installation..."
        npm install
    }
    npm run dev
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Vérifier les dépendances avant de lancer un serveur</span>
Cette fonction évite l'erreur classique du "ça ne marche pas" après un `git pull` qui a modifié `package.json` — vérifier systématiquement la présence de `node_modules` (`Test-Path`, chapitre 11) avant de lancer le serveur de développement.
</div>

## 27.2 Variables d'environnement de projet (.env)

```powershell
function Import-DotEnv {
    param([string]$Chemin = ".env")

    Get-Content $Chemin | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $nom = $matches[1].Trim()
            $valeur = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($nom, $valeur, "Process")
        }
    }
}

Import-DotEnv
$env:DATABASE_URL
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PowerShell n'a pas de support .env natif</span>
Cette fonction reproduit manuellement ce que fait `dotenv` côté Node.js — charge chaque ligne `CLE=valeur` du fichier `.env` comme variable d'environnement de la session en cours (`"Process"`, donc temporaire, jamais persistée sur la machine — rappel de la distinction session/persistant du chapitre 7).
</div>

## 27.3 Docker depuis PowerShell

```powershell
docker ps
docker images
docker build -t mon-app .
docker run -p 3000:3000 mon-app

function Reset-DockerEnvironnement {
    docker compose down -v
    docker compose up --build -d
    docker compose logs -f
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 docker compose down -v : supprime aussi les volumes</span>
`-v` (volumes) est nécessaire pour repartir d'une base de données totalement vierge lors d'un test — sans ce paramètre, les données d'un précédent test persistent dans le volume Docker malgré la suppression des conteneurs.
</div>

## 27.4 Un lanceur de tâches maison

```powershell
function Invoke-TacheProjet {
    param(
        [ValidateSet("test", "build", "deploy", "clean")]
        [string]$Tache
    )

    switch ($Tache) {
        "test"   { npm test }
        "build"  { npm run build }
        "deploy" { git push origin main; docker compose -f docker-compose.prod.yml up -d --build }
        "clean"  { Remove-Item node_modules, dist -Recurse -Force -ErrorAction SilentlyContinue }
    }
}

Invoke-TacheProjet -Tache build
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -ValidateSet évite une faute de frappe silencieuse</span>
Rappel du chapitre 16 : en limitant `-Tache` aux valeurs `test`/`build`/`deploy`/`clean`, PowerShell rejette immédiatement `Invoke-TacheProjet -Tache biuld` avec un message d'erreur clair, plutôt que d'exécuter silencieusement aucune branche du `switch`.
</div>

## 27.5 Manipuler du JSON en ligne de commande

```powershell
Get-Content package.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

$config = Get-Content config.json | ConvertFrom-Json
$config.version = "2.0.0"
$config | ConvertTo-Json -Depth 10 | Set-Content config.json
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ -Depth tronque silencieusement au-delà de 2 niveaux par défaut</span>
Un objet JSON imbriqué (configuration complexe, réponse d'API du chapitre 21) perd ses niveaux profonds si `-Depth` n'est pas explicitement augmenté — un piège fréquent qui produit un JSON incomplet sans message d'erreur.
</div>

## Bonnes pratiques

- Centraliser les tâches répétitives d'un projet (build, test, deploy) dans une fonction `Invoke-TacheProjet` documentée.
- Toujours vérifier la présence de `node_modules` (ou équivalent) avant de lancer un serveur de développement.
- Utiliser `-ValidateSet` pour toute fonction dont les valeurs d'entrée sont limitées à un ensemble connu.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.1</span>

Écris une fonction `Invoke-TacheProjet` avec les tâches "test" et "lint", exécutant respectivement `npm test` et `npm run lint`.
</div>

**✅ Correction.**
```powershell
function Invoke-TacheProjet {
    param([ValidateSet("test", "lint")][string]$Tache)
    switch ($Tache) {
        "test" { npm test }
        "lint" { npm run lint }
    }
}
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.2</span>

Écris une fonction `Start-ProjetComplet` qui charge le `.env` du projet, vérifie/installe les dépendances npm, puis lance le serveur de développement — dans cet ordre précis.
</div>

**✅ Correction.**
```powershell
function Start-ProjetComplet {
    Import-DotEnv
    if (-not (Test-Path "node_modules")) { npm install }
    npm run dev
}
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 27.3</span>

Modifie `Import-DotEnv` (section 27.2) pour qu'elle affiche un avertissement clair, sans planter le script, si le fichier `.env` n'existe pas.
</div>

**✅ Correction du défi.**
```powershell
function Import-DotEnv {
    param([string]$Chemin = ".env")

    if (-not (Test-Path $Chemin)) {
        Write-Warning "Fichier $Chemin introuvable — variables d'environnement non chargées."
        return
    }

    Get-Content $Chemin | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}
```
Reprend le réflexe `Test-Path` avant action, déjà installé au chapitre 11.

## 🎯 Ce que tu sais maintenant

- PowerShell s'intègre naturellement avec Git, npm et Docker, en enveloppant ces outils externes dans de vraies fonctions PowerShell.
- Une fonction `Import-DotEnv` maison charge un fichier `.env` en variables d'environnement de session.
- `ConvertFrom-Json`/`ConvertTo-Json` (avec `-Depth` ajusté) manipulent des fichiers de configuration JSON directement en PowerShell.

*Chapitre suivant : PowerShell et les bases du DevOps — CI/CD, GitHub Actions, codes de sortie.*
