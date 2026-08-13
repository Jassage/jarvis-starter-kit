<div class="chapitre-titre-num">CHAPITRE 21</div>

# Consommer une API REST

## 🎯 Objectifs

Utiliser `Invoke-WebRequest` et `Invoke-RestMethod` pour dialoguer avec une API web : GET, POST, PUT, DELETE, JSON, en-têtes, authentification par jeton (Bearer Token).

## Prérequis

Chapitre 20.

## 🧠 Comprendre : un terminal qui parle à Internet

**Le problème.** Beaucoup de services modernes (météo, paiement, réseaux sociaux, ton propre backend) exposent leurs données via une **API** consultable sur le réseau, plutôt que via un site web destiné à être cliqué. Un script d'administration doit pouvoir interroger ces API sans navigateur.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une **API** (*Application Programming Interface*) est un comptoir de commande dans un restaurant qui ne sert que les livreurs, pas les clients en salle : tu formules une demande selon un format précis ("un menu n°3, sans oignons"), et tu reçois une réponse structurée en retour, sans jamais avoir à comprendre le fonctionnement interne de la cuisine.
</div>

## 💻 Démonstration : une première requête GET

```powershell
$reponse = Invoke-WebRequest -Uri "https://api.github.com/users/octocat"
$reponse.StatusCode      ← 200
$reponse.Content          ← le corps BRUT (texte JSON non parse)
```

## 🔍 Décortiquons

`Invoke-WebRequest` envoie une requête HTTP (méthode `GET` par défaut, la plus simple : "donne-moi une information") et retourne un objet contenant le code de statut (`200` = succès, vu en détail plus bas), les en-têtes de réponse, et le corps.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : code de statut HTTP</span>
Un serveur répond toujours avec un **code de statut** à trois chiffres, résumant le résultat de la requête. `2xx` = succès (`200 OK`) ; `4xx` = erreur côté client (`404 Introuvable`, `401 Non autorisé`) ; `5xx` = erreur côté serveur (`500 Erreur interne`).
</div>

## 21.1 Invoke-RestMethod : JSON déjà converti en objet

```powershell
$donnees = Invoke-RestMethod -Uri "https://api.github.com/users/octocat"
$donnees.name             ← acces DIRECT, le JSON est deja converti en objet PowerShell !
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Invoke-WebRequest vs Invoke-RestMethod : quand utiliser laquelle</span>
`Invoke-WebRequest` retourne la réponse HTTP **complète** (en-têtes, code de statut, corps brut) — utile pour inspecter une réponse en détail. `Invoke-RestMethod` **parse automatiquement** le JSON (rappel du chapitre 3, section JSON) en objets PowerShell exploitables directement, comme un vrai résultat de cmdlet (chapitre 12) — c'est la cmdlet à privilégier pour simplement consommer une API.
</div>

## 21.2 GET, POST, PUT, DELETE : les quatre verbes essentiels

| Méthode | Rôle | Analogie |
|---|---|---|
| `GET` | Lire une ressource | Consulter un menu |
| `POST` | Créer une nouvelle ressource | Passer une nouvelle commande |
| `PUT` | Remplacer entièrement une ressource existante | Refaire toute la commande depuis zéro |
| `DELETE` | Supprimer une ressource | Annuler une commande |

```powershell
# GET (par defaut)
Invoke-RestMethod -Uri "https://api.monapp.com/utilisateurs/12"

