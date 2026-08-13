<div class="chapitre-titre-num">CHAPITRE 31</div>

# Windows Server de A à Z

## Objectifs pédagogiques

Installer et configurer entièrement un serveur Windows Server : adresse IP statique, promotion en contrôleur de domaine Active Directory, DNS, DHCP, utilisateurs et groupes, une première stratégie de groupe (GPO), un partage de fichiers, et une sauvegarde planifiée.

## Prérequis

Volumes 1-9.

## Scénario du volume

**SRV-01** (Windows Server 2022), adresse statique `10.10.30.10` (VLAN 30, Serveurs — déjà utilisée comme adresse DNS interne dans le plan IP du chapitre 11.2, cohérence directe avec ce chapitre), promu contrôleur de domaine du domaine `entreprise.local`.

## OBJECTIF

Un contrôleur de domaine fonctionnel, servant DNS et DHCP au réseau interne, avec une première organisation d'utilisateurs et de groupes, une GPO appliquée, un partage de fichiers sécurisé et une sauvegarde planifiée.

## ÉTAPE 1 — Installation de base

1. Démarrer sur le support d'installation Windows Server 2022, choisir l'édition **Desktop Experience** (interface graphique conservée — le choix de ce manuel pour rester accessible à un débutant, l'édition **Server Core**, sans interface graphique, étant une option plus légère et plus sécurisée réservée à un technicien déjà à l'aise en PowerShell).
2. Accepter la licence, choisir une installation personnalisée, sélectionner le disque cible.
3. À la fin de l'installation, définir le mot de passe du compte Administrateur local (12 caractères minimum, majuscules/minuscules/chiffres/spécial — la même politique que le reste du portefeuille, chapitre 40).

## ÉTAPE 2 — Adresse IP statique

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell (en administrateur)</div>

```powershell
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.10.30.10 -PrefixLength 27 -DefaultGateway 10.10.30.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1, 10.10.10.2
```

**Explication** : `PrefixLength 27` correspond au `/27` du VLAN Serveurs (chapitre 11.2). Le serveur DNS **principal** pointé vers lui-même (`127.0.0.1`) est volontaire : une fois le rôle DNS installé (étape 4), ce serveur devient sa propre première source de résolution ; le second serveur (`10.10.10.2`, une adresse de management de secours dans cet exemple) sert de repli temporaire avant l'installation du rôle DNS.

## ÉTAPE 3 — Renommer le serveur

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
Rename-Computer -NewName "SRV-01" -Restart
```

## ÉTAPE 4 — Promouvoir le serveur en contrôleur de domaine Active Directory

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell (après redémarrage)</div>

```powershell
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Install-ADDSForest -DomainName "entreprise.local" -DomainNetbiosName "ENTREPRISE" -InstallDns
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le nom de domaine choisi ici doit être cohérent avec le split DNS du chapitre 6.7</span>
`entreprise.local` (avec le suffixe `.local`, jamais un vrai domaine public comme `.com`/`.ht`) est le nom **interne** du domaine Active Directory — totalement distinct du nom de domaine public de l'entreprise (`entreprise.ht`, utilisé pour son site web), exactement la séparation déjà posée au chapitre 6.7 (split DNS). Confondre les deux, ou utiliser le même nom pour les deux usages, est une source de complications reconnues (nécessitant alors un split-brain DNS bien plus délicat à administrer) — évitée d'emblée par ce choix.
</div>

`Install-ADDSForest` redémarre automatiquement le serveur à la fin du processus de promotion.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell (après redémarrage)</div>

```powershell
Get-ADDomain
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
La commande renvoie les informations du domaine `entreprise.local` (nom NetBIOS `ENTREPRISE`, DN `DC=entreprise,DC=local`...) sans erreur — une erreur à ce stade indique que la promotion en contrôleur de domaine (étape 4) a échoué ou n'est pas encore terminée.
</div>

## ÉTAPE 5 — Configurer les redirecteurs DNS (forwarders)

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
Set-DnsServerForwarder -IPAddress 8.8.8.8, 1.1.1.1
```

