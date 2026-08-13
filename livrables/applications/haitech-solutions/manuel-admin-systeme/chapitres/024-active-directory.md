<div class="chapitre-titre-num">PARTIE IV · CHAPITRE 20</div>

# Active Directory

## Rôle d'Active Directory

Active Directory (AD) est le service d'annuaire de Microsoft, qui centralise l'authentification et l'autorisation de l'ensemble des utilisateurs, ordinateurs et ressources d'une organisation sur un domaine Windows. Il reste, malgré la montée du cloud, la colonne vertébrale de l'identité dans la grande majorité des entreprises équipées d'un parc Windows : un seul annuaire fait autorité sur qui peut se connecter à quelle machine, accéder à quel partage, recevoir quelle politique de sécurité (GPO, Chapitre 23).

## Fonctionnement : la structure logique d'AD

| Composant | Rôle |
|---|---|
| Forêt (forest) | Le conteneur de plus haut niveau, limite de sécurité ultime entre plusieurs domaines |
| Domaine (domain) | Unité d'administration et de réplication, avec sa propre base de comptes |
| Unité d'organisation (OU) | Conteneur organisationnel interne à un domaine, sert à structurer et à cibler les GPO |
| Site AD | Regroupement basé sur la topologie physique/réseau, optimise la réplication et l'authentification |
| Contrôleur de domaine (DC) | Serveur hébergeant une copie de la base AD et assurant l'authentification |

```{.uml}
FORET (Haitech.local)
   │
   ├── Domaine racine (Haitech.local)
   │       ├── OU Sièges
   │       │     ├── OU Direction
   │       │     └── OU IT
   │       ├── OU Établissements
   │       │     ├── OU Otela-Reception
   │       │     └── OU Antenn-Regie
   │       └── OU Serveurs
   │
   └── (Domaines enfants optionnels, rarement nécessaires en PME)
```

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Contrairement à une idée reçue, une seule forêt avec un seul domaine suffit à la quasi-totalité des PME et ETI, même multi-sites. Créer plusieurs domaines ou plusieurs forêts ajoute une complexité de réplication et d'approbation (trust) rarement justifiée en dehors de contraintes réglementaires strictes ou d'un historique de fusion-acquisition.
</div>

## Prérequis

- Un plan de nommage de domaine cohérent, idéalement un nom non ambigu avec un domaine public existant (éviter `.local` pour les nouveaux déploiements, lui préférer un sous-domaine dédié comme `ad.entreprise.ht`)
- Un serveur DNS intégré ou associé à AD (Chapitre 14), condition technique obligatoire au bon fonctionnement d'AD
- Une réflexion sur la structure des OU avant tout déploiement, difficile à réorganiser après coup sans impact sur les GPO

## Mise en place d'un domaine Active Directory

1. **Installer le rôle AD DS** sur un serveur Windows Server dédié.
2. **Promouvoir le serveur en contrôleur de domaine**, créant une nouvelle forêt si c'est le premier déploiement.
3. **Concevoir la structure des OU** — Par fonction (Direction, IT), par site/établissement, ou une combinaison, selon le besoin réel de ciblage des GPO.
4. **Créer les comptes et groupes** — Suivant une convention de nommage documentée (Chapitre 26).
5. **Déployer un second contrôleur de domaine** — Pour la redondance (Partie IX), jamais un seul DC en production au-delà d'un environnement de test.

## Configuration : exemples de commandes PowerShell

```
# Installer le rôle AD DS
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

# Promouvoir en premier contrôleur de domaine (nouvelle forêt)
Install-ADDSForest -DomainName "ad.haitech.ht" -DomainNetbiosName "HAITECH"

# Créer une unité d'organisation
New-ADOrganizationalUnit -Name "Etablissements" -Path "DC=ad,DC=haitech,DC=ht"

# Créer un utilisateur
New-ADUser -Name "Jean Baptiste" -SamAccountName "jbaptiste" `
  -Path "OU=IT,DC=ad,DC=haitech,DC=ht" -Enabled $true `
  -AccountPassword (ConvertTo-SecureString "MotDePasseInitial!2026" -AsPlainText -Force)

# Lister les contrôleurs de domaine
Get-ADDomainController -Filter *

# Vérifier la réplication entre contrôleurs de domaine
repadmin /replsummary
```

## Administration courante

