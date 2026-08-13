<div class="chapitre-titre-num">CHAPITRE 41</div>

# La méthode de diagnostic experte

## Objectifs pédagogiques

Apprendre à raisonner méthodiquement face à une panne réseau — en entonnoir, du plus local au plus distant — plutôt que de changer des configurations au hasard, et maîtriser les commandes de diagnostic Windows, PowerShell et Linux avec leur interprétation exacte.

## Prérequis

Volumes 1-13.

## 41.1 Le principe : diagnostiquer avant de corriger

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais changer une configuration avant d'avoir identifié la cause réelle</span>
Face à "le PC n'a pas Internet", le réflexe d'un débutant est souvent de modifier immédiatement une configuration (changer l'adresse IP, redémarrer un équipement au hasard) en espérant que "ça règle le problème". Cette approche peut, par accident, sembler fonctionner (un redémarrage résout parfois un problème transitoire) sans jamais confirmer la cause réelle — le même problème réapparaît alors plus tard, sans qu'aucune leçon n'ait été tirée. Un expert diagnostique **toujours** avant de corriger : chaque étape ci-dessous confirme ou élimine une cause possible, une par une, jusqu'à isoler la cause réelle avec certitude.
</div>

## 41.2 La méthode en entonnoir : du plus local au plus distant

Face à "le PC n'a pas Internet", dérouler systématiquement ces dix questions, dans cet ordre, sans en sauter aucune :

```
1. Le cable est-il connecte ?
2. La carte reseau fonctionne-t-elle ?
3. Le PC possede-t-il une IP ?
4. L'IP est-elle correcte (pas une IP APIPA 169.254.x.x, chapitre 4.2) ?
5. Le PC possede-t-il une passerelle (gateway) ?
6. La passerelle repond-elle (ping) ?
7. Le DNS fonctionne-t-il (resolution de nom) ?
8. Une adresse IP Internet publique repond-elle (ping direct, sans DNS) ?
9. Le firewall bloque-t-il ce trafic precis ?
10. Le probleme est-il local (un seul poste) ou global (tout le reseau) ?
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi cet ordre précis, et pas un autre</span>
Chaque question ne devient pertinente **qu'une fois** la précédente confirmée — inutile de tester le DNS (question 7) si le PC n'a même pas d'adresse IP valide (question 3-4) : la panne serait alors bien plus fondamentale, et le test DNS échouerait de toute façon pour une raison qui n'a rien à voir avec le DNS lui-même. Cette progression du plus local (le câble, à portée de main) vers le plus distant (Internet, hors de tout contrôle direct) élimine systématiquement les causes les plus simples et les plus rapides à vérifier avant d'envisager les causes plus complexes.
</div>

## 41.3 Commandes de diagnostic — Windows (invite de commandes classique)

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — CMD</div>

```
ipconfig /all
```

**Interprétation** : affiche l'adresse IP, le masque, la passerelle, les serveurs DNS et le serveur DHCP de chaque interface — répond directement aux questions 3, 4, 5 et partiellement 7 de la méthode ci-dessus.

```
ping 10.10.20.1
```

**Interprétation** : `Réponse de 10.10.20.1 : octets=32 temps<1ms TTL=255` confirme la joignabilité de la passerelle (question 6) ; `Délai d'attente de la demande dépassé` indique une passerelle injoignable — cause à investiguer côté réseau, pas côté PC.

```
tracert 8.8.8.8
```

**Interprétation** : liste chaque routeur traversé jusqu'à la destination — le dernier saut qui répond avant une série de `*` (timeout) situe approximativement où le trafic cesse de progresser (utile pour la question 10 : un tracert qui échoue dès le premier saut, la passerelle locale, pointe vers une cause locale ; un tracert qui progresse loin avant d'échouer pointe vers une cause plus distante, hors du contrôle direct du technicien).

```
nslookup entreprise.local
```

**Interprétation** : confirme ou infirme la résolution DNS (question 7) — une erreur `Impossible de trouver le serveur` indique un problème de DNS, distinct d'un problème de connectivité IP pure.

## 41.4 Commandes de diagnostic — PowerShell

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — PowerShell</div>

```powershell
Get-NetIPConfiguration
```

**Interprétation** : équivalent moderne et plus lisible d'`ipconfig`, avec en plus l'état explicite de chaque interface (`Connected`/`Disconnected`) — répond à la question 1-2 en un coup d'œil.

