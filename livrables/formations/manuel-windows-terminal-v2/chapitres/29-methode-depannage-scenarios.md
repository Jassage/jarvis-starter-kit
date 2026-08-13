<div class="chapitre-titre-num">CHAPITRE 29</div>

# La méthode de dépannage et dix scénarios réels

## 🎯 Objectifs

Appliquer une méthode de dépannage systématique en 8 étapes, maîtriser `try`/`catch`/`finally` pour la gestion d'erreurs PowerShell, et résoudre dix scénarios de panne réels en mobilisant les outils des chapitres précédents.

## Prérequis

L'ensemble des Parties 11 à 20.

## 🧠 Comprendre : dépanner sans paniquer ni deviner

**Le problème.** Face à une panne, la tentation est de tester des solutions au hasard ("j'ai vu ça marcher une fois ailleurs") jusqu'à ce que quelque chose fonctionne, sans jamais comprendre la vraie cause — le même problème revient alors, inévitablement.

<div class="encadre astuce">
<span class="encadre-titre">💡 La méthode en 8 étapes</span>
```{.uml}
1. Identifier le probleme        - que se passe-t-il EXACTEMENT, en une phrase precise ?
2. Reproduire le probleme         - arrive-t-il a chaque fois, ou par intermittence ?
3. Collecter les informations     - logs, messages d'erreur EXACTS, contexte (chapitres 17-20)
4. Formuler une hypothese          - quelle est la cause la PLUS PROBABLE ?
5. Tester l'hypothese              - une commande CIBLEE, pas un changement au hasard
6. Corriger                        - appliquer le correctif minimal necessaire
7. Verifier                        - le symptome initial a-t-il vraiment disparu ?
8. Documenter                      - qu'est-ce qui a cause ca, pour la prochaine fois ?
```
Chaque scénario de ce chapitre applique cette méthode, dans cet ordre, sans sauter d'étape.
</div>

## 💻 Démonstration : gestion d'erreurs try/catch/finally

```powershell
try {
    $contenu = Get-Content -Path "C:\fichier-inexistant.txt" -ErrorAction Stop
} catch {
    Write-Error "Impossible de lire le fichier : $($_.Exception.Message)"
} finally {
    Write-Output "Tentative de lecture terminée."
}
```

## 🔍 Décortiquons

<div class="encadre attention">
<span class="encadre-titre">⚠️ -ErrorAction Stop est indispensable pour que catch intercepte l'erreur</span>
Par défaut, la plupart des cmdlets PowerShell génèrent des erreurs "non-terminantes" — le script continue et `catch` n'est jamais déclenché. `-ErrorAction Stop` transforme l'erreur en exception terminante, seule forme interceptable par un bloc `catch`. C'est l'erreur de débogage la plus fréquente chez les débutants PowerShell.
</div>

```powershell
$Error[0]                      ← derniere erreur survenue
$Error[0].InvocationInfo.Line  ← la ligne de code exacte qui a echoue
```

## 29.1 Write-Verbose et Write-Debug pour tracer sans polluer

```powershell
function Copier-Fichiers {
    [CmdletBinding()]
    param([string]$Source, [string]$Destination)

    Write-Verbose "Copie de $Source vers $Destination"
    Copy-Item -Path $Source -Destination $Destination
    Write-Verbose "Copie terminée."
}

Copier-Fichiers -Source "a.txt" -Destination "b.txt" -Verbose
```

Rappel du chapitre 16 : `Write-Verbose` (contrairement à `Write-Output`) ne fait jamais partie de la valeur de retour d'une fonction — l'outil correct pour tracer une progression sans polluer un résultat.

## 29.2 Un piège classique : chemins relatifs en tâche planifiée

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un script fonctionnant en interactif peut échouer en tâche planifiée</span>
Une tâche planifiée (chapitre 23) s'exécute souvent dans un répertoire de travail différent (typiquement `C:\Windows\System32`), rendant invalide tout chemin relatif (`.\donnees.csv`) qui fonctionnait en session interactive — toujours utiliser des chemins absolus, ou `$PSScriptRoot` (chemin du script lui-même) dans tout script destiné à l'automatisation.
</div>

## 29.3 Dix scénarios de panne réels

