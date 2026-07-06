<div class="chapitre-titre-num">CHAPITRE 14</div>

# Windows Server

## Objectifs pédagogiques

Déployer Active Directory, DNS et DHCP sur Windows Server, appliquer des GPO, configurer un serveur de fichiers et d'impression, et virtualiser avec Hyper-V.

## Prérequis

Chapitres 1-13.

## 14.1 Active Directory Domain Services (AD DS)

<div class="encadre astuce">
<span class="encadre-titre">💡 Active Directory centralise l'authentification et les autorisations de tout le parc informatique</span>
Rappel direct du chapitre 21 du manuel Windows Terminal/PowerShell de cette même collection : AD DS structure les comptes utilisateurs, groupes, ordinateurs et politiques en un annuaire hiérarchique unique (domaine, unités d'organisation), consulté par chaque poste du réseau à chaque authentification.
</div>

```powershell
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName "entreprise.local" -DomainNetbiosName "ENTREPRISE"
```

Structure type d'unités d'organisation (OU) pour un projet d'entreprise :

```
entreprise.local
├── OU=Direction
├── OU=Comptabilite
├── OU=RH
├── OU=IT
│   ├── OU=Serveurs
│   └── OU=Postes-Admin
├── OU=Postes-Utilisateurs
└── OU=Groupes
```

## 14.2 DNS sur Windows Server

```powershell
Install-WindowsFeature -Name DNS -IncludeManagementTools
Add-DnsServerPrimaryZone -Name "entreprise.local" -ReplicationScope "Forest"
Add-DnsServerResourceRecordA -ZoneName "entreprise.local" -Name "intranet" -IPv4Address "10.10.60.10"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le rôle DNS est systématiquement installé aux côtés d'AD DS</span>
Active Directory dépend intégralement de DNS pour la localisation des contrôleurs de domaine et des services (enregistrements SRV) — les deux rôles sont installés ensemble par défaut lors de la promotion d'un premier contrôleur de domaine.
</div>

## 14.3 DHCP sur Windows Server

```powershell
Install-WindowsFeature -Name DHCP -IncludeManagementTools
Add-DhcpServerv4Scope -Name "Bureautique-VLAN20" -StartRange 10.10.20.10 -EndRange 10.10.20.250 -SubnetMask 255.255.254.0
Set-DhcpServerv4OptionValue -ScopeId 10.10.20.0 -DnsServer 10.10.60.10 -Router 10.10.20.1
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Prévoir une redondance DHCP sur les sites critiques</span>
Un serveur DHCP unique constitue un point de défaillance unique : sa panne empêche tout nouveau poste ou renouvellement de bail d'obtenir une adresse IP — la fonctionnalité **DHCP Failover** (deux serveurs se répartissant ou se secourant mutuellement le même périmètre d'adresses) doit être envisagée sur les sites critiques (chapitre 28, hôpital ; chapitre 30, banque).
</div>

## 14.4 GPO (Group Policy Objects)

<div class="encadre astuce">
<span class="encadre-titre">💡 Les GPO appliquent automatiquement des configurations à des groupes d'utilisateurs ou d'ordinateurs</span>
Une politique de mot de passe complexe, un fond d'écran imposé, un lecteur réseau monté automatiquement, ou une restriction d'exécution de logiciels non autorisés se déploient via GPO liée à une OU (section 14.1), sans intervention manuelle poste par poste.
</div>

```powershell
New-GPO -Name "Politique-Mot-De-Passe-Strict" | New-GPLink -Target "OU=Postes-Utilisateurs,DC=entreprise,DC=local"
Set-ADDefaultDomainPasswordPolicy -Identity "entreprise.local" -MinPasswordLength 12 -ComplexityEnabled $true -LockoutThreshold 5
```

Exemples de GPO fréquentes en entreprise :

- Verrouillage de session automatique après inactivité.
- Restriction d'installation de logiciels non approuvés.
- Redirection des dossiers utilisateurs (Documents) vers le serveur de fichiers.
- Déploiement automatique d'imprimantes réseau par service/OU.