```powershell
Test-Connection 10.10.20.1 -Count 4
```

**Interprétation** : équivalent PowerShell de `ping`, avec une sortie structurée (objets, exploitable dans un script de diagnostic automatisé plutôt qu'un simple texte).

```powershell
Test-NetConnection 8.8.8.8 -Port 443
```

**Interprétation** : au-delà d'un simple ping, teste qu'un **port TCP précis** est joignable — `TcpTestSucceeded : True` confirme qu'un service spécifique répond (utile pour la question 9 : un ping ICMP peut réussir alors qu'un port applicatif précis reste bloqué par un firewall, et inversement).

```powershell
Resolve-DnsName entreprise.local
```

**Interprétation** : équivalent PowerShell de `nslookup`, avec le détail des enregistrements DNS retournés (chapitre 6.6).

## 41.5 Commandes de diagnostic — Linux

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
ip addr
```

**Interprétation** : liste les interfaces et leurs adresses IP — `state UP` confirme l'interface active (question 1-2), une absence d'adresse IPv4 confirme un problème d'attribution (question 3).

```bash
ip route
```

**Interprétation** : affiche la table de routage — l'absence d'une ligne `default via ...` confirme l'absence de passerelle configurée (question 5).

```bash
ping -c 4 10.10.30.1
traceroute 8.8.8.8
```

**Interprétation** : équivalents directs de `ping`/`tracert` Windows (41.3).

```bash
dig entreprise.local
```

**Interprétation** : équivalent Linux de `nslookup`, avec un détail plus complet de la réponse DNS (temps de réponse, serveur interrogé, TTL de l'enregistrement).

```bash
ss -tulnp
```

**Interprétation** : liste les ports en écoute sur la machine locale — confirme qu'un service attendu (par exemple Nginx sur le port 80, chapitre 32) est bien actif et à l'écoute, une vérification locale avant de suspecter un problème réseau externe pour un service qui, en réalité, ne tourne peut-être même pas.

## 41.6 Exemple complet déroulé de bout en bout

**Symptôme signalé** : "Mon PC n'a pas Internet."

1. **Câble connecté ?** → Voyants du port switch vérifiés allumés (chapitre 20) — oui.
2. **Carte réseau active ?** → `Get-NetIPConfiguration` affiche l'interface `Connected` — oui.
3. **Le PC possède-t-il une IP ?** → `ipconfig /all` affiche `169.254.87.23` — **anomalie détectée** (adresse APIPA, chapitre 4.2), signe que le PC n'a reçu aucune réponse DHCP valide.
4. **Cause immédiatement suspectée** : un problème DHCP, pas un problème de câble ni de carte réseau (déjà éliminés aux étapes 1-2) — inutile de poursuivre vers les questions 5 à 10 tant que cette adresse anormale n'est pas corrigée, la méthode s'arrête ici pour investiguer précisément le DHCP (scénario détaillé au chapitre 42, "PC avec mauvaise IP").

Cet exemple illustre l'esprit de la méthode : **chaque étape confirmée élimine une catégorie entière de causes possibles**, concentrant rapidement l'investigation sur la cause réelle plutôt que de tester au hasard.

## 41.7 Comment utiliser les chapitres suivants

Les 50 scénarios des chapitres 42 à 46 appliquent systématiquement cette méthode à un cas précis, avec la structure suivante :

```
SYMPTOME → CAUSES POSSIBLES → TEST 1 → RESULTAT → TEST 2 → RESULTAT → DIAGNOSTIC → CORRECTION → VERIFICATION → PREVENTION
```

## Résumé du chapitre

Face à toute panne, la méthode experte procède en entonnoir, du plus local (câble, carte réseau) au plus distant (Internet), sans jamais sauter une étape ni corriger avant d'avoir confirmé une cause précise. Les commandes Windows (`ipconfig`, `ping`, `tracert`, `nslookup`), PowerShell (`Get-NetIPConfiguration`, `Test-Connection`, `Test-NetConnection`, `Resolve-DnsName`) et Linux (`ip addr`, `ip route`, `ping`, `traceroute`, `dig`, `ss`) répondent chacune à une ou plusieurs des dix questions de la méthode — leur interprétation exacte, pas seulement leur exécution, est ce qui distingue un diagnostic efficace d'une manipulation à l'aveugle.

*Chapitre suivant : les 10 premiers scénarios de dépannage — réseau de base (IP, DHCP, DNS, Internet).*
