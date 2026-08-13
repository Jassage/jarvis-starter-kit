<div class="chapitre-titre-num">CHAPITRE 28</div>

# PowerShell et les bases du DevOps

## 🎯 Objectifs

Utiliser PowerShell dans un pipeline CI/CD (GitHub Actions), écrire un Git hook en PowerShell, et comprendre pourquoi vérifier `$LASTEXITCODE` après chaque commande externe est indispensable en automatisation.

## Prérequis

Chapitre 27.

## 🧠 Comprendre : automatiser la vérification, pas seulement l'exécution

**Le problème.** Un déploiement manuel ("je lance les tests, si ça va j'envoie en production") dépend de la rigueur humaine, faillible par nature. Le **DevOps** vise à automatiser non seulement l'exécution, mais aussi les **vérifications** qui précèdent un déploiement.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un pipeline CI/CD est une chaîne de contrôle qualité en usine : chaque pièce (chaque changement de code) passe par une série de postes de vérification automatiques (tests, style de code, build) avant d'être autorisée à sortir — aucune pièce n'atteint le client sans avoir passé tous les postes.
</div>

## 💻 Démonstration : PowerShell dans GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Installer les dependances
        shell: pwsh
        run: npm install
      - name: Executer les tests
        shell: pwsh
        run: |
          npm test
          if ($LASTEXITCODE -ne 0) {
              Write-Error "Les tests ont echoue"
              exit 1
          }
```

## 🔍 Décortiquons

`shell: pwsh` indique à GitHub Actions d'exécuter ce bloc avec PowerShell 7, plutôt que le shell par défaut de la machine (Bash sur Linux, `sh` sur macOS). `$LASTEXITCODE` récupère le code de sortie de `npm test` — la brique qui manquait pour transformer un simple appel en **vérification** bloquante.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : $LASTEXITCODE</span>
Contrairement à une cmdlet PowerShell native (qui lève une exception en cas d'erreur, gérable par `try`/`catch`, chapitre 29), un programme externe (`npm`, `node`, `git`, `docker`) ne fait que renvoyer un **code de sortie** dans `$LASTEXITCODE` — `0` signifie succès, toute autre valeur signale un échec qu'il faut vérifier **explicitement**, comme déjà vu pour `robocopy` aux chapitres 6, 8 et 23.
</div>

## 28.1 Git hooks écrits en PowerShell

```powershell
# .git/hooks/pre-commit.ps1
$fichiersModifies = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match "\.(js|ts)$" }

if ($fichiersModifies) {
    Write-Output "Verification du linting avant commit..."
    npx eslint $fichiersModifies
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Linting echoue. Commit annule."
        exit 1
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Git n'exécute pas nativement des fichiers .ps1 comme hooks</span>
Les hooks Git (`.git/hooks/pre-commit`) doivent être des scripts shell exécutables sans extension. Sur Windows, un petit wrapper est nécessaire :
```sh
#!/bin/sh
pwsh -ExecutionPolicy Bypass -File ".git/hooks/pre-commit.ps1"
```
Ce fichier `pre-commit` (sans extension) appelle le vrai script PowerShell `pre-commit.ps1` — une solution pragmatique pour bénéficier de la richesse de PowerShell dans un hook Git.
</div>

## 28.2 Script de vérification avant déploiement

```powershell
function Test-PretPourDeploiement {
    $erreurs = @()

    npm test
    if ($LASTEXITCODE -ne 0) { $erreurs += "Tests unitaires en echec" }

    npm run lint
    if ($LASTEXITCODE -ne 0) { $erreurs += "Linting en echec" }

    $brancheActuelle = (git rev-parse --abbrev-ref HEAD).Trim()
    if ($brancheActuelle -ne "main") { $erreurs += "Deploiement autorise uniquement depuis 'main' (branche actuelle : $brancheActuelle)" }

    if ($erreurs.Count -gt 0) {
        Write-Error "Deploiement bloque :`n$($erreurs -join "`n")"
        return $false
    }

    Write-Output "Toutes les verifications sont passees. Deploiement autorise."
    return $true
}

