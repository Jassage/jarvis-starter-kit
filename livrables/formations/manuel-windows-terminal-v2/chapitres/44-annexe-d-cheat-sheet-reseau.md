<div class="chapitre-titre-num">ANNEXE D</div>

# Cheat sheet — 50 commandes réseau

<div class="encadre astuce">
<span class="encadre-titre">💡 Format de cette annexe</span>
Pour chaque commande : son rôle, puis un exemple immédiatement utilisable. Chevauchement volontaire avec les annexes B/C (chapitre 20) — l'objectif est qu'un besoin réseau ponctuel trouve tout au même endroit.
</div>

## Diagnostic de base

- `ipconfig /all` → configuration IP complète → `ipconfig /all`
- `Get-NetIPConfiguration` → équivalent objet, filtrable → `Get-NetIPConfiguration \| Where-Object {$_.NetAdapter.Status -eq "Up"}`
- `Get-NetIPAddress` → liste toutes les adresses IP configurées → `Get-NetIPAddress -AddressFamily IPv4`
- `Get-NetAdapter` → liste les cartes réseau et leur état → `Get-NetAdapter \| Where-Object Status -eq "Up"`
- `Restart-NetAdapter` → redémarre une carte réseau → `Restart-NetAdapter -Name "Ethernet"`
- `ping` → test de connectivité basique (ICMP) → `ping -n 4 google.com`
- `Test-Connection` → équivalent objet de ping → `Test-Connection -ComputerName google.com -Count 4`

## Routage et voisinage

- `tracert` → trace le chemin réseau vers une cible → `tracert google.com`
- `pathping` → tracert + statistiques de perte → `pathping google.com`
- `Test-NetConnection -TraceRoute` → traceroute orienté objet → `Test-NetConnection google.com -TraceRoute`
- `route print` → affiche la table de routage → `route print`
- `Get-NetRoute` → équivalent objet → `Get-NetRoute -DestinationPrefix "0.0.0.0/0"`
- `arp -a` → table ARP locale → `arp -a`
- `Get-NetNeighbor` → équivalent objet → `Get-NetNeighbor \| Where-Object State -eq "Reachable"`

## Ports et connexions

- `Test-NetConnection -Port` → teste un port précis (le plus utile en pratique) → `Test-NetConnection google.com -Port 443`
- `netstat -an` → connexions réseau actives (texte) → `netstat -an \| findstr LISTENING`
- `Get-NetTCPConnection` → équivalent objet → `Get-NetTCPConnection -State Listen`
- `Get-NetTCPConnection -State Established` → connexions actives établies → `Get-NetTCPConnection -State Established`
- `Get-NetUDPEndpoint` → ports UDP en écoute → `Get-NetUDPEndpoint`

## DNS

- `nslookup` → interroge le DNS (texte) → `nslookup google.com`
- `Resolve-DnsName` → équivalent objet → `Resolve-DnsName google.com`
- `Resolve-DnsName -Type MX` → enregistrements mail → `Resolve-DnsName google.com -Type MX`
- `Resolve-DnsName -Server` → interroge un serveur DNS précis → `Resolve-DnsName google.com -Server 8.8.8.8`
- `Clear-DnsClientCache` → vide le cache DNS local → `Clear-DnsClientCache`
- `Get-DnsClientServerAddress` → liste les serveurs DNS configurés → `Get-DnsClientServerAddress`
- `Set-DnsClientServerAddress` → change le serveur DNS d'une interface → `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8`

## Pare-feu (rappel chapitre 22)

- `Get-NetFirewallRule` → liste les règles de pare-feu → `Get-NetFirewallRule \| Where-Object Enabled -eq "True"`
- `New-NetFirewallRule` → crée une règle → `New-NetFirewallRule -DisplayName "API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow`
- `Disable-NetFirewallRule` → désactive une règle sans la supprimer → `Disable-NetFirewallRule -DisplayName "API"`
- `Remove-NetFirewallRule` → supprime une règle → `Remove-NetFirewallRule -DisplayName "API"`

## API et web (rappel chapitre 21)

- `Invoke-WebRequest` → requête HTTP complète (en-têtes, statut, corps brut) → `Invoke-WebRequest -Uri "https://api.exemple.com"`
- `Invoke-RestMethod` → requête HTTP avec JSON déjà parsé → `Invoke-RestMethod -Uri "https://api.exemple.com/utilisateurs"`
- `Invoke-RestMethod -Method Post` → envoyer des données → `Invoke-RestMethod -Uri $url -Method Post -Body $corps -ContentType "application/json"`

## Partage et découverte réseau

- `net view` → liste les ressources partagées visibles → `net view \\SERVEUR01`
- `net use` → connecte un lecteur réseau → `net use Z: \\SERVEUR01\Partage`
- `getmac` → adresse MAC des cartes réseau → `getmac`
- `nbtstat -a` → résolution NetBIOS d'une machine → `nbtstat -a SERVEUR01`

## Remoting (rappel chapitre 25)

- `Enable-PSRemoting` → active WinRM sur la machine → `Enable-PSRemoting -Force`
- `Test-WSMan` → vérifie que le remoting est actif sur une cible → `Test-WSMan -ComputerName SERVEUR01`
- `Invoke-Command` → exécute une commande à distance → `Invoke-Command -ComputerName SERVEUR01 -ScriptBlock { Get-Service }`

## Divers utiles

- `hostname` → nom de la machine locale → `hostname`
- `whoami /all` → identité et groupes de l'utilisateur → `whoami /all`
- `netsh advfirewall show allprofiles` → état détaillé du pare-feu → `netsh advfirewall show allprofiles`
- `netsh wlan show profiles` → réseaux WiFi enregistrés → `netsh wlan show profiles`
- `ncpa.cpl` → ouvre les connexions réseau (interface graphique) → `ncpa.cpl`
- `Set-DnsClient` → configure le suffixe DNS d'une interface → `Set-DnsClient -InterfaceAlias "Ethernet" -ConnectionSpecificSuffix "local"`
- `Get-NetIPInterface` → détails de configuration IP par interface → `Get-NetIPInterface`
- `New-NetIPAddress` → attribue une IP statique → `New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.50 -PrefixLength 24`
- `Remove-NetIPAddress` → retire une IP configurée → `Remove-NetIPAddress -IPAddress 192.168.1.50`
- `Get-NetConnectionProfile` → type de profil réseau (Privé/Public) → `Get-NetConnectionProfile`
- `Set-NetConnectionProfile` → change le profil réseau → `Set-NetConnectionProfile -NetworkCategory Private`
- `Get-NetOffloadGlobalSetting` → paramètres de déchargement réseau matériel → `Get-NetOffloadGlobalSetting`

*Annexe suivante : cheat sheet des 50 commandes d'administration Windows.*