- Vérifier quotidiennement la réplication entre contrôleurs de domaine (`repadmin /replsummary`), une réplication cassée non détectée peut créer des incohérences silencieuses
- Surveiller les journaux d'événements de sécurité des contrôleurs de domaine (Partie X)
- Nettoyer périodiquement les comptes désactivés obsolètes, alignés avec le processus RH de départ (Partie I, Chapitre 2)
- Sauvegarder l'état système des contrôleurs de domaine régulièrement (Partie IX)

## Rôles FSMO (Flexible Single Master Operations)

Cinq rôles critiques d'AD ne sont détenus que par un seul contrôleur de domaine à la fois (contrairement au reste de la base AD, répliqué en multi-maître) :

| Rôle FSMO | Portée | Fonction |
|---|---|---|
| Schema Master | Forêt | Seul autorisé à modifier le schéma AD |
| Domain Naming Master | Forêt | Ajout/suppression de domaines dans la forêt |
| RID Master | Domaine | Distribue les identifiants relatifs uniques pour les nouveaux objets |
| PDC Emulator | Domaine | Synchronisation horaire, verrouillages de compte, compatibilité descendante |
| Infrastructure Master | Domaine | Références d'objets entre domaines |

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Déployer au minimum deux contrôleurs de domaine dès la production, jamais un seul point de défaillance sur un service aussi critique
- Concevoir la structure des OU en pensant d'abord au ciblage des GPO (Chapitre 23), pas uniquement à une logique organisationnelle esthétique
- Éviter le suffixe `.local` pour tout nouveau déploiement, source de conflits de résolution DNS avec le mDNS moderne
- Documenter la structure AD dans la cartographie d'architecture (Partie I, Chapitre 3)
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Un seul contrôleur de domaine en production, sans aucune redondance
- Une structure d'OU trop plate (tout dans un seul conteneur) ou au contraire excessivement profonde, rendant le ciblage GPO confus
- Accorder l'appartenance au groupe Domain Admins de façon large, au lieu de la réserver strictement aux comptes qui en ont un besoin justifié (Partie XI, moindre privilège)
- Ignorer les alertes de réplication cassée pendant plusieurs jours, laissant les contrôleurs de domaine diverger silencieusement
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Les utilisateurs ne peuvent pas s'authentifier de façon intermittente | Un contrôleur de domaine indisponible ou réplication cassée | `repadmin /replsummary`, vérifier la disponibilité de chaque DC |
| Une GPO ne s'applique pas à un utilisateur ou un poste | Mauvais emplacement dans la structure des OU, ou héritage bloqué | `gpresult /r`, vérifier le ciblage et l'héritage |
| Les horloges des postes divergent, provoquant des échecs Kerberos | Synchronisation NTP défaillante, PDC Emulator hors service | Vérifier le rôle FSMO PDC Emulator et la hiérarchie de synchronisation horaire |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un contrôleur de domaine compromis équivaut à la compromission totale du domaine : il détient (chiffré) les identifiants de tous les comptes. Restreindre drastiquement l'appartenance aux groupes à privilèges (Domain Admins, Enterprise Admins), appliquer le principe du moindre privilège systématiquement (Partie I, Chapitre 2), et durcir spécifiquement les contrôleurs de domaine (Partie XI) sont des priorités absolues, pas des options.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Si Haitech Solutions déploie un jour Active Directory pour son infrastructure interne, la structure d'OU par établissement déjà éprouvée côté applicatif sur OTELA (isolation stricte par `etablissementId`, cloisonnement testé entre administrateur d'établissement et administrateur de chaîne) offre un modèle directement transposable : une OU par établissement, avec des GPO ciblées reproduisant la même logique de cloisonnement au niveau du système d'exploitation que celle déjà validée au niveau applicatif.
</div>

## Résumé du chapitre

- Active Directory centralise l'authentification et l'autorisation via une structure forêt/domaine/OU.
- Une seule forêt à un seul domaine suffit à la quasi-totalité des organisations, même multi-sites.
- Les cinq rôles FSMO gèrent des fonctions critiques non répliquées en multi-maître.
- Un contrôleur de domaine compromis équivaut à la compromission complète du domaine : la protection des comptes à privilèges est prioritaire.

*Chapitre suivant : Microsoft Entra ID et l'identité hybride.*