# POST : creer, avec un corps JSON
$corps = @{ nom = "Jaslin"; email = "jaslin@mail.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.monapp.com/utilisateurs" -Method Post -Body $corps -ContentType "application/json"

# PUT : remplacer
$corpsMaj = @{ nom = "Jaslin Occius"; email = "jaslin@mail.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.monapp.com/utilisateurs/12" -Method Put -Body $corpsMaj -ContentType "application/json"

# DELETE : supprimer
Invoke-RestMethod -Uri "https://api.monapp.com/utilisateurs/12" -Method Delete
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ ConvertTo-Json et ContentType vont toujours ensemble</span>
`ConvertTo-Json` transforme une hashtable/objet PowerShell en texte JSON (chapitre 3) ; `-ContentType "application/json"` indique au serveur **comment interpréter** ce texte. Envoyer un corps JSON sans préciser `-ContentType` fait souvent échouer la requête côté serveur, qui tente d'interpréter le texte comme un simple formulaire.
</div>

## 21.3 En-têtes et authentification par jeton (Bearer Token)

```powershell
$enTetes = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "https://api.monapp.com/profil" -Headers $enTetes
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : en-tête HTTP, Bearer Token</span>
Un **en-tête** (*header*) HTTP transmet une information additionnelle sur la requête, en dehors du corps (contenu principal). Un **Bearer Token** est une chaîne secrète prouvant que tu es déjà authentifié — envoyée dans l'en-tête `Authorization`, elle évite de retransmettre un mot de passe à chaque requête. Ce jeton doit toujours être traité comme un secret (chapitre 22, sécurité) — jamais écrit en clair dans un script versionné.
</div>

## ⚠️ Attention : erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne pas gérer les erreurs HTTP</span>
```powershell
try {
    Invoke-RestMethod -Uri "https://api.monapp.com/inexistant"
} catch {
    Write-Warning "Échec de l'appel API : $($_.Exception.Message)"
}
```
Contrairement à un simple échec réseau, une réponse `4xx`/`5xx` fait lever une **exception** PowerShell par `Invoke-RestMethod` — sans `try`/`catch` (approfondi au chapitre 29), un script s'arrête brutalement sur la première erreur d'API rencontrée.
</div>

## Bonnes pratiques

- Préférer `Invoke-RestMethod` à `Invoke-WebRequest` dès que le besoin est de consommer une API JSON, pas d'inspecter la réponse HTTP brute.
- Ne jamais coder un jeton d'authentification en dur dans un script — utiliser une variable d'environnement ou un coffre de secrets (chapitre 22).
- Toujours envelopper un appel API dans un `try`/`catch` dans un script destiné à tourner sans surveillance.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.1</span>

Récupère les informations d'un utilisateur GitHub de ton choix, et affiche uniquement son nom et son nombre de dépôts publics.
</div>

**✅ Correction.**
```powershell
$utilisateur = Invoke-RestMethod -Uri "https://api.github.com/users/octocat"
[PSCustomObject]@{ Nom = $utilisateur.name; Depots = $utilisateur.public_repos }
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.2</span>

Envoie une requête POST à une API fictive `https://api.monapp.com/notes` avec un corps JSON `{ "titre": "Réunion", "contenu": "Notes de la réunion" }`, en gérant proprement un éventuel échec.
</div>

**✅ Correction.**
```powershell
$corps = @{ titre = "Réunion"; contenu = "Notes de la réunion" } | ConvertTo-Json

try {
    $resultat = Invoke-RestMethod -Uri "https://api.monapp.com/notes" -Method Post -Body $corps -ContentType "application/json"
    Write-Output "Note créée avec l'identifiant $($resultat.id)"
} catch {
    Write-Warning "Échec de la création : $($_.Exception.Message)"
}
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 21.3</span>

Écris une fonction `Invoke-ApiSecurisee` qui prend une URL et un jeton en paramètres, effectue un GET authentifié, et retourne `$null` proprement (sans planter le script) en cas d'échec, avec un message d'avertissement.
</div>

**✅ Correction du défi.**
```powershell
function Invoke-ApiSecurisee {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Uri,

        [Parameter(Mandatory=$true)]
        [string]$Token
    )

    try {
        $enTetes = @{ Authorization = "Bearer $Token" }
        return Invoke-RestMethod -Uri $Uri -Headers $enTetes
    } catch {
        Write-Warning "Appel API échoué sur $Uri : $($_.Exception.Message)"
        return $null
    }
}
```

## 🎯 Ce que tu sais maintenant

- `Invoke-WebRequest` donne la réponse HTTP complète ; `Invoke-RestMethod` parse directement le JSON en objets.
- Les quatre verbes HTTP essentiels : `GET` (lire), `POST` (créer), `PUT` (remplacer), `DELETE` (supprimer).
- `ConvertTo-Json` + `-ContentType "application/json"` envoient un corps JSON correctement interprété.
- Un jeton Bearer s'envoie via l'en-tête `Authorization`, et doit toujours être traité comme un secret.

*Chapitre suivant : la sécurité — UAC, permissions NTFS, Execution Policy et gestion des secrets.*
