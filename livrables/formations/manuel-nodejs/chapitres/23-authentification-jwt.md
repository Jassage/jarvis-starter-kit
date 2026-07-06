<div class="chapitre-titre-num">CHAPITRE 23</div>

# Authentification JWT

## Objectifs pédagogiques

Comprendre le principe des JSON Web Tokens, implémenter la connexion et le middleware de vérification, et adopter le modèle access/refresh token pour une sécurité robuste.

## 23.1 Le problème : HTTP est sans état (stateless)

Chaque requête HTTP est, par nature, **indépendante** des précédentes — le serveur ne "se souvient" pas nativement qu'un utilisateur s'est connecté lors d'une requête antérieure. Un mécanisme d'authentification doit permettre à chaque nouvelle requête de **prouver** l'identité de l'utilisateur, sans redemander email/mot de passe à chaque fois.

## 23.2 Qu'est-ce qu'un JWT

Un **JWT** (*JSON Web Token*) est une chaîne encodée en trois parties, séparées par des points : `en-tête.charge_utile.signature`.

```{.uml}
JWT décodé (structure) :

en-tête (header)          : { "alg": "HS256", "typ": "JWT" }
charge utile (payload)    : { "id": 42, "email": "jaslin@mail.com", "role": "ADMIN", "exp": 1735689600 }
signature                 : calculée à partir des deux premières parties + une clé secrète
                             (garantit que le token n'a pas été MODIFIÉ depuis sa création)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un JWT est encodé, PAS chiffré : son contenu est lisible par n'importe qui</span>
N'importe qui peut décoder un JWT (essaie sur jwt.io) et lire son contenu — seule la **signature** empêche de le modifier sans être détecté (falsifier le rôle "ADMIN", par exemple). Ne jamais placer d'information sensible (mot de passe, numéro de carte) dans le payload d'un JWT.
</div>

## 23.3 Générer un JWT à la connexion

```
$ npm install jsonwebtoken
```

```js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function connecter(email, motDePasse) {
  const utilisateur = await UtilisateurRepository.trouverParEmail(email);
  if (!utilisateur || !(await bcrypt.compare(motDePasse, utilisateur.motDePasseHash))) {
    throw new NonAutoriseError("Email ou mot de passe incorrect");
  }

  const token = jwt.sign(
    { id: utilisateur.id, email: utilisateur.email, role: utilisateur.role }, // le payload
    process.env.JWT_SECRET, // la clé secrète, JAMAIS codée en dur (rappel du chapitre 12)
    { expiresIn: "15m" } // durée de vie courte pour un access token (section 23.6)
  );

  return { token, utilisateur };
}
```

## 23.4 Middleware de vérification du token

```js
// src/middlewares/authentifier.middleware.js
const jwt = require("jsonwebtoken");
const { NonAutoriseError } = require("../errors");

function authentifier(req, res, next) {
  const enTete = req.headers.authorization; // format attendu : "Bearer eyJhbGci..."

  if (!enTete || !enTete.startsWith("Bearer ")) {
    return next(new NonAutoriseError("Token d'authentification manquant"));
  }

  const token = enTete.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // lève une erreur si invalide/expiré
    req.utilisateur = payload; // attache l'utilisateur décodé à la requête, pour les middlewares/contrôleurs suivants
    next();
  } catch (erreur) {
    next(new NonAutoriseError("Token invalide ou expiré"));
  }
}

module.exports = authentifier;
```

```js
// routes/utilisateurs.routes.js
const authentifier = require("../middlewares/authentifier.middleware");

