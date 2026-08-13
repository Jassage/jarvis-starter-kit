<div class="chapitre-titre-num">ANNEXE F</div>

# Cheat sheet — 50 commandes PowerShell pour développeurs

<div class="encadre astuce">
<span class="encadre-titre">💡 Format de cette annexe</span>
Pour chaque commande : son rôle, puis un exemple. Couvre Git, Node.js, Docker, JSON, CI/CD et débogage (chapitres 21, 27-29).
</div>

## Git

- `git status` → état du dépôt → `git status`
- `git log --oneline` → historique condensé → `git log --oneline -10`
- `git diff --cached --name-only` → fichiers indexés pour le prochain commit → `git diff --cached --name-only`
- `git rev-parse --abbrev-ref HEAD` → nom de la branche courante → `(git rev-parse --abbrev-ref HEAD).Trim()`
- `git checkout -b` → créer et basculer sur une nouvelle branche → `git checkout -b feature/x`
- `git describe --tags` → dernier tag atteignable → `git describe --tags`

## Node.js / npm

- `npm install` → installe les dépendances → `npm install`
- `npm run dev` → lance le serveur de développement → `npm run dev`
- `npm run build` → construit le projet → `npm run build`
- `npm test` → exécute les tests → `npm test`
- `npm run lint` → vérifie le style de code → `npm run lint`
- `npx <outil>` → exécute un outil npm sans l'installer globalement → `npx eslint fichier.js`

## Python

- `python --version` → version installée → `python --version`
- `pip install` → installe un paquet Python → `pip install requests`
- `python -m venv` → crée un environnement virtuel → `python -m venv .venv`

## Docker

- `docker ps` → conteneurs en cours d'exécution → `docker ps`
- `docker images` → images disponibles localement → `docker images`
- `docker build` → construit une image → `docker build -t mon-app .`
- `docker run` → démarre un conteneur → `docker run -p 3000:3000 mon-app`
- `docker compose up` → démarre tous les services définis → `docker compose up --build -d`
- `docker compose down -v` → arrête et supprime conteneurs + volumes → `docker compose down -v`
- `docker compose logs -f` → suit les logs en direct → `docker compose logs -f`

## JSON et configuration

- `ConvertTo-Json` → objet PowerShell vers JSON → `$config \| ConvertTo-Json -Depth 10`
- `ConvertFrom-Json` → JSON vers objet PowerShell → `Get-Content config.json \| ConvertFrom-Json`
- `Test-Json` → valide qu'un texte est du JSON correct → `Test-Json -Json $texte`

## API REST (rappel chapitre 21)

- `Invoke-RestMethod` → consomme une API, JSON auto-parsé → `Invoke-RestMethod -Uri $url`
- `Invoke-RestMethod -Method Post` → envoie des données → `Invoke-RestMethod -Uri $url -Method Post -Body $corps -ContentType "application/json"`
- en-tête `Authorization` → authentification par jeton → `-Headers @{ Authorization = "Bearer $token" }`

## CI/CD et scripts

- `$LASTEXITCODE` → code de sortie de la dernière commande externe → `if ($LASTEXITCODE -ne 0) { exit 1 }`
- `exit` → termine le script avec un code de sortie → `exit 1`
- `pwsh -File` → exécute un script depuis un autre shell/pipeline → `pwsh -File deploy.ps1`
- `pwsh -Command` → exécute une commande inline → `pwsh -Command "npm test"`

## Débogage et diagnostic (rappel chapitre 29)

- `try` / `catch` / `finally` → gestion structurée des erreurs → voir chapitre 29
- `-ErrorAction Stop` → transforme une erreur en exception interceptable → `Get-Item X -ErrorAction Stop`
- `$Error[0]` → dernière erreur de la session → `$Error[0].InvocationInfo.Line`
- `Write-Verbose` → trace activable avec `-Verbose` → `Write-Verbose "Détail" -Verbose`
- `Write-Debug` → trace activable avec `-Debug` → `Write-Debug "Valeur : $x"`
- `Set-PSBreakpoint` → point d'arrêt sur ligne/commande/variable → `Set-PSBreakpoint -Script script.ps1 -Line 10`
- `Measure-Command` → mesure un temps d'exécution → `Measure-Command { npm run build }`

## Outils et environnement

- `code .` → ouvre le dossier courant dans VS Code → `code .`
- `$PROFILE` → chemin du profil PowerShell → `notepad $PROFILE`
- `Import-Module` → charge un module personnel → `Import-Module .\Outils.psm1`
- `[Environment]::SetEnvironmentVariable` → variable d'environnement de session → voir chapitre 27, `Import-DotEnv`
- `Start-Job` → exécute une tâche en arrière-plan → `Start-Job { npm run build }`
- `Get-Job` / `Receive-Job` → suit/récupère le résultat d'une tâche → `Get-Job \| Receive-Job`
- `Select-String` → recherche de texte façon grep → `Select-String -Path *.js -Pattern "TODO"`
- `Get-FileHash` → vérifie l'intégrité d'un fichier téléchargé → `Get-FileHash installeur.exe -Algorithm SHA256`

*Annexe suivante : les erreurs fréquentes récapitulées, toutes parties confondues.*
