<div class="chapitre-titre-num">CHAPITRE 25</div>

# PowerShell pour les développeurs

## Objectifs pédagogiques

Intégrer PowerShell dans un flux de travail de développement quotidien : Git, npm/Node.js, Docker, variables d'environnement de projet, et automatisation de tâches répétitives de développement.

## Prérequis

Chapitres 9-24.

## 25.1 Git depuis PowerShell

```powershell
git status
git log --oneline -10

# Fonctions PowerShell pratiques autour de Git
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

<div class="encadre astuce">
<span class="encadre-titre">💡 Personnaliser le prompt PowerShell pour afficher la branche Git active</span>
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
Placée dans `$PROFILE` (chapitre 23), cette fonction affiche la branche Git courante directement dans le prompt — évitant un `git status` répété pour se rappeler où l'on se trouve.
</div>

## 25.2 npm et Node.js depuis PowerShell

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
<span class="encadre-titre">💡 Automatiser le lancement d'un projet avec vérification des dépendances</span>
Cette fonction évite l'erreur classique du "ça ne marche pas" après un `git pull` qui a modifié `package.json` — vérifier systématiquement la présence de `node_modules` avant de lancer le serveur de développement (rappel direct du manuel Node.js/Express de cette collection).
</div>

## 25.3 Variables d'environnement de projet (.env)

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
<span class="encadre-titre">💡 PowerShell n'a pas de support .env natif, contrairement à certains frameworks Node.js</span>
Cette fonction reproduit manuellement ce que fait `dotenv` côté Node.js — charge chaque ligne `CLE=valeur` du fichier `.env` comme variable d'environnement de la session en cours (`"Process"`, donc temporaire, jamais persistée sur la machine).
</div>

## 25.4 Docker depuis PowerShell

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
<span class="encadre-titre">💡 docker compose down -v : supprime aussi les volumes (données persistées)</span>
`-v` (volumes) est nécessaire pour repartir d'une base de données totalement vierge lors d'un test — sans ce paramètre, les données d'un précédent test persistent dans le volume Docker malgré la suppression des conteneurs.
</div>

## 25.5 Scripts de tâches répétitives (task runner maison)

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
<span class="encadre-titre">💡 -ValidateSet : évite une faute de frappe silencieuse</span>
Rappel du chapitre 14 : en limitant `-Tache` aux valeurs `test`/`build`/`deploy`/`clean`, PowerShell rejette immédiatement `Invoke-TacheProjet -Tache biuld` avec un message d'erreur clair, plutôt que d'exécuter silencieusement aucune branche du `switch`.
</div>

## 25.6 Formater et valider du JSON en ligne de commande

```powershell
Get-Content package.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

$config = Get-Content config.json | ConvertFrom-Json
$config.version = "2.0.0"
$config | ConvertTo-Json -Depth 10 | Set-Content config.json
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -Depth 10 : ConvertTo-Json tronque silencieusement au-delà de 2 niveaux par défaut</span>
Un objet JSON imbriqué (configuration complexe, réponse d'API) perd ses niveaux profonds si `-Depth` n'est pas explicitement augmenté — un piège fréquent qui produit un JSON incomplet sans message d'erreur.
</div>

## 25.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier -Depth avec ConvertTo-Json sur une configuration imbriquée</span>
Rappel de la section 25.6 : toujours vérifier la profondeur réelle de l'objet à sérialiser et ajuster `-Depth` en conséquence, sous peine de perdre silencieusement des données lors de la réécriture d'un fichier JSON.
</div>

## 25.8 Bonnes pratiques

- Centraliser les tâches répétitives d'un projet (build, test, deploy) dans une fonction `Invoke-TacheProjet` documentée, plutôt que de mémoriser des commandes éparses.
- Toujours vérifier la présence de `node_modules` (ou équivalent) avant de lancer un serveur de développement.
- Utiliser `-ValidateSet` pour toute fonction dont les valeurs d'entrée sont limitées à un ensemble connu.

## 25.9 Résumé du chapitre

- PowerShell s'intègre naturellement avec Git, npm et Docker, permettant d'automatiser des tâches de développement quotidiennes.
- Une fonction `Import-DotEnv` maison charge un fichier `.env` en variables d'environnement de session.
- `ConvertFrom-Json`/`ConvertTo-Json` (avec `-Depth` ajusté) manipulent des fichiers de configuration JSON directement en PowerShell.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Écris une fonction `Invoke-TacheProjet` avec les tâches "test" et "lint", qui exécute respectivement `npm test` et `npm run lint`.
</div>

**Corrigé :**
```powershell
function Invoke-TacheProjet {
    param([ValidateSet("test", "lint")][string]$Tache)
    switch ($Tache) {
        "test" { npm test }
        "lint" { npm run lint }
    }
}
```

*Chapitre suivant : PowerShell et DevOps (CI/CD, Git hooks, intégration avec les pipelines).*
