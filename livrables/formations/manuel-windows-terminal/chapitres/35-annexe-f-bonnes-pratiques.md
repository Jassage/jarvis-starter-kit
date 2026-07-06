<div class="chapitre-titre-num">ANNEXE F</div>

# Bonnes pratiques : synthèse

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Cette annexe rassemble, par thème, l'ensemble des bonnes pratiques détaillées au fil des chapitres — une checklist de référence rapide avant de livrer ou partager un script.
</div>

## F.1 Écriture de scripts

- Utiliser la convention Verb-Noun avec un verbe approuvé (`Get-Verb`) pour toute fonction. *(Chapitre 28)*
- Inclure un bloc d'aide comment-based (SYNOPSIS, DESCRIPTION, PARAMETER, EXAMPLE) en tête de script. *(Chapitre 28)*
- Ajouter `[CmdletBinding()]` à toute fonction avancée pour bénéficier de `-Verbose`/`-Debug`. *(Chapitres 14, 27)*
- Ne jamais coder de chemin, identifiant ou secret en dur ; privilégier des paramètres ou variables d'environnement. *(Chapitres 22, 28)*
- Découper tout script dépassant 100-150 lignes en modules réutilisables. *(Chapitre 23)*

## F.2 Gestion des erreurs

- Définir `$ErrorActionPreference = "Stop"` en tête de script pour rendre les erreurs interceptables par défaut. *(Chapitre 28)*
- Toujours `-ErrorAction Stop` sur une commande dont l'échec doit être géré par `catch`. *(Chapitre 27)*
- Vérifier `$LASTEXITCODE` après tout appel à une commande externe (`npm`, `git`, `docker`) dans un pipeline CI/CD. *(Chapitre 26)*
- Journaliser les erreurs dans un fichier persistant pour tout script destiné à l'automatisation non surveillée. *(Chapitres 15, 28)*

## F.3 Validation des entrées

- Utiliser `ValidateSet`, `ValidateRange`, `ValidatePattern`, `ValidateScript` plutôt que du texte libre non vérifié. *(Chapitres 14, 28)*
- Préférer `-match` (regex) à `-like` (wildcards) dès qu'un motif de recherche devient précis. *(Chapitres 17, Annexe D)*

## F.4 Sécurité

- Ne jamais stocker un secret en clair dans un script versionné ; utiliser `SecretManagement` ou des variables d'environnement. *(Chapitre 22)*
- Appliquer le principe du moindre privilège : ne demander des droits administrateur (`#Requires -RunAsAdministrator`) que si réellement nécessaire. *(Chapitres 16, 22)*
- Signer les scripts destinés à être distribués plutôt que d'abaisser l'Execution Policy à `Bypass`. *(Chapitre 22)*
- Limiter les exclusions Windows Defender au strict nécessaire, documentées et revues périodiquement. *(Chapitre 19)*

## F.5 Réseau et systèmes distants

- Préférer `Test-NetConnection -Port` à un simple `ping` pour diagnostiquer un problème applicatif réel. *(Chapitre 18)*
- Fermer explicitement toute session distante persistante (`Remove-PSSession`, `Remove-CimSession`) en fin de script. *(Chapitres 20, 23)*
- Ne scanner un réseau qu'avec une autorisation explicite. *(Chapitre 29)*

## F.6 Fichiers et disques

- Toujours `-ErrorAction SilentlyContinue` sur une recherche récursive depuis la racine d'un disque. *(Chapitre 17)*
- Vérifier l'intégrité d'un fichier téléchargé via `Get-FileHash` avant exécution. *(Chapitre 17)*
- Exporter (`reg export`) une clé de registre avant toute modification manuelle. *(Chapitre 19)*

## F.7 Cloud et DevOps

- Toujours nettoyer les ressources cloud de test (`Remove-AzResourceGroup`) pour éviter une facturation résiduelle. *(Chapitre 24)*
- Vérifier le contexte actif (`Get-AzContext`) avant une commande destructrice sur un abonnement. *(Chapitre 24)*
- Envoyer une notification après chaque déploiement automatisé, réussi ou échoué. *(Chapitre 26)*

## F.8 Débogage et maintenance

- Utiliser `$PSScriptRoot` plutôt que des chemins relatifs dans tout script destiné à l'automatisation. *(Chapitre 27)*
- Tester une tâche planifiée avec `Start-ScheduledTask` immédiatement après sa création. *(Chapitre 15)*
- Documenter toute tâche planifiée créée pour qu'un autre administrateur en comprenne le rôle plus tard. *(Chapitre 15)*

*Annexe suivante : ressources officielles Microsoft pour approfondir.*