router.get("/profil", authentifier, utilisateursController.obtenirProfil);
```

```js
// controllers/utilisateurs.controller.js
async function obtenirProfil(req, res) {
  // req.utilisateur a été attaché par le middleware authentifier — contient { id, email, role }
  const utilisateur = await UtilisateurService.trouverParId(req.utilisateur.id);
  res.json(utilisateur);
}
```

## 23.5 Où stocker le token côté client (aperçu, développé côté frontend)

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel des risques déjà détaillés côté frontend</span>
Le manuel React de ce même auteur détaille en profondeur ce sujet (chapitres 26 et 28) : stocker un token longue durée dans `localStorage` l'expose au vol via une faille XSS. La bonne pratique reste un **access token court en mémoire** côté client + un **refresh token en cookie httpOnly** — exactement le modèle détaillé dans la section suivante, côté serveur cette fois.
</div>

## 23.6 Le modèle access token + refresh token

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un seul token longue durée est un risque de sécurité</span>
Un JWT unique valable 7 jours, s'il est volé (XSS, interception réseau non chiffrée), reste utilisable **jusqu'à son expiration naturelle** — aucun moyen de le révoquer immédiatement. Le modèle à deux tokens résout ce problème.
</div>

```js
async function connecter(email, motDePasse) {
  const utilisateur = await verifierIdentifiants(email, motDePasse);

  const accessToken = jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" } // COURTE durée : même volé, son impact reste limité dans le temps
  );

  const refreshToken = jwt.sign(
    { id: utilisateur.id },
    process.env.JWT_REFRESH_SECRET, // clé DIFFÉRENTE de celle de l'access token
    { expiresIn: "7d" } // LONGUE durée, mais révocable (section suivante)
  );

  // Stocker le refresh token (haché) en base, pour pouvoir le révoquer explicitement
  await RefreshTokenRepository.creer({ utilisateurId: utilisateur.id, tokenHash: hacherToken(refreshToken) });

  return { accessToken, refreshToken };
}
```

```js
// Route de rafraîchissement : échange un refresh token valide contre un nouvel access token
async function rafraichir(req, res, next) {
  try {
    const { refreshToken } = req.cookies; // envoyé via un cookie httpOnly, jamais accessible en JavaScript client
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const tokenEnBase = await RefreshTokenRepository.trouver(payload.id, hacherToken(refreshToken));
    if (!tokenEnBase || tokenEnBase.revoque) {
      throw new NonAutoriseError("Session invalide, merci de te reconnecter");
    }

    const nouvelAccessToken = jwt.sign({ id: payload.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: nouvelAccessToken });
  } catch (erreur) {
    next(new NonAutoriseError("Session expirée"));
  }
}
```

## 23.7 Déconnexion réelle : révoquer le refresh token

```js
async function deconnecter(utilisateurId, refreshToken) {
  await RefreshTokenRepository.revoquer(utilisateurId, hacherToken(refreshToken));
  // Le refresh token ne pourra PLUS jamais être échangé contre un nouvel access token,
  // même s'il n'a pas encore expiré naturellement.
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi stocker le refresh token (haché) en base</span>
Contrairement à l'access token (vérifié uniquement par sa signature, sans aller en base — rapide), le refresh token est vérifié **contre une entrée en base de données**, ce qui permet de le révoquer **immédiatement** (déconnexion, changement de mot de passe, compte compromis) — un access token JWT classique, lui, ne peut jamais être invalidé avant sa propre expiration naturelle, d'où l'intérêt de le garder très court (15 minutes).
</div>

## 23.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser la même clé secrète pour access token et refresh token</span>
Utiliser `JWT_SECRET` unique pour les deux types de tokens signifie qu'une fuite de cette clé compromet l'ensemble du système d'authentification en une seule fois. Deux clés distinctes (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) limitent l'impact d'une éventuelle fuite partielle.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne pas vérifier l'expiration côté serveur, se fier uniquement au client</span>
`jwt.verify()` vérifie **automatiquement** l'expiration (`exp`) et lève une erreur si le token est expiré — ne jamais désactiver cette vérification, et ne jamais faire confiance à un token juste parce que le client prétend qu'il est encore valide.
</div>

## 23.9 Résumé du chapitre

- Un JWT est encodé (lisible par tous), pas chiffré ; seule sa signature garantit qu'il n'a pas été altéré.
- `jwt.sign()` génère un token signé avec une clé secrète ; `jwt.verify()` le vérifie et lève une erreur s'il est invalide/expiré.
- Le modèle access token (courte durée, vérifié par signature seule) + refresh token (longue durée, vérifié en base, révocable) limite l'impact d'un vol de token.
- Deux clés secrètes distinctes pour access et refresh tokens réduisent l'impact d'une fuite partielle.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 23.1</span>

Écris le middleware `authentifier` (section 23.4) en gérant explicitement le cas où le token est expiré (`TokenExpiredError` de la librairie `jsonwebtoken`) avec un message différent d'un token simplement invalide.
</div>

**Corrigé :**
```js
function authentifier(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete?.startsWith("Bearer ")) {
    return next(new NonAutoriseError("Token manquant"));
  }
  const token = enTete.split(" ")[1];

  try {
    req.utilisateur = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (erreur) {
    if (erreur.name === "TokenExpiredError") {
      return next(new NonAutoriseError("Session expirée, merci de te reconnecter"));
    }
    next(new NonAutoriseError("Token invalide"));
  }
}
```

*Chapitre suivant : l'autorisation basée sur les rôles (RBAC), pour contrôler précisément qui peut faire quoi une fois authentifié.*
