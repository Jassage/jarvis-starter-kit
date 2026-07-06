<div class="chapitre-titre-num">CHAPITRE 18</div>

# Réseau

## Objectifs pédagogiques

Maîtriser les outils de diagnostic réseau classiques (ipconfig, ping, tracert...) et leurs équivalents PowerShell modernes, consommer des API web (Invoke-RestMethod), et construire ses propres outils réseau.

## Prérequis

Chapitres 9-17.

## 18.1 ipconfig et Get-NetIPConfiguration

```
C:\>ipconfig /all
```

```powershell
PS> Get-NetIPConfiguration
PS> Get-NetIPAddress
PS> Get-NetAdapter
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Get-NetIPConfiguration retourne de VRAIS objets, filtrables directement</span>
```powershell
(Get-NetIPConfiguration | Where-Object { $_.NetAdapter.Status -eq "Up" }).IPv4Address.IPAddress
```
Contrairement à `ipconfig /all` (texte à analyser), la cmdlet PowerShell permet d'extraire directement l'adresse IP de l'interface active, sans aucun `findstr`/regex.
</div>

## 18.2 ping et Test-Connection

```
C:\>ping google.com
C:\>ping -n 10 google.com    ← 10 tentatives au lieu de 4 par défaut
```

```powershell
PS> Test-Connection -ComputerName google.com -Count 4
PS> Test-Connection -ComputerName google.com -Count 1 -Quiet    # retourne juste $true/$false
```

## 18.3 tracert / pathping et Test-NetConnection

```
C:\>tracert google.com
C:\>pathping google.com     ← combine tracert + statistiques de perte de paquets par saut
```

```powershell
PS> Test-NetConnection -ComputerName google.com -TraceRoute
PS> Test-NetConnection -ComputerName google.com -Port 443     # teste un PORT précis (essentiel pour diagnostiquer une API/site)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Test-NetConnection -Port : le diagnostic le plus utile en pratique</span>
Un `ping` réussi ne garantit **pas** qu'un service applicatif (site web, API, base de données) répond sur son port — de nombreux pare-feux bloquent ICMP (ping) tout en laissant passer HTTPS. `Test-NetConnection -ComputerName X -Port 443` est le vrai test à effectuer pour diagnostiquer un problème de connectivité applicative.
</div>

## 18.4 netstat et Get-NetTCPConnection

```
C:\>netstat -an | findstr LISTENING
```

```powershell
PS> Get-NetTCPConnection -State Listen
PS> Get-NetTCPConnection | Where-Object { $_.LocalPort -eq 3000 }
PS> Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort
```

## 18.5 nslookup et Resolve-DnsName

```
C:\>nslookup google.com
```

```powershell
PS> Resolve-DnsName google.com
PS> Resolve-DnsName google.com -Type MX      # enregistrements mail (MX)
PS> Resolve-DnsName google.com -Server 8.8.8.8   # interroge un serveur DNS précis (Google DNS)
```

## 18.6 arp et Get-NetNeighbor

```
C:\>arp -a
```

```powershell
PS> Get-NetNeighbor | Where-Object { $_.State -eq "Reachable" }
```

## 18.7 route et Get-NetRoute

```
C:\>route print
```

```powershell
PS> Get-NetRoute
PS> Get-NetRoute -DestinationPrefix "0.0.0.0/0"    # la route par défaut (passerelle)
```

## 18.8 Invoke-WebRequest et Invoke-RestMethod : consommer des API web

```powershell
$reponse = Invoke-WebRequest -Uri "https://api.github.com/users/octocat"
$reponse.StatusCode      # 200
$reponse.Content          # le corps BRUT (texte JSON non parsé)

$donnees = Invoke-RestMethod -Uri "https://api.github.com/users/octocat"
$donnees.name             # accès DIRECT, le JSON est déjà converti en objet PowerShell !
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Invoke-WebRequest vs Invoke-RestMethod : quand utiliser laquelle</span>
`Invoke-WebRequest` retourne la réponse HTTP **complète** (en-têtes, code de statut, corps brut) — utile pour inspecter une réponse en détail. `Invoke-RestMethod` **parse automatiquement** le JSON/XML en objets PowerShell exploitables directement, idéal pour consommer une API REST (rappel direct des manuels Node.js/React de ce même auteur).
</div>

```powershell
# Requête POST avec un corps JSON, exactement comme depuis une application cliente
$corps = @{ nom = "Jaslin"; email = "jaslin@mail.com" } | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.monapp.com/utilisateurs" -Method Post `
    -Body $corps -ContentType "application/json"
```

```powershell
# Avec authentification par jeton (Bearer), rappel du chapitre JWT des manuels backend
$enTetes = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "https://api.monapp.com/profil" -Headers $enTetes
```

## 18.9 Créer un outil réseau en PowerShell : scanner de ports simple

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

Ce mini-outil est directement repris et enrichi au chapitre 29 (projet "scanner réseau").

## 18.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Interpréter un ping échoué comme "le serveur est down"</span>
De nombreux serveurs et pare-feux bloquent délibérément les requêtes ICMP (ping) pour des raisons de sécurité, tout en étant parfaitement fonctionnels sur leurs vrais services (HTTP, SSH). Toujours confirmer avec `Test-NetConnection -Port` avant de conclure qu'une machine est injoignable.
</div>

## 18.11 Bonnes pratiques

- Préférer `Test-NetConnection -Port` à un simple `ping` pour diagnostiquer un problème applicatif réel.
- Utiliser `Invoke-RestMethod` plutôt que `Invoke-WebRequest` dès que le besoin est de consommer une API JSON/XML, pas d'inspecter la réponse HTTP brute.
- Toujours `-WarningAction SilentlyContinue` sur des tests de port en boucle, pour éviter un bruit d'avertissement par port fermé testé.

## 18.12 Résumé du chapitre

- Chaque commande réseau classique (`ipconfig`, `ping`, `tracert`, `netstat`, `nslookup`, `arp`, `route`) a un équivalent PowerShell orienté objet, filtrable directement.
- `Test-NetConnection -Port` est le vrai outil de diagnostic applicatif, plus fiable qu'un simple ping.
- `Invoke-RestMethod` consomme une API REST en convertissant automatiquement le JSON en objets PowerShell.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Utilise `Invoke-RestMethod` pour récupérer les informations d'un utilisateur GitHub de ton choix, et affiche uniquement son nom et son nombre de dépôts publics.
</div>

**Corrigé :**
```powershell
$utilisateur = Invoke-RestMethod -Uri "https://api.github.com/users/octocat"
[PSCustomObject]@{ Nom = $utilisateur.name; Depots = $utilisateur.public_repos }
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.2 (mini-projet)</span>

Écris une fonction qui teste la connectivité (port 443) de 5 sites web de ton choix, et retourne un tableau avec le site et s'il répond.
</div>

**Corrigé :**
```powershell
$sites = @("google.com", "github.com", "microsoft.com", "openai.com", "wikipedia.org")
$sites | ForEach-Object {
    [PSCustomObject]@{
        Site   = $_
        Actif  = (Test-NetConnection -ComputerName $_ -Port 443 -WarningAction SilentlyContinue).TcpTestSucceeded
    }
}
```

*Chapitre suivant : l'administration Windows (registre, pare-feu, Defender, partages réseau).*
