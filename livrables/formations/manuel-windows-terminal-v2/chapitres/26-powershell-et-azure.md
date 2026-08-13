<div class="chapitre-titre-num">CHAPITRE 26</div>

# PowerShell et Azure

## 🎯 Objectifs

Comprendre ce qu'est le Cloud, s'authentifier et gérer des ressources Azure (groupe de ressources, machine virtuelle, stockage) directement depuis PowerShell avec le module `Az`.

## Prérequis

Chapitres 22-25. Un compte Azure (l'offre gratuite suffit) est utile mais non indispensable pour comprendre les concepts.

## 🧠 Comprendre : qu'est-ce que le Cloud ?

**Le problème.** Faire tourner un serveur soi-même (chapitre 1) implique d'acheter le matériel, l'entretenir, le sécuriser, prévoir sa panne — un investissement lourd pour un simple test ou un projet qui doit grandir vite.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **Cloud** est à un ordinateur ce qu'une compagnie d'électricité est à un groupe électrogène personnel : au lieu de posséder et entretenir ta propre machine physique, tu **loues** de la puissance de calcul, du stockage et des services chez un fournisseur (Microsoft Azure, ici), payés à l'usage, disponibles en quelques clics et redimensionnables à volonté.
</div>

**Explication simple.** Azure est le service Cloud de Microsoft : il propose des machines virtuelles (des "ordinateurs" loués, chapitre 1), du stockage de fichiers, des bases de données, et des centaines d'autres services, tous administrables soit via un site web (le "portail Azure"), soit — ce qui intéresse ce chapitre — directement en PowerShell, via le module `Az`.

## 💻 Démonstration : installer et se connecter

```powershell
Install-Module -Name Az -Scope CurrentUser -Repository PSGallery -Force

Connect-AzAccount
```

## 🔍 Décortiquons

<div class="encadre astuce">
<span class="encadre-titre">💡 Connect-AzAccount ouvre une authentification interactive dans le navigateur</span>
Comme pour toute connexion à un service cloud, l'authentification passe par un flux OAuth standard — un navigateur s'ouvre, tu te connectes avec ton compte Microsoft/Azure AD, et un jeton de session est renvoyé à la session PowerShell (rappel du Bearer Token, chapitre 21).
</div>

## 26.1 Abonnement et groupe de ressources

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : abonnement, Resource Group</span>
Un **abonnement** Azure est le compte de facturation qui regroupe toutes tes ressources. Un **groupe de ressources** (*Resource Group*) est le "dossier" logique (rappel du chapitre 1, section fichiers/dossiers) dans lequel tu ranges les ressources d'un même projet — supprimer le groupe supprime **toutes** les ressources qu'il contient.
</div>

```powershell
Get-AzSubscription
Set-AzContext -Subscription "Abonnement Gratuit"

Get-AzResourceGroup
New-AzResourceGroup -Name "MonProjetRG" -Location "francecentral"
```

## 26.2 Créer une machine virtuelle

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

## 26.3 Stockage (Blob Storage)

```powershell
$compteStockage = New-AzStorageAccount -ResourceGroupName "MonProjetRG" -Name "monstockagejaslin" `
    -Location "francecentral" -SkuName "Standard_LRS"

$contexte = $compteStockage.Context
New-AzStorageContainer -Name "documents" -Context $contexte -Permission Off

Set-AzStorageBlobContent -File "C:\rapport.pdf" -Container "documents" -Blob "rapport.pdf" -Context $contexte
Get-AzStorageBlob -Container "documents" -Context $contexte
```

## 26.4 Automatiser un provisioning complet

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

## 26.5 Nettoyer un environnement de test

```powershell
Remove-AzResourceGroup -Name "MonProjetRG" -Force
Disconnect-AzAccount
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seul Remove-AzResourceGroup supprime tout l'environnement</span>
Cette commande unique évite d'avoir à supprimer manuellement chaque ressource individuellement (VM, disque, réseau, stockage) — pratique essentielle pour éviter une facturation résiduelle après un test, un piège fréquent chez les débutants du cloud.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de nettoyer les ressources après un test</span>
La cause la plus fréquente de facture cloud inattendue chez un débutant est simplement d'oublier de supprimer une ressource de test — automatiser le nettoyage (via une tâche planifiée, chapitre 23) est une bonne pratique pour un compte d'entraînement personnel.
</div>

## Bonnes pratiques

- Toujours vérifier le contexte actif (`Get-AzContext`) avant d'exécuter une commande destructrice sur un abonnement de production.
- Nettoyer systématiquement les ressources de test via `Remove-AzResourceGroup`.
- Ne jamais coder d'identifiants Azure en clair dans un script (rappel du chapitre 22, `SecretManagement`).

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.1</span>

Connecte-toi à Azure, liste tes abonnements disponibles, et affiche le nom de l'abonnement actuellement actif.
</div>

**✅ Correction.**
```powershell
Connect-AzAccount
Get-AzSubscription
(Get-AzContext).Subscription.Name
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.2</span>

Écris une fonction qui liste toutes les VM en cours d'exécution (`PowerState` = "VM running") dans tous les groupes de ressources d'un abonnement.
</div>

**✅ Correction.**
```powershell
function Get-VMEnCours {
    Get-AzVM -Status | Where-Object { $_.PowerState -eq "VM running" } |
        Select-Object Name, ResourceGroupName, PowerState
}
Get-VMEnCours
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 26.3</span>

Écris une fonction `Stop-VMOubliees` qui arrête automatiquement toute VM en cours d'exécution dont le nom contient "test" ou "demo", pour éviter une facturation oubliée.
</div>

**✅ Correction du défi.**
```powershell
function Stop-VMOubliees {
    $vms = Get-AzVM -Status | Where-Object {
        $_.PowerState -eq "VM running" -and ($_.Name -match "test|demo")
    }
    foreach ($vm in $vms) {
        Write-Output "Arrêt de $($vm.Name)..."
        Stop-AzVM -ResourceGroupName $vm.ResourceGroupName -Name $vm.Name -Force
    }
}
```
Combinée à une tâche planifiée quotidienne (chapitre 23), cette fonction évite exactement le piège décrit dans l'encadré "Attention" de ce chapitre.

## 🎯 Ce que tu sais maintenant

- Le **Cloud** loue de la puissance de calcul et du stockage à l'usage, plutôt que d'acheter et entretenir du matériel.
- Le module `Az` étend PowerShell pour gérer des ressources Azure (VM, stockage, réseau) directement en ligne de commande.
- Un groupe de ressources regroupe logiquement toutes les ressources d'un projet, et sa suppression nettoie tout l'environnement en une commande.
- Une VM Azure démarrée facture en continu — toujours l'arrêter ou la supprimer après un test.

*Chapitre suivant : PowerShell pour le développeur — Git, Node.js, Python et Docker.*