## 14.5 Serveur de fichiers

```powershell
Install-WindowsFeature -Name FS-FileServer
New-SmbShare -Name "Comptabilite" -Path "D:\Partages\Comptabilite" -FullAccess "ENTREPRISE\Comptabilite-Admins" -ChangeAccess "ENTREPRISE\Comptabilite-Users"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours combiner permissions NTFS et permissions de partage</span>
Rappel du chapitre 22 du manuel Windows Terminal/PowerShell : les permissions de partage (SMB) et les permissions NTFS s'appliquent **cumulativement**, la restriction la plus stricte des deux prévalant — une erreur fréquente consiste à ouvrir largement le partage SMB en pensant que les permissions NTFS suffiront seules à restreindre l'accès, ou inversement.
</div>

## 14.6 Serveur d'impression

```powershell
Install-WindowsFeature -Name Print-Server
Add-Printer -Name "Imprimante-Comptabilite" -DriverName "HP Universal Printing PCL 6" -PortName "10.10.20.50"
```

Le déploiement automatique d'imprimantes via GPO (section 14.4), filtré par OU, évite l'installation manuelle poste par poste et centralise la gestion des pilotes.

## 14.7 Hyper-V (virtualisation)

<div class="encadre astuce">
<span class="encadre-titre">💡 Hyper-V virtualise plusieurs serveurs logiques sur un seul serveur physique</span>
La virtualisation optimise l'utilisation des ressources matérielles (un serveur physique puissant hébergeant AD, DNS, DHCP et serveur de fichiers comme machines virtuelles distinctes) et facilite la sauvegarde, la migration et la haute disponibilité — approfondie dans le contexte datacenter au chapitre 36.
</div>

```powershell
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
New-VM -Name "SRV-AD-01" -MemoryStartupBytes 4GB -Generation 2 -NewVHDPath "D:\VMs\SRV-AD-01.vhdx" -NewVHDSizeBytes 60GB
Set-VMProcessor -VMName "SRV-AD-01" -Count 2
Start-VM -Name "SRV-AD-01"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ne jamais virtualiser tous les contrôleurs de domaine sur le même hôte physique</span>
Si l'unique hôte Hyper-V hébergeant tous les contrôleurs de domaine tombe en panne, l'authentification de l'ensemble du réseau s'arrête — répartir les contrôleurs de domaine (au moins deux) sur des hôtes physiques distincts, ou en garder un physique dédié sur les sites les plus critiques (chapitre 30, 36).
</div>

## 14.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Créer des GPO trop nombreuses et redondantes sans documentation</span>
Un empilement de dizaines de GPO non documentées, parfois contradictoires, rend le comportement final d'un poste imprévisible et très difficile à diagnostiquer — documenter chaque GPO (objectif, OU ciblée, date de création) dans le dossier d'exploitation (chapitre 25).
</div>

## 14.9 Bonnes pratiques

- Toujours déployer au moins deux contrôleurs de domaine sur des hôtes physiques distincts pour la redondance.
- Documenter systématiquement la structure des OU et les GPO appliquées.
- Activer le DHCP Failover sur les sites critiques.

## 14.10 Résumé du chapitre

- Active Directory, DNS et DHCP forment le socle des services d'infrastructure Windows Server, généralement co-localisés.
- Les GPO automatisent la configuration de sécurité et d'environnement des postes, appliquées par OU.
- Hyper-V virtualise plusieurs rôles serveur sur un matériel physique mutualisé, avec une vigilance particulière sur la répartition des contrôleurs de domaine.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Proposez une politique de mot de passe GPO conforme aux bonnes pratiques actuelles (longueur minimale, complexité, verrouillage après tentatives échouées).
</div>

**Corrigé :**
```powershell
Set-ADDefaultDomainPasswordPolicy -Identity "entreprise.local" `
    -MinPasswordLength 12 -ComplexityEnabled $true `
    -LockoutThreshold 5 -LockoutDuration 00:30:00
```

*Chapitre suivant : les serveurs Linux (Samba, NFS, SSH, Apache/Nginx, Docker).*
