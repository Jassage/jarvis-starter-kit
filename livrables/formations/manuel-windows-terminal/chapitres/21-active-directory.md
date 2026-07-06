<div class="chapitre-titre-num">CHAPITRE 21</div>

# Introduction à Active Directory

## Objectifs pédagogiques

Comprendre le rôle d'Active Directory dans un environnement d'entreprise, et utiliser le module PowerShell `ActiveDirectory` pour consulter et administrer utilisateurs, groupes et unités d'organisation.

## Prérequis

Chapitres 9-20, notamment la gestion des utilisateurs locaux (chapitre 16).

## 21.1 Qu'est-ce qu'Active Directory ?

<div class="encadre astuce">
<span class="encadre-titre">💡 Active Directory : la version "entreprise" des comptes locaux du chapitre 16</span>
Là où `New-LocalUser` (chapitre 16) crée un compte propre à **une seule** machine, Active Directory (AD) centralise l'authentification et les autorisations pour un **domaine entier** — des centaines ou milliers de machines partagent le même annuaire d'utilisateurs, groupes et politiques, gérées depuis un serveur appelé contrôleur de domaine (Domain Controller).
</div>

Concepts clés :

| Terme | Signification |
|---|---|
| Domaine | Frontière administrative regroupant machines et comptes (ex : `entreprise.local`) |
| Contrôleur de domaine (DC) | Serveur hébergeant l'annuaire AD et validant les authentifications |
| Unité d'organisation (OU) | Dossier logique regroupant utilisateurs/machines/groupes (ex : "Comptabilité") |
| GPO (Group Policy Object) | Ensemble de règles appliquées automatiquement à une OU (mot de passe, restrictions...) |
| Forêt / Arborescence | Regroupement de plusieurs domaines liés entre eux |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ce chapitre nécessite un contrôleur de domaine pour être pratiqué réellement</span>
Les commandes de ce chapitre s'exécutent depuis une machine membre du domaine (ou le contrôleur lui-même), avec le module `ActiveDirectory` installé (RSAT — Remote Server Administration Tools). Sans accès à un domaine AD, ces commandes sont à étudier théoriquement ; un labo de test peut être monté avec une VM Windows Server + `Install-WindowsFeature AD-Domain-Services`.
</div>

## 21.2 Installer le module ActiveDirectory (RSAT)

```powershell
Get-WindowsCapability -Name "RSAT.ActiveDirectory*" -Online | Add-WindowsCapability -Online
Import-Module ActiveDirectory
```

## 21.3 Consulter des utilisateurs AD

```powershell
Get-ADUser -Filter *
Get-ADUser -Identity "jaslin.occius"
Get-ADUser -Filter "Department -eq 'Comptabilite'"

Get-ADUser -Identity "jaslin.occius" -Properties EmailAddress, Department, Title
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -Properties : par défaut, AD ne retourne que quelques attributs de base</span>
`Get-ADUser` sans `-Properties` retourne un objet allégé (nom, SID, statut actif). Les centaines d'attributs AD disponibles (email, service, titre, téléphone...) ne sont chargés que sur demande explicite via `-Properties`, pour des raisons de performance sur de grands annuaires.
</div>

## 21.4 Créer et gérer des utilisateurs AD

```powershell
New-ADUser -Name "Marie Pierre" -SamAccountName "marie.pierre" `
    -UserPrincipalName "marie.pierre@entreprise.local" `
    -Path "OU=Comptabilite,DC=entreprise,DC=local" `
    -AccountPassword (ConvertTo-SecureString "MotDePasse123!" -AsPlainText -Force) `
    -Enabled $true

Set-ADUser -Identity "marie.pierre" -Department "Comptabilite" -Title "Comptable"
Disable-ADAccount -Identity "marie.pierre"
Remove-ADUser -Identity "marie.pierre"
```

## 21.5 Groupes AD

```powershell
Get-ADGroup -Filter *
Get-ADGroupMember -Identity "Comptabilite"

New-ADGroup -Name "Comptabilite" -GroupScope Global -Path "OU=Groupes,DC=entreprise,DC=local"
Add-ADGroupMember -Identity "Comptabilite" -Members "marie.pierre"
Remove-ADGroupMember -Identity "Comptabilite" -Members "marie.pierre" -Confirm:$false
```

## 21.6 Unités d'organisation (OU)

```powershell
Get-ADOrganizationalUnit -Filter *

New-ADOrganizationalUnit -Name "Stagiaires" -Path "DC=entreprise,DC=local"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Organiser les OU en miroir de la structure de l'entreprise</span>
Une hiérarchie d'OU calquée sur l'organigramme réel (Direction > Comptabilité, Direction > IT, Direction > Ventes) facilite l'application ciblée de politiques de groupe (GPO) et la délégation de droits d'administration à des responsables de service, sans leur donner un accès à l'ensemble du domaine.
</div>

## 21.7 Rechercher des comptes verrouillés ou expirés

```powershell
Search-ADAccount -LockedOut
Search-ADAccount -AccountExpired
Search-ADAccount -PasswordExpired

Unlock-ADAccount -Identity "marie.pierre"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Search-ADAccount : le premier réflexe pour du support niveau 1</span>
"Je n'arrive plus à me connecter" est l'une des demandes de support les plus fréquentes en entreprise ; `Search-ADAccount -LockedOut` puis `Unlock-ADAccount` résout la majorité de ces cas en quelques secondes, sans ouvrir la console graphique "Utilisateurs et ordinateurs Active Directory".
</div>

## 21.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre le DN (Distinguished Name) et le SamAccountName</span>
`-Identity` accepte plusieurs formats (SamAccountName, DN complet, GUID, SID) — mais un DN mal formé (`OU=` et `DC=` dans le mauvais ordre, ou domaine incorrect) échoue silencieusement avec une erreur peu explicite. Toujours vérifier la structure du domaine avec `Get-ADDomain` avant de construire un DN à la main.
</div>

## 21.9 Bonnes pratiques

- Toujours utiliser `-Properties` avec parcimonie (uniquement les attributs réellement nécessaires) sur de grands annuaires.
- Organiser les OU en reflet de la structure organisationnelle réelle, pour simplifier l'application des GPO.
- Documenter tout script de provisioning en masse (création d'utilisateurs) avant exécution sur un domaine de production.

## 21.10 Résumé du chapitre

- Active Directory centralise l'authentification et les autorisations pour un domaine entier de machines et d'utilisateurs.
- Le module `ActiveDirectory` (RSAT) fournit les cmdlets `Get/New/Set/Remove-ADUser`, `*-ADGroup`, `*-ADOrganizationalUnit`.
- `Search-ADAccount -LockedOut`/`Unlock-ADAccount` couvrent le cas de support le plus fréquent : un compte verrouillé.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.1</span>

En supposant le module ActiveDirectory disponible, écris la commande listant tous les utilisateurs du service "Ventes" avec leur adresse email.
</div>

**Corrigé :**
```powershell
Get-ADUser -Filter "Department -eq 'Ventes'" -Properties EmailAddress |
    Select-Object Name, EmailAddress
```

*Chapitre suivant : la sécurité en PowerShell (permissions NTFS, chiffrement, exécution sécurisée de scripts).*
