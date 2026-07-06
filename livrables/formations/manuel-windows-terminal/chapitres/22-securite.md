<div class="chapitre-titre-num">CHAPITRE 22</div>

# Sécurité en PowerShell

## Objectifs pédagogiques

Comprendre les permissions NTFS, les politiques d'exécution PowerShell, le chiffrement de fichiers, la gestion sécurisée des secrets, et le principe du moindre privilège.

## Prérequis

Chapitres 9-21.

## 22.1 Permissions NTFS : consulter et modifier

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
C:\>icacls "C:\Projets\Confidentiel" /grant Marie:R
C:\>icacls "C:\Projets\Confidentiel" /remove Marie
```
`Get-Acl`/`Set-Acl` sont préférables dans un script PowerShell (objets manipulables), tandis que `icacls` reste plus direct pour une modification ponctuelle en ligne de commande.
</div>

## 22.2 Politiques d'exécution (Execution Policy)

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
Elle protège contre l'exécution **accidentelle** d'un script (double-clic sur un `.ps1` malveillant reçu par email), mais se contourne trivialement (`powershell -ExecutionPolicy Bypass -File script.ps1`) par quiconque a un accès local. La vraie sécurité repose sur la signature de code, l'antivirus, et les permissions systèmes — pas sur cette politique seule.
</div>

## 22.3 Signer un script PowerShell

```powershell
$certificat = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert
Set-AuthenticodeSignature -FilePath "C:\Scripts\deploiement.ps1" -Certificate $certificat[0]

Get-AuthenticodeSignature -FilePath "C:\Scripts\deploiement.ps1"
```

## 22.4 Gérer des secrets sans les exposer en clair

```powershell
# Éviter : mot de passe en clair dans le script
$motDePasse = "MonMotDePasse123!"    # ❌

# Préférer : variable d'environnement, jamais commitée
$motDePasse = $env:MDP_BASE_DONNEES   # ✅

# Ou : SecretManagement (module PowerShell dédié)
Install-Module Microsoft.PowerShell.SecretManagement, Microsoft.PowerShell.SecretStore
Set-Secret -Name "MdpBaseDeDonnees" -Secret "MonMotDePasse123!"
$motDePasse = Get-Secret -Name "MdpBaseDeDonnees" -AsPlainText
```

<div class="encadre astuce">
<span class="encadre-titre">💡 SecretManagement : le coffre-fort natif de PowerShell</span>
Ce module stocke les secrets **chiffrés** localement (ou via un coffre externe : Azure Key Vault, etc.), évitant qu'un secret n'apparaisse jamais en texte brut dans un script versionné dans Git — rappel direct des bonnes pratiques `.env`/variables d'environnement déjà vues dans les manuels Node.js et React de cette même collection.
</div>

## 22.5 Chiffrer un fichier avec DPAPI (Data Protection API)

```powershell
"Donnée sensible" | ConvertTo-SecureString -AsPlainText -Force | ConvertFrom-SecureString | Out-File "secret.txt"

$secure = Get-Content "secret.txt" | ConvertTo-SecureString
$clair = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ DPAPI chiffre pour l'utilisateur/machine ACTUEL uniquement</span>
Un fichier chiffré via `ConvertFrom-SecureString` sans clé explicite n'est déchiffrable que par le **même compte utilisateur sur la même machine** — inutilisable pour partager un secret entre machines ou utilisateurs (utiliser `-Key` avec une clé AES explicite, ou SecretManagement avec un coffre partagé, pour ce cas).
</div>

## 22.6 Principe du moindre privilège appliqué aux scripts

<div class="encadre astuce">
<span class="encadre-titre">💡 Ne jamais exécuter un script en administrateur "par habitude"</span>
`#Requires -RunAsAdministrator` (chapitre 16) ne doit être ajouté que si le script effectue réellement une action nécessitant ces droits (modifier le registre système, gérer des services). Un script de traitement de fichiers utilisateur n'a besoin d'aucun privilège élevé — l'exécuter en administrateur par défaut augmente inutilement l'impact d'une erreur ou d'une faille.
</div>

## 22.7 Auditer les connexions et évènements de sécurité

```powershell
Get-WinEvent -LogName Security -MaxEvents 20 | Where-Object { $_.Id -eq 4625 }   # tentatives de connexion échouées

Get-EventLog -LogName Security -InstanceId 4624 -Newest 10   # connexions réussies (cmdlet historique, encore répandue)
```

## 22.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Croire que Set-ExecutionPolicy Bypass est une solution acceptable en production</span>
Utiliser `Bypass` pour "faire fonctionner" un script qui échoue sur `RemoteSigned` masque souvent un vrai problème (script téléchargé non signé, provenance douteuse) plutôt que de le résoudre — vérifier la provenance du script et le signer correctement est la vraie solution.
</div>

## 22.9 Bonnes pratiques

- Ne jamais stocker un secret en clair dans un script versionné ; utiliser des variables d'environnement ou `SecretManagement`.
- Signer les scripts destinés à être distribués dans une organisation, plutôt que de baisser la politique d'exécution.
- Appliquer le principe du moindre privilège à chaque script (droits administrateur uniquement si réellement nécessaires).

## 22.10 Résumé du chapitre

- `Get-Acl`/`Set-Acl` (ou `icacls`) gèrent les permissions NTFS.
- L'Execution Policy prévient l'exécution accidentelle de scripts, mais ne constitue pas une barrière de sécurité contre un attaquant déterminé.
- `SecretManagement` et DPAPI (`ConvertTo/From-SecureString`) protègent les secrets sans les exposer en clair.
- Le principe du moindre privilège s'applique aussi aux scripts : ne demander que les droits réellement nécessaires.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.1</span>

Stocke un mot de passe fictif via `Set-Secret`, puis récupère-le et affiche-le en clair.
</div>

**Corrigé :**
```powershell
Set-Secret -Name "TestMdp" -Secret "Exemple123!"
Get-Secret -Name "TestMdp" -AsPlainText
```

*Chapitre suivant : l'automatisation avancée avec PowerShell (modules, profils, remoting).*