**Explication** : le rôle DNS installé à l'étape 4 résout nativement tous les noms du domaine interne (`srv-01.entreprise.local`...) — mais pour tout nom **public** (`google.com`...), il doit "rediriger" (forward) la requête vers un serveur DNS public, exactement le principe du split DNS déjà posé au chapitre 6.7 et du choix de DNS de repli du chapitre 11.3.

## ÉTAPE 6 — Installer et configurer le DHCP

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
Install-WindowsFeature DHCP -IncludeManagementTools
Add-DhcpServerV4Scope -Name "VLAN20-Utilisateurs" -StartRange 10.10.20.10 -EndRange 10.10.20.120 -SubnetMask 255.255.255.128
Set-DhcpServerV4OptionValue -ScopeId 10.10.20.0 -Router 10.10.20.1 -DnsServer 10.10.30.10, 8.8.8.8
Add-DhcpServerInDC -DnsName "srv-01.entreprise.local" -IPAddress 10.10.30.10
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un serveur DHCP Windows non autorisé (unauthorized) dans Active Directory ne distribue jamais aucune adresse</span>
La dernière ligne (`Add-DhcpServerInDC`) — l'**autorisation** du serveur DHCP auprès d'Active Directory — est une étape spécifique à l'écosystème Windows Server, distincte de la simple création du scope, et fréquemment oubliée par un débutant : un serveur DHCP Windows non autorisé reste installé et configuré en apparence, mais **refuse silencieusement de répondre** à la moindre requête DHCP tant qu'il n'est pas explicitement autorisé — un scénario de dépannage détaillé au chapitre 45.
</div>

Reprendre la même méthode (`Add-DhcpServerV4Scope` + `Set-DhcpServerV4OptionValue`) pour chacun des autres VLAN nécessitant du DHCP dynamique (chapitre 11.2 : Comptabilité, Wi-Fi Corporate, Wi-Fi Invité), avec les plages exactes déjà documentées dans le plan IP.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
Get-DhcpServerInDC
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`SRV-01.entreprise.local` apparaît dans la liste des serveurs DHCP autorisés — son absence confirme un oubli de l'étape d'autorisation ci-dessus.
</div>

## ÉTAPE 7 — Créer les unités d'organisation, utilisateurs et groupes

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
New-ADOrganizationalUnit -Name "Comptabilite" -Path "DC=entreprise,DC=local"
New-ADGroup -Name "GRP-Comptabilite" -GroupScope Global -Path "OU=Comptabilite,DC=entreprise,DC=local"
New-ADUser -Name "Jean Baptiste" -SamAccountName "jbaptiste" -Path "OU=Comptabilite,DC=entreprise,DC=local" -AccountPassword (ConvertTo-SecureString "MotDePasseInitial2026!" -AsPlainText -Force) -Enabled $true -ChangePasswordAtLogon $true
Add-ADGroupMember -Identity "GRP-Comptabilite" -Members "jbaptiste"
```

**Explication** : `-ChangePasswordAtLogon $true` force l'utilisateur à définir son propre mot de passe à la première connexion — l'administrateur ne connaît alors le mot de passe initial que temporairement, une bonne pratique de sécurité de base.

## ÉTAPE 8 — Créer une première GPO

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
New-GPO -Name "GPO-Verrouillage-Ecran" | New-GPLink -Target "OU=Comptabilite,DC=entreprise,DC=local"
Set-GPRegistryValue -Name "GPO-Verrouillage-Ecran" -Key "HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop" -ValueName "ScreenSaveTimeOut" -Type DWord -Value 600
Set-GPRegistryValue -Name "GPO-Verrouillage-Ecran" -Key "HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop" -ValueName "ScreenSaverIsSecure" -Type DWord -Value 1
```