### Scénario 1 — Internet ne fonctionne plus

1. Identifier : aucun site ne se charge, sur toute l'application.
2. Reproduire : constant, sur toutes les machines du réseau ou une seule ?
3. Collecter : `Get-NetAdapter` (chapitre 20) — la carte est-elle `Up` ?
4. Hypothèse : câble/WiFi débranché, ou service réseau planté.
5. Tester : `Test-Connection -ComputerName 8.8.8.8` (une IP connue, pas un nom — élimine le DNS de l'équation).
6. Corriger : `Restart-NetAdapter`, ou reconnexion physique.
7. Vérifier : `Test-Connection google.com` réussit à nouveau.
8. Documenter : carte réseau instable depuis telle mise à jour, à surveiller.

### Scénario 2 — DNS ne fonctionne pas

1. Identifier : `ping 8.8.8.8` réussit, `ping google.com` échoue.
2. Reproduire : sur tous les noms de domaine, ou un seul ?
3. Collecter : `Resolve-DnsName google.com` (chapitre 20) — quel message d'erreur exact ?
4. Hypothèse : serveur DNS configuré injoignable.
5. Tester : `Resolve-DnsName google.com -Server 8.8.8.8` — si ça marche, le DNS configuré est en cause, pas Internet.
6. Corriger : `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8`.
7. Vérifier : `Resolve-DnsName` réussit avec la configuration normale restaurée.
8. Documenter : serveur DNS interne down à telle heure.

### Scénario 3 — Un service critique est arrêté

1. Identifier : une fonctionnalité précise ne répond plus.
2. Reproduire : le service est-il arrêté pour tout le monde ?
3. Collecter : `Get-Service -Name X` (chapitre 18) — statut, type de démarrage.
4. Hypothèse : crash du service, ou dépendance non démarrée.
5. Tester : `Get-Service -Name X -RequiredServices` — les dépendances tournent-elles ?
6. Corriger : `Restart-Service -Name X -Force`.
7. Vérifier : `Get-Service -Name X` affiche `Running`, la fonctionnalité répond.
8. Documenter : ajouter ce service à `Test-ServicesCritiques` (chapitre 18) s'il n'y était pas.

### Scénario 4 — Disque presque plein

1. Identifier : alerte Windows, ou lenteurs générales.
2. Reproduire : constant, l'espace continue-t-il de diminuer ?
3. Collecter : `Get-CimInstance Win32_LogicalDisk` (chapitre 19) — pourcentage exact libre.
4. Hypothèse : logs qui grossissent, fichiers temporaires accumulés (chapitre 23).
5. Tester : `Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object -First 10` sur les dossiers suspects.
6. Corriger : `Clear-FichiersTemporaires` (chapitre 23), ou déplacer les gros fichiers identifiés.
7. Vérifier : l'espace libre a réellement augmenté.
8. Documenter : mettre en place `Watch-EspaceDisque` (chapitre 23) en tâche planifiée pour anticiper la prochaine fois.

### Scénario 5 — Un processus est bloqué

1. Identifier : une application ne répond plus (icône grisée).
2. Reproduire : redémarrer l'application reproduit-il le blocage ?
3. Collecter : `Get-Process -Name X` (chapitre 17) — consommation CPU/mémoire anormale ?
4. Hypothèse : boucle infinie (rappel du piège du chapitre 15) ou attente réseau qui ne se termine jamais.
5. Tester : attendre 30 secondes de plus pour écarter une simple lenteur.
6. Corriger : `Stop-Process -Name X -Force`.
7. Vérifier : le processus a disparu de `Get-Process`, l'application relancée fonctionne normalement.
8. Documenter : si récurrent, chercher la cause dans les logs de l'application elle-même.

### Scénario 6 — Un port semble fermé

1. Identifier : une application cliente ne peut pas se connecter à un serveur.
2. Reproduire : depuis une seule machine cliente, ou toutes ?
3. Collecter : `Test-NetConnection -ComputerName X -Port 443` (chapitre 20) — quel est le résultat exact ?
4. Hypothèse : service arrêté côté serveur, ou règle de pare-feu bloquante (chapitre 22).
5. Tester : `Get-NetFirewallRule` sur le serveur, et `Get-Service` pour l'application censée écouter sur ce port.
6. Corriger : démarrer le service manquant, ou `New-NetFirewallRule` pour autoriser le port.
7. Vérifier : `Test-NetConnection -Port` réussit désormais depuis la machine cliente.
8. Documenter : ajouter la règle de pare-feu à la configuration standard du serveur.

### Scénario 7 — Une API est inaccessible

1. Identifier : `Invoke-RestMethod` (chapitre 21) lève une exception.
2. Reproduire : à chaque appel, ou intermittent ?
3. Collecter : le code de statut HTTP exact dans l'exception (`$_.Exception.Response.StatusCode`).
4. Hypothèse : `401` = jeton expiré ; `404` = mauvaise URL ; `500` = problème côté serveur ; timeout = réseau (scénario 1).
5. Tester : `Test-NetConnection -ComputerName api.exemple.com -Port 443` pour écarter un problème réseau pur.
6. Corriger : renouveler le jeton, corriger l'URL, ou attendre/signaler côté fournisseur de l'API.
7. Vérifier : l'appel `Invoke-RestMethod` réussit à nouveau, avec le bon code `200`.
8. Documenter : envelopper l'appel dans un `try`/`catch` définitif (section "Démonstration") pour éviter que ça ne casse tout un script à l'avenir.

### Scénario 8 — Un script échoue

1. Identifier : quel message d'erreur exact, sur quelle ligne (`$Error[0].InvocationInfo.Line`) ?
2. Reproduire : le script échoue-t-il en interactif ET en tâche planifiée ?
3. Collecter : ajouter des `Write-Verbose` (section 29.1) autour de la ligne suspecte, relancer avec `-Verbose`.
4. Hypothèse : chemin relatif invalide en tâche planifiée (section 29.2), ou variable vide par erreur de portée (chapitre 13).
5. Tester : remplacer un chemin relatif par `$PSScriptRoot\fichier.txt`.
6. Corriger : appliquer le chemin absolu, ou corriger la portée de la variable en cause.
7. Vérifier : le script s'exécute sans erreur, y compris depuis la tâche planifiée elle-même.
8. Documenter : ajouter ce cas au script comme commentaire, pour la prochaine personne qui le maintient.

### Scénario 9 — Permission refusée

1. Identifier : "Access is denied" sur une opération de fichier ou de service.
2. Reproduire : pour tous les utilisateurs, ou un seul compte ?
3. Collecter : `Get-Acl` (chapitre 22) sur la ressource concernée.
4. Hypothèse : ACL insuffisante, ou action nécessitant une élévation UAC non accordée.
5. Tester : relancer la même commande depuis une session PowerShell "Exécuter en tant qu'administrateur" (chapitre 22).
6. Corriger : `Set-Acl` pour ajuster les droits, ou exécuter le script avec les droits appropriés.
7. Vérifier : l'opération réussit sans erreur de permission.
8. Documenter : consigner pourquoi ce droit a été accordé, à qui, pour un audit ultérieur.

### Scénario 10 — Docker ne démarre pas

1. Identifier : `docker ps` échoue, message "Docker Desktop is not running" ou similaire.
2. Reproduire : après un redémarrage complet de la machine, le problème persiste-t-il ?
3. Collecter : `Get-Service -Name com.docker.service` (chapitre 18) — le service sous-jacent tourne-t-il ?
4. Hypothèse : service Docker arrêté, ou virtualisation désactivée dans le BIOS.
5. Tester : `Start-Service -Name com.docker.service`, puis retenter `docker ps`.
6. Corriger : démarrer le service, ou activer la virtualisation matérielle si elle est en cause (rare, mais possible après une mise à jour BIOS).
7. Vérifier : `docker ps` répond normalement, un conteneur de test démarre.
8. Documenter : configurer le service Docker en démarrage automatique pour éviter la récurrence.

## Tableau récapitulatif : symptôme → cause probable

| Symptôme | Cause probable |
|---|---|
| `catch` ne s'exécute jamais | Oubli de `-ErrorAction Stop` sur la commande en erreur |
| `-Verbose` n'affiche rien | Fonction sans `[CmdletBinding()]` (chapitre 16) |
| Variable vide/inattendue | Portée (scope) incorrecte (chapitre 13) |
| Script "ne fait rien" en tâche planifiée | Chemin relatif utilisé au lieu d'un chemin absolu |
| Erreur "Access is denied" en récursif | Oubli de `-ErrorAction SilentlyContinue` sur des dossiers protégés |
| Ping réussi mais application inaccessible | Le service applicatif ne répond pas sur son port (chapitre 20) |

## Bonnes pratiques

- Toujours `-ErrorAction Stop` sur toute commande dont l'échec doit être intercepté par `catch`.
- Utiliser `$PSScriptRoot` plutôt que des chemins relatifs dans tout script destiné à s'exécuter hors session interactive.
- Suivre les 8 étapes dans l'ordre, sans sauter la collecte d'informations pour "gagner du temps" — c'est presque toujours ce qui fait perdre le plus de temps au final.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 29.1</span>

Écris une fonction qui tente de lire un fichier et retourne un message d'erreur clair (via `try`/`catch`) s'il n'existe pas, plutôt que de laisser remonter l'exception brute.
</div>

**✅ Correction.**
```powershell
function Read-FichierSecurise {
    param([string]$Chemin)
    try {
        Get-Content -Path $Chemin -ErrorAction Stop
    } catch {
        Write-Output "Erreur : le fichier '$Chemin' est introuvable ou inaccessible."
    }
}
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 29.2</span>

En suivant la méthode en 8 étapes, décris comment tu diagnostiquerais "le site web de l'entreprise est lent pour tout le monde depuis ce matin", sans encore savoir la cause.
</div>

**✅ Correction.** (1) Identifier : lent pour qui, depuis quand précisément, "lent" = combien de secondes. (2) Reproduire : `Measure-Command { Invoke-WebRequest -Uri "https://monsite.com" }` plusieurs fois. (3) Collecter : `Get-Process` sur le serveur (CPU/RAM anormaux ?), `Get-CimInstance Win32_LogicalDisk` (disque plein ?). (4) Hypothèse : pic de trafic, requête base de données lente, ou service saturé. (5) Tester : isoler si le ralentissement est réseau (scénario 1) ou applicatif (charge serveur). (6) Corriger selon la cause confirmée. (7) Vérifier : le temps de réponse redevient normal. (8) Documenter l'incident et sa cause pour le prochain "c'est lent".

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 29.3</span>

Un script planifié pour s'exécuter chaque nuit "ne fait rien" depuis une semaine, sans erreur visible dans les logs Windows. En appliquant la méthode et les scénarios de ce chapitre, propose une démarche de diagnostic complète.
</div>

**✅ Correction du défi.** (1) Identifier : "ne fait rien" précisément — le fichier de sortie attendu n'existe pas ? (2) Reproduire : `Start-ScheduledTask` manuellement (chapitre 23), observer le résultat immédiat plutôt que d'attendre la nuit suivante. (3) Collecter : `Get-ScheduledTaskInfo` pour voir `LastTaskResult` (un code différent de 0 indique un échec silencieux). (4) Hypothèse la plus probable, vu le scénario 8 : chemin relatif invalide dans le contexte d'exécution de la tâche planifiée (répertoire de travail différent de la session interactive). (5) Tester : ajouter `Write-Verbose "Répertoire courant : $(Get-Location)"` en tête de script, réexécuter via `Start-ScheduledTask`. (6) Corriger : remplacer tout chemin relatif par `$PSScriptRoot\...`. (7) Vérifier : la tâche produit enfin le résultat attendu, à la fois manuellement et au déclenchement planifié réel. (8) Documenter la cause dans le script lui-même, en commentaire.

## 🎯 Ce que tu sais maintenant

- La méthode en 8 étapes (identifier, reproduire, collecter, formuler une hypothèse, tester, corriger, vérifier, documenter) s'applique à toute panne, du réseau à un script.
- `try`/`catch`/`finally` avec `-ErrorAction Stop` structure la gestion d'erreurs ; `$Error[0]` conserve l'historique de la session.
- Dix scénarios de panne réels (réseau, DNS, service, disque, processus, port, API, script, permission, Docker) se résolvent tous avec les outils déjà appris dans ce manuel.

*Ceci clôt la Partie 21. Chapitre suivant : dix projets complets, du plus simple au plus avancé.*
