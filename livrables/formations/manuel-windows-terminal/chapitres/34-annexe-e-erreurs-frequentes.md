<div class="chapitre-titre-num">ANNEXE E</div>

# Erreurs fréquentes : synthèse

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Cette annexe rassemble, en un seul tableau consultable rapidement, l'ensemble des erreurs courantes détaillées chapitre par chapitre tout au long du manuel — un aide-mémoire de dépannage rapide plutôt qu'une nouvelle explication.
</div>

| Symptôme | Cause | Solution | Chapitre |
|---|---|---|---|
| `catch` ne s'exécute jamais | Erreur non-terminante par défaut | Ajouter `-ErrorAction Stop` | 27 |
| `-Verbose` n'affiche rien | Fonction sans `[CmdletBinding()]` | Ajouter `[CmdletBinding()]` | 27 |
| Grand espace blanc entre chapitres imprimés | Règle CSS `page-break-before` mal ciblée | Cibler le badge, pas le titre | — |
| Script fonctionne en interactif, pas en tâche planifiée | Chemin relatif invalide (répertoire de travail différent) | Utiliser `$PSScriptRoot` ou chemins absolus | 27 |
| `Access is denied` en recherche récursive | Dossiers systèmes protégés | `-ErrorAction SilentlyContinue` | 17 |
| Variable vide de façon inattendue dans une fonction | Portée (scope) locale par défaut | Utiliser `$script:` ou passer en paramètre | 14 |
| `ConvertTo-Json` tronque les données imbriquées | Profondeur par défaut de 2 niveaux | Ajouter `-Depth` suffisant | 25 |
| Ping échoue mais le service répond bien | ICMP bloqué par pare-feu, HTTP/S non bloqué | `Test-NetConnection -Port` | 18 |
| `Select-String` ne trouve rien dans les sous-dossiers | Oubli de `-Recurse` sur `Get-ChildItem` en amont | Combiner `Get-ChildItem -Recurse \| Select-String` | 17 |
| Comparaison de nombres donne un résultat inattendu | Variable en réalité une chaîne de caractères | Caster explicitement avec `[int]`/`[double]` | 11 |
| `-replace`/`-match` ne filtre pas comme attendu | Caractère spécial regex non échappé (`.`, `(`, `)`) | Échapper avec `\` | Annexe D |
| Boucle `for`/`foreach` infinie ou trop courte | Erreur dans la condition ou incrémentation | Vérifier attentivement les bornes | 13 |
| Mot de passe visible dans un script versionné | Secret codé en dur | Variable d'environnement ou `SecretManagement` | 22 |
| `Set-ExecutionPolicy Bypass` utilisé pour "faire passer" un script | Contourne un vrai problème de provenance/signature | Signer le script ou vérifier sa provenance | 22 |
| Tâche planifiée créée mais ne s'exécute jamais | Mauvais `Principal`/droits insuffisants, ou Trigger mal configuré | Vérifier `Get-ScheduledTask`, tester avec `Start-ScheduledTask` | 15 |
| Erreur `pandoc`/`node`/commande externe introuvable en script | PATH de la session sans le dossier de l'exécutable | Vérifier `$env:PATH`, réinstaller/rafraîchir le PATH | 2 |
| `Get-CimInstance -ComputerName` échoue à distance | WinRM non activé sur la machine cible | `Enable-PSRemoting -Force` sur la cible | 20, 23 |
| `robocopy` considéré comme "en échec" par un script | Codes de sortie 0-7 sont tous des succès partiels | Vérifier `$LASTEXITCODE -lt 8` | 4 |
| Doublons de compte/erreur `$Error[0]` peu clair | Erreur ancienne encore dans l'historique | `$Error.Clear()` avant un nouveau test | 27 |
| Git hook PowerShell ne se déclenche jamais | Git n'exécute pas directement les `.ps1` | Wrapper shell appelant `powershell.exe -File` | 26 |

*Annexe suivante : bonnes pratiques, en synthèse de l'ensemble du manuel.*