if (Test-PretPourDeploiement) {
    docker compose -f docker-compose.prod.yml up -d --build
}
```

## 28.3 Notifications de déploiement

```powershell
function Send-NotificationDeploiement {
    param(
        [string]$WebhookUrl,
        [string]$Message
    )

    $corps = @{ content = $Message } | ConvertTo-Json
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $corps -ContentType "application/json"
}

Send-NotificationDeploiement -WebhookUrl $env:DISCORD_WEBHOOK -Message "Déploiement de la version $(git describe --tags) terminé avec succès."
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Réutilisation directe d'Invoke-RestMethod (chapitre 21)</span>
Cette fonction applique exactement le même principe que la consommation d'API vue au chapitre 21 — un webhook Discord/Slack n'est qu'une API REST acceptant un POST JSON, rien de spécifique à apprendre en plus.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne pas vérifier $LASTEXITCODE après une commande externe dans un pipeline</span>
Un script PowerShell continue son exécution même après l'échec d'une commande externe (`npm test` qui échoue ne stoppe pas le script à lui seul) — sans vérification explicite de `$LASTEXITCODE`, un pipeline CI/CD peut considérer un déploiement comme réussi malgré des tests en échec. C'est l'erreur DevOps la plus fréquente chez un débutant.
</div>

## Bonnes pratiques

- Toujours vérifier `$LASTEXITCODE` après l'appel d'une commande externe dans un script destiné à un pipeline CI/CD.
- Centraliser les vérifications pré-déploiement dans une fonction unique (`Test-PretPourDeploiement`), pour garantir une politique cohérente.
- Envoyer une notification automatique après chaque déploiement, réussi ou échoué, pour une meilleure traçabilité d'équipe.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 28.1</span>

Écris un script qui exécute `npm run build` et bloque le déploiement (message d'erreur + arrêt) si le build échoue.
</div>

**✅ Correction.**
```powershell
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Le build a echoue. Deploiement annule."
    exit 1
}
Write-Output "Build reussi, deploiement en cours..."
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 28.2</span>

Adapte le workflow GitHub Actions de la section "Démonstration" pour qu'il exécute aussi `npm run lint`, en bloquant le pipeline si le lint échoue.
</div>

**✅ Correction.**
```yaml
      - name: Verifier le linting
        shell: pwsh
        run: |
          npm run lint
          if ($LASTEXITCODE -ne 0) {
              Write-Error "Le linting a echoue"
              exit 1
          }
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 28.3</span>

Un collègue se plaint qu'un pipeline CI/CD "passe au vert" malgré des tests visiblement en échec dans les logs. Diagnostique la cause la plus probable, sans voir le script.
</div>

**✅ Correction du défi.** La cause la plus probable, décrite dans l'encadré "Attention" de ce chapitre : le script exécute `npm test` mais ne vérifie jamais `$LASTEXITCODE` ensuite — PowerShell poursuit l'exécution du script après l'échec de la commande externe, et le pipeline se termine "normalement" (dernier code de sortie du script, pas de `npm test`), donc vert, malgré l'échec réel des tests. Corriger en ajoutant la vérification systématique vue en section "Démonstration".

## 🎯 Ce que tu sais maintenant

- PowerShell (`pwsh`) s'exécute nativement dans GitHub Actions, avec vérification explicite de `$LASTEXITCODE`.
- Un Git hook PowerShell nécessite un petit wrapper shell, Git n'exécutant pas directement les fichiers `.ps1`.
- `Invoke-RestMethod` (chapitre 21) permet d'envoyer des notifications de déploiement vers Slack/Discord.
- L'erreur DevOps la plus fréquente : oublier de vérifier `$LASTEXITCODE`, laissant un pipeline "vert" malgré un échec réel.

*Ceci clôt la Partie 20. Chapitre suivant : la méthode de dépannage, et dix scénarios de panne réels.*
