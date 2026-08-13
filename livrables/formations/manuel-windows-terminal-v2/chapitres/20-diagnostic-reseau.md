<div class="chapitre-titre-num">CHAPITRE 20</div>

# Diagnostic réseau, de ipconfig à Test-NetConnection

## 🎯 Objectifs

Maîtriser les outils de diagnostic réseau classiques (`ipconfig`, `ping`, `tracert`, `netstat`, `nslookup`, `arp`, `route`) et leurs équivalents PowerShell modernes, et raisonner méthodiquement face à un problème de connectivité.

## Prérequis

Chapitre 1 (section 1.8, réseau) et Partie 11.

## 🧠 Comprendre : la chaîne complète, du câble au service

**Le problème.** "Internet ne marche pas" peut avoir dix causes différentes, à des étages complètement différents. Sans méthode, on teste au hasard.

<div class="encadre astuce">
<span class="encadre-titre">💡 La chaîne à connaître par cœur</span>
```{.uml}
Ordinateur
  |
  v
Carte reseau        <- le "cable" (physique ou WiFi) fonctionne-t-il ?
  |
  v
Adresse IP            <- ai-je une adresse valide (pas juste 169.254.x.x) ?
  |
  v
Passerelle             <- puis-je joindre mon routeur local ?
  |
  v
DNS                     <- puis-je TRADUIRE un nom (google.com) en adresse IP ?
  |
  v
Route                   <- Windows sait-il par ou faire sortir le trafic ?
  |
  v
Port                    <- le SERVICE precis (443, 22...) repond-il, au-dela du simple ping ?
  |
  v
Service                 <- l'application elle-meme fonctionne-t-elle (pas juste le reseau) ?
  |
  v
Internet
```
Chaque outil de ce chapitre correspond à **un étage précis** de cette chaîne — diagnostiquer, c'est descendre l'échelle méthodiquement, sans sauter d'étage.
</div>

## 💻 Démonstration : ipconfig

```
ipconfig /all
```

```powershell
Get-NetIPConfiguration
Get-NetIPAddress
Get-NetAdapter
```

## 🔍 Décortiquons

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-NetIPConfiguration retourne de vrais objets, filtrables directement</span>
```powershell
(Get-NetIPConfiguration | Where-Object { $_.NetAdapter.Status -eq "Up" }).IPv4Address.IPAddress
```
Contrairement à `ipconfig /all` (texte à analyser), la cmdlet PowerShell permet d'extraire directement l'adresse IP de l'interface active, sans aucun `findstr`/regex — application directe du chapitre 12.
</div>

## 20.1 ping et Test-Connection : la carte réseau et la passerelle

```
ping google.com
ping -n 10 google.com    ← 10 tentatives au lieu de 4 par defaut
```

```powershell
Test-Connection -ComputerName google.com -Count 4
Test-Connection -ComputerName google.com -Count 1 -Quiet    ← retourne juste $true/$false
```

## 20.2 tracert / pathping et Test-NetConnection : la route et le port

```
tracert google.com
pathping google.com     ← combine tracert + statistiques de perte de paquets par saut
```

```powershell
Test-NetConnection -ComputerName google.com -TraceRoute
Test-NetConnection -ComputerName google.com -Port 443     ← teste un PORT precis
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Test-NetConnection -Port : le diagnostic le plus utile en pratique</span>
Un `ping` réussi ne garantit **pas** qu'un service applicatif (site web, API, base de données) répond sur son port — de nombreux pare-feux bloquent ICMP (ping) tout en laissant passer HTTPS. `Test-NetConnection -ComputerName X -Port 443` est le vrai test à effectuer pour diagnostiquer un problème de connectivité applicative — c'est la différence entre l'étage "Route" et l'étage "Port" du schéma ci-dessus.
</div>

## 20.3 netstat et Get-NetTCPConnection : qui écoute, qui est connecté

```
netstat -an | findstr LISTENING
```

```powershell
Get-NetTCPConnection -State Listen
Get-NetTCPConnection | Where-Object { $_.LocalPort -eq 3000 }
Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort
```

## 20.4 nslookup et Resolve-DnsName : la traduction de noms

```
nslookup google.com
```

```powershell
Resolve-DnsName google.com
Resolve-DnsName google.com -Type MX      ← enregistrements mail (MX)
Resolve-DnsName google.com -Server 8.8.8.8   ← interroge un serveur DNS precis (Google DNS)
```

## 20.5 arp et Get-NetNeighbor

```
arp -a
```

```powershell
Get-NetNeighbor | Where-Object { $_.State -eq "Reachable" }
```

## 20.6 route et Get-NetRoute

```
route print
```

```powershell
Get-NetRoute
Get-NetRoute -DestinationPrefix "0.0.0.0/0"    ← la route par defaut (passerelle)
```

## 20.7 Construire un scanner de ports simple

```powershell
function Test-PortsOuverts {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ComputerName,

        [int[]]$Ports = @(80, 443, 22, 3389, 3306, 5432)
    )

    foreach ($port in $Ports) {
        $resultat = Test-NetConnection -ComputerName $ComputerName -Port $port -WarningAction SilentlyContinue
        [PSCustomObject]@{
            Machine = $ComputerName
            Port    = $port
            Ouvert  = $resultat.TcpTestSucceeded
        }
    }
}

