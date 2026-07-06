<div class="chapitre-titre-num">CHAPITRE 16</div>

# Gestion des utilisateurs Windows

## Objectifs pédagogiques

Créer et gérer des comptes utilisateurs locaux, des groupes, comprendre les permissions de base et le fonctionnement de l'UAC.

## Prérequis

Chapitres 9-15. Droits administrateur nécessaires.

## 16.1 Comptes utilisateurs locaux

```powershell
Get-LocalUser
Get-LocalUser -Name "Jaslin"

New-LocalUser -Name "Marie" -Password (ConvertTo-SecureString "MotDePasse123!" -AsPlainText -Force) `
    -FullName "Marie Pierre" -Description "Compte employé"

Set-LocalUser -Name "Marie" -Description "Compte employé - Comptabilité"
Disable-LocalUser -Name "Marie"     # désactive SANS supprimer (conserve le profil et les fichiers)
Enable-LocalUser -Name "Marie"
Remove-LocalUser -Name "Marie"       # supprime DÉFINITIVEMENT le compte
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ ConvertTo-SecureString -AsPlainText -Force n'est PAS sécurisé pour un vrai mot de passe</span>
Cette syntaxe est nécessaire pour créer un compte via script, mais le mot de passe apparaît **en clair** dans le script lui-même — jamais acceptable pour un vrai déploiement. Pour un usage réel, générer un mot de passe aléatoire et le transmettre séparément (variable d'environnement, coffre-fort de secrets), jamais codé en dur dans un fichier `.ps1` versionné.
</div>

## 16.2 Groupes locaux

```powershell
Get-LocalGroup
Get-LocalGroupMember -Group "Administrateurs"

New-LocalGroup -Name "Comptabilite" -Description "Équipe comptabilité"
Add-LocalGroupMember -Group "Comptabilite" -Member "Marie"
Remove-LocalGroupMember -Group "Comptabilite" -Member "Marie"
Remove-LocalGroup -Name "Comptabilite"
```

## 16.3 Ajouter un utilisateur au groupe Administrateurs

```powershell
Add-LocalGroupMember -Group "Administrateurs" -Member "Marie"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ajouter un utilisateur aux Administrateurs lui donne un contrôle TOTAL de la machine</span>
Rappel du principe de moindre privilège (développé au chapitre 22) : n'accorder ce droit qu'après une réflexion sérieuse sur le besoin réel — la majorité des tâches (installer des applications utilisateur, configurer ses propres paramètres) ne nécessitent pas de droits administrateur complets.
</div>

## 16.4 UAC (User Account Control / Contrôle de compte utilisateur)

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi l'UAC existe : le principe du moindre privilège appliqué à la session</span>
Même un utilisateur membre du groupe Administrateurs travaille, par défaut, avec un jeton de **privilèges standard** (UAC activé) — les actions nécessitant des droits élevés (installer un pilote, modifier le registre système) déclenchent une invite de confirmation, empêchant qu'un programme malveillant exécuté "par accident" n'obtienne silencieusement un contrôle total du système.
</div>

```powershell
# Lancer PowerShell EN TANT QU'ADMINISTRATEUR depuis un script (déclenche l'invite UAC)
Start-Process powershell -Verb RunAs

# Vérifier si la session PowerShell actuelle a des droits administrateur
$estAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Output "Session administrateur : $estAdmin"
```

## 16.5 Forcer un script à s'exécuter uniquement en administrateur

```powershell
#Requires -RunAsAdministrator

Write-Output "Ce script ne s'exécute que si lancé en tant qu'administrateur."
```

<div class="encadre astuce">
<span class="encadre-titre">💡 #Requires : une directive de script, pas un vrai commentaire</span>
Bien qu'elle commence par `#`, `#Requires -RunAsAdministrator` est interprétée par PowerShell **avant** l'exécution du script : si la condition n'est pas remplie, le script s'arrête immédiatement avec un message d'erreur clair, plutôt que d'échouer plus tard sur une commande précise nécessitant ces droits.
</div>

## 16.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre Disable-LocalUser (réversible) et Remove-LocalUser (définitif)</span>
`Disable-LocalUser` conserve le compte, son profil et ses fichiers — réactivable à tout moment. `Remove-LocalUser` supprime le **compte** (mais pas nécessairement le profil/dossier utilisateur, qui doit être nettoyé séparément) de façon bien plus difficile à annuler.
</div>

## 16.7 Bonnes pratiques

- Toujours désactiver (`Disable-LocalUser`) plutôt que supprimer un compte quittant temporairement une organisation.
- Ne jamais coder un mot de passe en clair dans un script destiné à être commité/partagé.
- Vérifier `#Requires -RunAsAdministrator` en tête de tout script nécessitant des droits élevés.

## 16.8 Résumé du chapitre

- `Get-LocalUser`/`New-LocalUser`/`Disable-LocalUser`/`Remove-LocalUser` gèrent les comptes locaux ; `Get-LocalGroup`/`Add-LocalGroupMember` gèrent les groupes.
- L'UAC applique le principe du moindre privilège même à un compte administrateur, via une invite de confirmation pour les actions sensibles.
- `#Requires -RunAsAdministrator` fait échouer proprement un script lancé sans les droits nécessaires.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Crée un groupe local "Stagiaires", puis vérifie que la session PowerShell actuelle dispose bien des droits administrateur avant de continuer.
</div>

**Corrigé :**
```powershell
#Requires -RunAsAdministrator
New-LocalGroup -Name "Stagiaires" -Description "Comptes stagiaires temporaires"
```

*Chapitre suivant : la gestion des fichiers avancée (compression, recherche, expressions régulières).*
