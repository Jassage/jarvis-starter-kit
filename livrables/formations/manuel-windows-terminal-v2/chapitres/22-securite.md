<div class="chapitre-titre-num">CHAPITRE 22</div>

# UAC, permissions NTFS, Execution Policy et gestion des secrets

## 🎯 Objectifs

Comprendre UAC, les permissions NTFS et ACL, l'Execution Policy PowerShell, les scripts signés, Windows Defender, le pare-feu, et la bonne gestion des secrets — sans jamais apprendre à stocker un mot de passe en clair.

## Prérequis

Chapitres 1, 17-21.

## 🧠 Comprendre : plusieurs couches de protection, aucune suffisante seule

**Le problème.** Un système Windows manipule des informations sensibles (mots de passe, données personnelles, configuration critique) et doit se protéger à la fois contre les erreurs accidentelles (un script qui supprime le mauvais dossier) et les intentions malveillantes.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
La sécurité Windows est un immeuble à plusieurs portes : le badge d'entrée (authentification), le droit d'accéder à tel étage plutôt qu'un autre (permissions NTFS), le vigile qui te redemande confirmation avant une action sensible (UAC), la caméra de surveillance (audit), et le coffre-fort dans un bureau précis (gestion des secrets). Aucune porte seule ne suffit — c'est l'ensemble qui protège.
</div>

