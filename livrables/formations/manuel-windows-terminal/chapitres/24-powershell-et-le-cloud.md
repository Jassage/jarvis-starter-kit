<div class="chapitre-titre-num">CHAPITRE 24</div>

# PowerShell et le cloud (introduction à Azure)

## Objectifs pédagogiques

Utiliser le module Az pour gérer des ressources Azure depuis PowerShell, comprendre l'authentification cloud, et automatiser des tâches courantes (création de machine virtuelle, gestion de stockage).

## Prérequis

Chapitres 9-23. Un compte Azure (l'offre gratuite suffit pour pratiquer) est utile mais non indispensable pour comprendre les concepts.

## 24.1 Installer et se connecter au module Az

```powershell
Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force

Connect-AzAccount
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Connect-AzAccount ouvre une authentification interactive dans le navigateur</span>
Comme pour toute connexion à un service cloud, l'authentification passe par un flux OAuth standard — un navigateur s'ouvre, l'utilisateur se connecte avec son compte Microsoft/Azure AD, et un jeton de session est renvoyé à la session PowerShell, exactement comme un jeton JWT côté application web (rappel du manuel Node.js).
</div>

## 24.2 Explorer les abonnements et groupes de ressources

```powershell
Get-AzSubscription
Set-AzContext -Subscription "Abonnement Gratuit"

Get-AzResourceGroup
New-AzResourceGroup -Name "MonProjetRG" -Location "francecentral"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un groupe de ressources (Resource Group) : le "dossier" logique d'Azure</span>
Toute ressource Azure (machine virtuelle, base de données, stockage) appartient à un groupe de ressources — supprimer le groupe supprime **toutes** les ressources qu'il contient, un moyen pratique et souvent utilisé pour nettoyer un environnement de test entier en une seule commande.
</div>

## 24.3 Créer une machine virtuelle Azure

```powershell
$identifiants = Get-Credential

New-AzVM -ResourceGroupName "MonProjetRG" -Name "VM-Test" `
    -Location "francecentral" -Image "Win2022Datacenter" `
    -Credential $identifiants -Size "Standard_B1s"

Get-AzVM -ResourceGroupName "MonProjetRG" -Name "VM-Test" -Status
Stop-AzVM -ResourceGroupName "MonProjetRG" -Name "VM-Test" -Force
Start-AzVM -ResourceGroupName "MonProjetRG" -Name "VM-Test"
Remove-AzVM -ResourceGroupName "MonProjetRG" -Name "VM-Test"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une machine virtuelle démarrée continue de facturer même sans utilisation active</span>
Contrairement à un script local qui ne "coûte" rien tant qu'il ne s'exécute pas, une VM Azure facture chaque heure où elle reste **démarrée** (`Running`), qu'elle soit réellement utilisée ou non — toujours `Stop-AzVM` (ou mieux, `Remove-AzVM`) une ressource de test dès qu'elle n'est plus nécessaire.
</div>

## 24.4 Gérer le stockage Azure (Blob Storage)

```powershell
$compteStockage = New-AzStorageAccount -ResourceGroupName "MonProjetRG" -Name "monstockagejaslin" `
    -Location "francecentral" -SkuName "Standard_LRS"

$contexte = $compteStockage.Context
New-AzStorageContainer -Name "documents" -Context $contexte -Permission Off

Set-AzStorageBlobContent -File "C:\rapport.pdf" -Container "documents" -Blob "rapport.pdf" -Context $contexte
Get-AzStorageBlob -Container "documents" -Context $contexte
```

## 24.5 Automatiser un déploiement avec un script PowerShell

```powershell
function New-EnvironnementTest {
    param(
        [Parameter(Mandatory=$true)]
        [string]$NomProjet
    )

    $rg = "$NomProjet-RG"
    New-AzResourceGroup -Name $rg -Location "francecentral"

    New-AzStorageAccount -ResourceGroupName $rg -Name "$($NomProjet.ToLower())stockage" `
        -Location "francecentral" -SkuName "Standard_LRS"

    Write-Output "Environnement '$NomProjet' provisionné avec succès dans le groupe '$rg'."
}

New-EnvironnementTest -NomProjet "ProjetDemo"
```

## 24.6 Nettoyer un environnement de test

```powershell
Remove-AzResourceGroup -Name "MonProjetRG" -Force
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seul Remove-AzResourceGroup supprime tout l'environnement de test</span>
Cette commande unique évite d'avoir à supprimer manuellement chaque ressource individuellement (VM, disque, réseau, stockage) — pratique essentielle pour éviter une facturation résiduelle après un test, un piège fréquent chez les débutants du cloud.
</div>

## 24.7 Se déconnecter

```powershell
Disconnect-AzAccount
```

## 24.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de nettoyer les ressources après un test</span>
Rappel de la section 24.6 : la cause la plus fréquente de facture cloud inattendue chez un développeur en apprentissage est simplement d'oublier de supprimer une ressource de test — automatiser le nettoyage (via un script planifié, chapitre 15) est une bonne pratique pour un compte d'entraînement personnel.
</div>

## 24.9 Bonnes pratiques

- Toujours vérifier le contexte actif (`Get-AzContext`) avant d'exécuter une commande destructrice sur un abonnement de production.
- Nettoyer systématiquement les ressources de test via `Remove-AzResourceGroup`.
- Ne jamais coder d'identifiants Azure en clair dans un script (rappel du chapitre 22, SecretManagement).

## 24.10 Résumé du chapitre

- Le module `Az` étend PowerShell pour gérer des ressources Azure (VM, stockage, réseau) directement en ligne de commande.
- Un groupe de ressources regroupe logiquement toutes les ressources d'un projet, et sa suppression nettoie tout l'environnement en une commande.
- Automatiser le provisioning et le nettoyage via des fonctions PowerShell dédiées évite les oublis coûteux.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.1</span>

Écris une fonction qui liste toutes les VM en cours d'exécution (`PowerState` = "VM running") dans tous les groupes de ressources d'un abonnement.
</div>

**Corrigé :**
```powershell
function Get-VMEnCours {
    Get-AzVM -Status | Where-Object { $_.PowerState -eq "VM running" } |
        Select-Object Name, ResourceGroupName, PowerState
}
Get-VMEnCours
```

*Chapitre suivant : PowerShell pour les développeurs (intégration avec Git, npm, Docker).*