**Explication** : cette GPO, liée uniquement à l'unité d'organisation Comptabilité (pas à tout le domaine), force un verrouillage d'écran automatique après 10 minutes d'inactivité (600 secondes) — une mesure de sécurité de base ciblée sur un service manipulant des données financières sensibles (chapitre 8.1).

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — PowerShell (depuis un poste membre du domaine, dans l'OU Comptabilité)</div>

```powershell
gpupdate /force
gpresult /r
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`gpresult /r` liste `GPO-Verrouillage-Ecran` parmi les stratégies de groupe appliquées à l'utilisateur — son absence après un `gpupdate /force` indique un problème de lien GPO (vérifier que l'utilisateur de test appartient bien à l'OU Comptabilité) ou de réplication Active Directory encore en cours.
</div>

## ÉTAPE 9 — Créer un partage de fichiers sécurisé

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
New-Item -Path "D:\Partages\Comptabilite" -ItemType Directory
New-SmbShare -Name "Comptabilite" -Path "D:\Partages\Comptabilite" -FullAccess "ENTREPRISE\GRP-Comptabilite"
```

**Explication** : les permissions du partage sont accordées au **groupe** créé à l'étape 7, jamais à un utilisateur individuellement — ajouter ou retirer une personne du groupe met à jour son accès automatiquement, sans jamais devoir toucher aux permissions du dossier lui-même.

## ÉTAPE 10 — Configurer une sauvegarde planifiée

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell</div>

```powershell
Install-WindowsFeature Windows-Server-Backup
$policy = New-WBPolicy
$volume = Get-WBVolume -VolumePath "D:"
Add-WBVolume -Policy $policy -Volume $volume
Set-WBSchedule -Policy $policy -Schedule "23:00"
Set-WBPolicy -Policy $policy
```

La méthode complète de politique de sauvegarde (quoi, où, combien de temps conserver, comment tester une restauration) fait l'objet du chapitre 39 — cette étape installe le mécanisme technique local, pas encore la politique complète.

## DÉPANNAGE

### Si un poste client ne rejoint pas le domaine

Vérifier en priorité que le poste utilise bien `10.10.30.10` (SRV-01) comme serveur DNS — un poste configuré avec un DNS public ne pourra jamais localiser le contrôleur de domaine (les enregistrements de localisation Active Directory sont eux-mêmes des enregistrements DNS internes, chapitre 6.6).

### Si le DHCP ne répond à aucun client malgré un scope actif

Vérifier `Get-DhcpServerInDC` (VÉRIFICATION de l'étape 6) — l'omission de l'autorisation est, de loin, la cause la plus fréquente sur un environnement Windows Server, un scénario détaillé au chapitre 45.

## SAUVEGARDE

Confirmée à l'étape 10 — méthode complète au chapitre 39.

## CHECKLIST DE FIN

- [ ] Adresse IP statique conforme au plan IP du chapitre 11
- [ ] Serveur promu contrôleur de domaine, `Get-ADDomain` fonctionnel
- [ ] Redirecteurs DNS configurés vers des résolveurs publics
- [ ] DHCP installé, scope(s) créé(s), et **autorisé** dans Active Directory
- [ ] Structure d'OU/groupes/utilisateurs créée selon l'organisation réelle du client
- [ ] Au moins une GPO créée, liée et vérifiée fonctionnelle (`gpresult /r`)
- [ ] Partage de fichiers créé avec permissions accordées à un groupe, jamais à un utilisateur individuel
- [ ] Sauvegarde planifiée configurée

## Résumé du chapitre

Un serveur Windows Server se configure dans un ordre précis : adresse statique, renommage, promotion en contrôleur de domaine (avec un nom de domaine interne distinct du domaine public de l'entreprise), redirecteurs DNS, DHCP (avec l'étape d'autorisation Active Directory souvent oubliée), structure d'OU/groupes/utilisateurs, GPO ciblée, partage de fichiers avec permissions par groupe, et sauvegarde planifiée.

*Chapitre suivant : Ubuntu Server de A à Z — installation, SSH, utilisateurs, firewall, services, Nginx et Docker.*