## 💻 Démonstration : UAC, la porte la plus visible

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : UAC (User Account Control)</span>
**UAC** (*Contrôle de compte d'utilisateur*) est la fenêtre grisée qui demande confirmation avant qu'une action nécessitant des droits administrateur ne s'exécute — même sur un compte déjà administrateur. Son but : éviter qu'un programme (ou un script) obtienne des droits élevés **sans que tu t'en rendes compte**, en te forçant à confirmer explicitement chaque élévation.
</div>

```powershell
# Lancer PowerShell en tant qu'administrateur, depuis un terminal existant
Start-Process pwsh -Verb RunAs
```

## 🔍 Décortiquons

`-Verb RunAs` demande explicitement une élévation de privilèges — Windows affiche alors l'invite UAC, qui doit être acceptée manuellement (ou par un compte administrateur si tu es sur un compte standard).

## 22.1 Permissions NTFS et ACL

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : NTFS, ACL</span>
**NTFS** est le système de fichiers utilisé par Windows sur le disque (chapitre 1) — il stocke, pour chaque fichier et dossier, une **ACL** (*Access Control List*, liste de contrôle d'accès) : qui a le droit de lire, écrire, exécuter, ou modifier les permissions elles-mêmes.
</div>

```powershell
Get-Acl -Path "C:\Projets\rapport.docx"

$acl = Get-Acl "C:\Projets\rapport.docx"
$acl.Access | Select-Object IdentityReference, FileSystemRights, AccessControlType
```

```powershell
$acl = Get-Acl "C:\Projets\Confidentiel"
$regle = New-Object System.Security.AccessControl.FileSystemAccessRule("Marie", "Read", "Allow")
$acl.SetAccessRule($regle)
Set-Acl -Path "C:\Projets\Confidentiel" -AclObject $acl
```

<div class="encadre astuce">
<span class="encadre-titre">💡 icacls reste souvent plus rapide en ligne de commande directe</span>
```
icacls "C:\Projets\Confidentiel" /grant Marie:R
icacls "C:\Projets\Confidentiel" /remove Marie
```
`Get-Acl`/`Set-Acl` sont préférables dans un script PowerShell (objets manipulables), tandis que `icacls` reste plus direct pour une modification ponctuelle en ligne de commande.
</div>

## 22.2 Execution Policy : empêcher l'exécution accidentelle de scripts

```powershell
Get-ExecutionPolicy
Get-ExecutionPolicy -List

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

| Politique | Comportement |
|---|---|
| `Restricted` | Aucun script ne s'exécute (défaut historique) |
| `AllSigned` | Seuls les scripts signés numériquement s'exécutent |
| `RemoteSigned` | Scripts locaux libres, scripts téléchargés doivent être signés |
| `Unrestricted` | Tous les scripts s'exécutent (avec avertissement pour les scripts distants) |
| `Bypass` | Aucune restriction, aucun avertissement |

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'Execution Policy n'est PAS une mesure de sécurité contre un attaquant déterminé</span>
Elle protège contre l'exécution **accidentelle** d'un script (double-clic sur un `.ps1` malveillant reçu par email), mais se contourne trivialement (`pwsh -ExecutionPolicy Bypass -File script.ps1`) par quiconque a un accès local. La vraie sécurité repose sur la signature de code, l'antivirus, et les permissions systèmes — pas sur cette politique seule.
</div>

## 22.3 Scripts signés

```powershell
$certificat = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert
Set-AuthenticodeSignature -FilePath "C:\Scripts\deploiement.ps1" -Certificate $certificat[0]

Get-AuthenticodeSignature -FilePath "C:\Scripts\deploiement.ps1"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un certificat prouve l'origine, pas la qualité du code</span>
Signer un script prouve qu'il provient bien de toi (ou de ton organisation) et n'a pas été modifié depuis — un peu comme un cachet de cire sur une lettre. Cela n'empêche pas un script signé de contenir un bug ; c'est une garantie de **provenance**, pas de **correction**.
</div>

## 22.4 Gérer des secrets sans les exposer en clair

```powershell
# À éviter absolument : mot de passe en clair dans le script
$motDePasse = "MonMotDePasse123!"    ← ❌

# Préférer : variable d'environnement, jamais commitée
$motDePasse = $env:MDP_BASE_DONNEES   ← ✅

# Ou : SecretManagement (module PowerShell dédié)
Install-Module Microsoft.PowerShell.SecretManagement, Microsoft.PowerShell.SecretStore
Set-Secret -Name "MdpBaseDeDonnees" -Secret "MonMotDePasse123!"
$motDePasse = Get-Secret -Name "MdpBaseDeDonnees" -AsPlainText
```

<div class="encadre astuce">
<span class="encadre-titre">💡 SecretManagement : le coffre-fort natif de PowerShell</span>
Ce module stocke les secrets **chiffrés** localement (ou via un coffre externe, type Azure Key Vault, chapitre 26), évitant qu'un secret n'apparaisse jamais en texte brut dans un script versionné dans Git — même principe que les fichiers `.env` non versionnés utilisés côté développement web.
</div>

## 22.5 Chiffrer une donnée avec DPAPI

```powershell
"Donnée sensible" | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Out-File "secret.txt"

$secure = Get-Content "secret.txt" | ConvertTo-SecureString
$clair = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ DPAPI chiffre pour l'utilisateur/machine actuel uniquement</span>
Un fichier chiffré via `ConvertFrom-SecureString` sans clé explicite n'est déchiffrable que par le **même compte utilisateur sur la même machine** — inutilisable pour partager un secret entre machines ou utilisateurs (utiliser `-Key` avec une clé AES explicite, ou `SecretManagement` avec un coffre partagé, pour ce cas).
</div>

## 22.6 Pare-feu Windows

```powershell
Get-NetFirewallRule | Where-Object { $_.Enabled -eq "True" -and $_.Direction -eq "Inbound" }

New-NetFirewallRule -DisplayName "Autoriser API sur port 3000" -Direction Inbound `
    -LocalPort 3000 -Protocol TCP -Action Allow

Disable-NetFirewallRule -DisplayName "Autoriser API sur port 3000"
Remove-NetFirewallRule -DisplayName "Autoriser API sur port 3000"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Inbound vs Outbound</span>
`Inbound` : trafic **entrant** vers cette machine (une règle typique pour autoriser un serveur web local à recevoir des requêtes, rappel du chapitre 20). `Outbound` : trafic **sortant** depuis cette machine — généralement plus permissif par défaut, restreint surtout dans des environnements à sécurité renforcée.
</div>

## 22.7 Windows Defender

```powershell
Get-MpComputerStatus
Start-MpScan -ScanType QuickScan
Update-MpSignature    ← met a jour les definitions de virus manuellement

Add-MpPreference -ExclusionPath "C:\Projets\node_modules"    ← exclut un dossier de l'analyse
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les exclusions Defender réduisent la protection : à utiliser avec parcimonie</span>
Exclure `node_modules` (fréquent chez les développeurs, pour accélérer les analyses lors d'une installation de dépendances) crée un angle mort de sécurité sur ce dossier précis — acceptable pour un dossier de dépendances de confiance connues, jamais pour un dossier de téléchargements généraux.
</div>

## 22.8 Principe du moindre privilège

<div class="encadre astuce">
<span class="encadre-titre">💡 Ne jamais exécuter un script en administrateur "par habitude"</span>
`#Requires -RunAsAdministrator` ne doit être ajouté que si le script effectue réellement une action nécessitant ces droits (modifier le registre système, gérer des services, chapitre 18). Un script de traitement de fichiers utilisateur n'a besoin d'aucun privilège élevé — l'exécuter en administrateur par défaut augmente inutilement l'impact d'une erreur ou d'une faille.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Croire que Set-ExecutionPolicy Bypass est une solution acceptable en production</span>
Utiliser `Bypass` pour "faire fonctionner" un script qui échoue sur `RemoteSigned` masque souvent un vrai problème (script téléchargé non signé, provenance douteuse) plutôt que de le résoudre — vérifier la provenance du script et le signer correctement est la vraie solution.
</div>

## Bonnes pratiques

- Ne jamais stocker un secret en clair dans un script versionné ; utiliser des variables d'environnement ou `SecretManagement`.
- Signer les scripts destinés à être distribués dans une organisation, plutôt que de baisser la politique d'exécution.
- Appliquer le principe du moindre privilège à chaque script (droits administrateur uniquement si réellement nécessaires).
- Limiter les exclusions Windows Defender au strict nécessaire, documentées et revues périodiquement.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.1</span>

Stocke un mot de passe fictif via `Set-Secret`, puis récupère-le et affiche-le en clair, sans jamais l'écrire directement dans un script.
</div>

**✅ Correction.**
```powershell
Set-Secret -Name "TestMdp" -Secret "Exemple123!"
Get-Secret -Name "TestMdp" -AsPlainText
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.2</span>

Crée une règle de pare-feu autorisant le trafic entrant sur le port 8080 (TCP), puis vérifie qu'elle apparaît bien dans la liste des règles actives.
</div>

**✅ Correction.**
```powershell
New-NetFirewallRule -DisplayName "App locale port 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
Get-NetFirewallRule -DisplayName "App locale port 8080"
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 22.3</span>

Un script trouvé en ligne échoue avec une erreur liée à l'Execution Policy. Le tutoriel suggère `Set-ExecutionPolicy Bypass`. Explique pourquoi ce n'est pas forcément une bonne idée, et propose une alternative plus sûre.
</div>

**✅ Correction du défi.** `Bypass` désactive toute vérification, y compris pour ce script précis dont la provenance n'est pas vérifiée (section 22.2/erreur fréquente) — un script malveillant profiterait exactement du même contournement. Une alternative plus sûre : lire le script avant exécution pour comprendre ce qu'il fait, puis, si la politique `RemoteSigned` est réellement la cause du blocage (script téléchargé non signé), débloquer **ce fichier précis** avec `Unblock-File -Path script.ps1` plutôt que d'abaisser la politique pour tout le système.

## 🎯 Ce que tu sais maintenant

- **UAC** confirme les élévations de privilèges ; **NTFS/ACL** (`Get-Acl`/`Set-Acl`) contrôlent qui accède à quoi.
- L'**Execution Policy** prévient l'exécution accidentelle de scripts, sans être une barrière contre un attaquant déterminé.
- `SecretManagement` et DPAPI protègent les secrets sans jamais les exposer en clair dans un script.
- Pare-feu (`Get-NetFirewallRule`) et Windows Defender (`Get-MpComputerStatus`) sont deux couches de protection réseau/antivirus distinctes.
- Le principe du moindre privilège s'applique aussi aux scripts : ne demander que les droits réellement nécessaires.

*Chapitre suivant : automatiser ses tâches — sauvegardes, nettoyage, rapports, surveillance.*
