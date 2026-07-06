<div class="chapitre-titre-num">CHAPITRE 26</div>

# PowerShell et DevOps

## Objectifs pédagogiques

Utiliser PowerShell dans des pipelines CI/CD (GitHub Actions, Azure DevOps), écrire des Git hooks en PowerShell, et automatiser des vérifications de qualité avant déploiement.

## Prérequis

Chapitres 9-25.

## 26.1 PowerShell dans GitHub Actions

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

<div class="encadre astuce">
<span class="encadre-titre">💡 $LASTEXITCODE : vérifier le succès d'une commande externe</span>
Contrairement à une cmdlet PowerShell native (qui lève une exception en cas d'erreur, gérable par `try/catch`), un programme externe (`npm`, `node`, `git`) ne fait que renvoyer un **code de sortie** dans `$LASTEXITCODE` — 0 signifie succès, toute autre valeur signale un échec à vérifier explicitement dans un pipeline CI/CD.
</div>

## 26.2 PowerShell dans Azure DevOps Pipelines

```yaml
# azure-pipelines.yml
steps:
  - task: PowerShell@2
    inputs:
      targetType: 'inline'
      script: |
        Write-Output "Build numero : $(Build.BuildNumber)"
        npm run build
        if ($LASTEXITCODE -ne 0) { exit 1 }
```

## 26.3 Git hooks écrits en PowerShell

```powershell
# .git/hooks/pre-commit (nécessite un wrapper shell, voir encadré)
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
powershell.exe -ExecutionPolicy Bypass -File ".git/hooks/pre-commit.ps1"
```
Ce fichier `pre-commit` (sans extension) appelle le vrai script PowerShell `pre-commit.ps1` — une solution pragmatique pour bénéficier de la richesse de PowerShell dans un hook Git.
</div>

## 26.4 Script de vérification de qualité avant déploiement

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

## 26.5 Notifications de déploiement (webhook Slack/Discord)

```powershell
function Send-NotificationDeploiement {
    param(
        [string]$WebhookUrl,
        [string]$Message
    )

    $corps = @{ content = $Message } | ConvertTo-Json
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $corps -ContentType "application/json"
}

Send-NotificationDeploiement -WebhookUrl $env:DISCORD_WEBHOOK -Message "Deploiement de la version $(git describe --tags) termine avec succes."
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Réutilisation directe d'Invoke-RestMethod (chapitre 18)</span>
Cette fonction applique exactement le même principe que la consommation d'API vue au chapitre 18 — un webhook Discord/Slack n'est qu'une API REST acceptant un POST JSON, rien de spécifique à apprendre en plus.
</div>

## 26.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne pas vérifier $LASTEXITCODE après une commande externe dans un pipeline</span>
Un script PowerShell continue son exécution même après l'échec d'une commande externe (`npm test` qui échoue ne stoppe pas le script à lui seul) — sans vérification explicite de `$LASTEXITCODE`, un pipeline CI/CD peut considérer un déploiement comme réussi malgré des tests en échec.
</div>

## 26.7 Bonnes pratiques

- Toujours vérifier `$LASTEXITCODE` après l'appel d'une commande externe dans un script destiné à un pipeline CI/CD.
- Centraliser les vérifications pré-déploiement dans une fonction unique (`Test-PretPourDeploiement`), pour garantir une politique cohérente.
- Envoyer une notification automatique après chaque déploiement, réussi ou échoué, pour une meilleure traçabilité d'équipe.

## 26.8 Résumé du chapitre

- PowerShell (`pwsh`) s'exécute nativement dans GitHub Actions et Azure DevOps Pipelines, avec vérification explicite de `$LASTEXITCODE`.
- Un Git hook PowerShell nécessite un petit wrapper shell, Git n'exécutant pas directement les fichiers `.ps1`.
- `Invoke-RestMethod` (déjà vu au chapitre 18) permet d'envoyer des notifications de déploiement vers Slack/Discord.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.1</span>

Écris un script qui exécute `npm run build` et bloque le déploiement (message d'erreur + arrêt) si le build échoue.
</div>

**Corrigé :**
```powershell
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Le build a echoue. Deploiement annule."
    exit 1
}
Write-Output "Build reussi, deploiement en cours..."
```

*Chapitre suivant : le débogage de scripts PowerShell.*
