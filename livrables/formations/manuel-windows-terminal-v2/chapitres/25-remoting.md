<div class="chapitre-titre-num">CHAPITRE 25</div>

# Administrer une machine à distance

## 🎯 Objectifs

Comprendre WinRM, exécuter des commandes sur une ou plusieurs machines distantes avec `Invoke-Command`, ouvrir une session interactive avec `Enter-PSSession`, et maintenir une session persistante avec `New-PSSession`.

## Prérequis

Chapitres 3 (OpenSSH), 17-24.

## 🧠 Comprendre : administrer sans se déplacer

**Le problème.** Un administrateur système gère rarement une seule machine : il doit souvent exécuter la même vérification, ou le même correctif, sur des dizaines de serveurs. S'y connecter physiquement ou même via le Bureau à distance, un par un, ne passe pas à l'échelle.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
**PowerShell Remoting** est un talkie-walkie professionnel : au lieu de te déplacer jusqu'à chaque cuisine (chapitre 1) pour donner un ordre, tu le transmets directement, et chaque cuisine distante l'exécute et te renvoie le résultat.
</div>

## 💻 Démonstration : activer et vérifier le remoting

```powershell
Enable-PSRemoting -Force     ← a executer SUR la machine distante, une seule fois
Test-WSMan -ComputerName "SERVEUR01"    ← verifie que le remoting est actif
```

## 🔍 Décortiquons

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : WinRM</span>
**WinRM** (*Windows Remote Management*) est le service Windows qui reçoit et exécute les commandes envoyées à distance par PowerShell Remoting — c'est le protocole de transport, un peu comme SSH (chapitre 3) mais spécifique à l'écosystème Windows/PowerShell. `Enable-PSRemoting` configure ce service sur la machine qui doit **recevoir** des commandes.
</div>

## 25.1 Invoke-Command : exécuter à distance, une seule fois

```powershell
Invoke-Command -ComputerName "SERVEUR01" -ScriptBlock { Get-Service | Where-Object Status -eq "Running" }

Invoke-Command -ComputerName "SERVEUR01", "SERVEUR02" -ScriptBlock { Get-CimInstance Win32_OperatingSystem } -Credential (Get-Credential)
```

`-Credential (Get-Credential)` ouvre une invite sécurisée pour saisir des identifiants — jamais un mot de passe en clair dans le script (rappel du chapitre 22).

## 25.2 Sessions persistantes (PSSession)

```powershell
$session = New-PSSession -ComputerName "SERVEUR01"

Invoke-Command -Session $session -ScriptBlock { $global:compteur = 0 }
Invoke-Command -Session $session -ScriptBlock { $global:compteur++; $global:compteur }   ← etat conserve entre appels !

Enter-PSSession -Session $session    ← bascule en mode interactif, comme un SSH
Exit-PSSession

Remove-PSSession $session
```

<div class="encadre astuce">
<span class="encadre-titre">💡 New-PSSession vs Invoke-Command direct : état conservé ou non</span>
`Invoke-Command -ComputerName X` ouvre et ferme une connexion à **chaque appel** (pas de mémoire entre deux commandes). `New-PSSession` maintient une connexion persistante, dans laquelle des variables ou modules chargés restent disponibles d'un appel à l'autre — utile pour un script complexe en plusieurs étapes sur la même machine distante.
</div>

## 25.3 Exécuter sur plusieurs machines en parallèle

```powershell
$machines = @("SERVEUR01", "SERVEUR02", "SERVEUR03")

Invoke-Command -ComputerName $machines -ScriptBlock {
    Get-CimInstance Win32_OperatingSystem | Select-Object Caption
} -ThrottleLimit 10
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -ThrottleLimit : le même principe qu'au chapitre 15</span>
Exactement comme `ForEach-Object -Parallel`, `Invoke-Command` sur plusieurs machines peut limiter le nombre de connexions simultanées avec `-ThrottleLimit`, évitant de saturer le réseau ou la machine qui pilote l'opération.
</div>

## 25.4 Sécurité du remoting

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le remoting élargit la surface d'attaque : à activer avec discernement</span>
Rappel direct du chapitre 3 (client vs serveur OpenSSH) : activer `Enable-PSRemoting` sur une machine la rend joignable et pilotable à distance — à réserver aux machines qui doivent réellement être administrées ainsi, jamais activé "par défaut" sur un poste utilisateur standard. WinRM utilise HTTPS (port 5986) en environnement sécurisé, HTTP (port 5985) uniquement en réseau de confiance interne.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de fermer une session persistante</span>
Une `PSSession` ouverte via `New-PSSession` consomme des ressources sur la machine distante tant qu'elle n'est pas explicitement fermée (`Remove-PSSession`) ou que la connexion ne timeout — un script qui en ouvre des dizaines sans les fermer peut épuiser les sessions disponibles sur le serveur cible.
</div>

## Bonnes pratiques

- N'activer le remoting que sur les machines qui doivent réellement être administrées à distance.
- Toujours passer par `-Credential (Get-Credential)`, jamais un mot de passe en clair dans le script.
- Fermer proprement (`Remove-PSSession`) toute session distante persistante en fin de script.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Vérifie que le remoting est actif sur une machine `SERVEUR01`, puis récupère la liste de ses services en cours d'exécution.
</div>

**✅ Correction.**
```powershell
Test-WSMan -ComputerName "SERVEUR01"
Invoke-Command -ComputerName "SERVEUR01" -ScriptBlock { Get-Service | Where-Object Status -eq "Running" }
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.2</span>

Récupère la version du système d'exploitation de 3 serveurs en parallèle, avec un maximum de 3 connexions simultanées.
</div>

**✅ Correction.**
```powershell
$machines = @("SERVEUR01", "SERVEUR02", "SERVEUR03")
Invoke-Command -ComputerName $machines -ScriptBlock { (Get-CimInstance Win32_OperatingSystem).Caption } -ThrottleLimit 3
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 25.3</span>

Explique pourquoi ce script est risqué, et corrige-le :
```powershell
$session = New-PSSession -ComputerName "SERVEUR01"
Invoke-Command -Session $session -ScriptBlock { Get-Process }
# fin du script, sans rien d'autre
```
</div>

**✅ Correction du défi.** La session `$session` n'est jamais fermée (section "Attention" ci-dessus) — sur un script exécuté régulièrement (via une tâche planifiée, chapitre 23), les sessions orphelines s'accumulent sur `SERVEUR01`. Correction :
```powershell
$session = New-PSSession -ComputerName "SERVEUR01"
try {
    Invoke-Command -Session $session -ScriptBlock { Get-Process }
} finally {
    Remove-PSSession $session
}
```
`finally` (approfondi au chapitre 29) garantit la fermeture même si le bloc `try` échoue en cours de route.

## 🎯 Ce que tu sais maintenant

- **WinRM** est le service qui reçoit les commandes PowerShell Remoting ; `Enable-PSRemoting` l'active sur la machine cible.
- `Invoke-Command -ComputerName` exécute une commande à distance ponctuellement ; `New-PSSession` maintient une connexion persistante avec état conservé.
- `Enter-PSSession` bascule en mode interactif distant, comme un SSH.
- Toujours fermer (`Remove-PSSession`) une session persistante, idéalement dans un bloc `finally`.

*Chapitre suivant : PowerShell et le Cloud — une introduction pratique à Azure.*