Test-PortsOuverts -ComputerName "monserveur.com" -Ports 80,443,22
```

Ce mini-outil est directement repris et enrichi au chapitre 34 (Projet 5 — Scanner de ports pédagogique).

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Interpréter un ping échoué comme "le serveur est down"</span>
De nombreux serveurs et pare-feux bloquent délibérément les requêtes ICMP (ping) pour des raisons de sécurité, tout en étant parfaitement fonctionnels sur leurs vrais services (HTTP, SSH). Toujours confirmer avec `Test-NetConnection -Port` avant de conclure qu'une machine est injoignable — c'est précisément l'étage "Port" contre l'étage "Route" de la chaîne présentée en introduction.
</div>

## Tableau récapitulatif : CMD → PowerShell

| CMD | PowerShell |
|---|---|
| `ipconfig /all` | `Get-NetIPConfiguration` |
| `ping` | `Test-Connection` |
| `tracert` | `Test-NetConnection -TraceRoute` |
| `pathping` | (pas d'équivalent direct objet) |
| `netstat -an` | `Get-NetTCPConnection` |
| `nslookup` | `Resolve-DnsName` |
| `arp -a` | `Get-NetNeighbor` |
| `route print` | `Get-NetRoute` |

## Bonnes pratiques

- Toujours suivre la chaîne carte réseau → IP → passerelle → DNS → route → port → service, dans l'ordre, plutôt que tester au hasard.
- Préférer `Test-NetConnection -Port` à un simple `ping` pour diagnostiquer un problème applicatif réel.
- `-WarningAction SilentlyContinue` sur des tests de port en boucle, pour éviter un bruit d'avertissement par port fermé testé.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Détermine, avec PowerShell uniquement, l'adresse IP de ta machine sur l'interface actuellement active.
</div>

**✅ Correction.**
```powershell
(Get-NetIPConfiguration | Where-Object { $_.NetAdapter.Status -eq "Up" }).IPv4Address.IPAddress
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.2</span>

Sans utiliser `ping`, détermine si un serveur web répond réellement sur le port 443 (HTTPS), pour trois sites de ton choix.
</div>

**✅ Correction.**
```powershell
$sites = @("google.com", "github.com", "wikipedia.org")
$sites | ForEach-Object {
    [PSCustomObject]@{
        Site  = $_
        Actif = (Test-NetConnection -ComputerName $_ -Port 443 -WarningAction SilentlyContinue).TcpTestSucceeded
    }
}
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 20.3</span>

Un site web est injoignable dans le navigateur. `ping monsite.com` répond correctement. En suivant la chaîne de ce chapitre, propose les deux prochains tests à effectuer, dans l'ordre, avant de conclure quoi que ce soit.
</div>

**✅ Correction du défi.** Un ping réussi confirme seulement les étages "carte réseau" à "route" (voire simplement que ICMP passe). Les deux tests suivants logiques : (1) `Resolve-DnsName monsite.com` pour confirmer que le nom se résout vers la bonne IP, (2) `Test-NetConnection -ComputerName monsite.com -Port 443` pour vérifier que le **service** HTTPS répond réellement, pas seulement le réseau — reprenant exactement l'avertissement de la section 20.2/erreur fréquente.

## 🎯 Ce que tu sais maintenant

- Chaque commande réseau classique a un équivalent PowerShell orienté objet, filtrable directement.
- La chaîne carte réseau → IP → passerelle → DNS → route → port → service structure tout diagnostic réseau méthodique.
- `Test-NetConnection -Port` est le vrai outil de diagnostic applicatif, plus fiable qu'un simple ping.

*Chapitre suivant : consommer une API REST avec PowerShell.*
