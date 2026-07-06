<div class="chapitre-titre-num">CHAPITRE 42</div>

# Projet final — Authentification et gestion des utilisateurs/rôles

## 42.1 Le schéma Utilisateur

```prisma
// prisma/schema.prisma (extrait)
model Utilisateur {
  id             Int      @id @default(autoincrement())
  nom            String
  email          String   @unique
  motDePasseHash String
  role           Role     @default(RECEPTIONNISTE)
  consultations  Consultation[] @relation("MedecinConsultations")
  rendezVous     RendezVous[]    @relation("MedecinRendezVous")
  createdAt      DateTime @default(now())
}

enum Role {
  ADMIN
  MEDECIN
  RECEPTIONNISTE
}
```

## 42.2 Service d'authentification complet

```js
// src/services/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UtilisateurRepository = require("../repositories/utilisateurs.repository");
const { NonAutoriseError, ConflitError } = require("../errors");

async function inscrire({ nom, email, motDePasse, role }) {
  const existant = await UtilisateurRepository.trouverParEmail(email);
  if (existant) {
    throw new ConflitError("Cet email est déjà utilisé");
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const utilisateur = await UtilisateurRepository.creer({ nom, email, motDePasseHash, role });

  const { motDePasseHash: _, ...utilisateurSansMotDePasse } = utilisateur;
  return utilisateurSansMotDePasse;
}

async function connecter(email, motDePasse) {
  const utilisateur = await UtilisateurRepository.trouverParEmail(email);
  if (!utilisateur || !(await bcrypt.compare(motDePasse, utilisateur.motDePasseHash))) {
    throw new NonAutoriseError("Email ou mot de passe incorrect");
  }

  const accessToken = jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: utilisateur.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await UtilisateurRepository.enregistrerRefreshToken(utilisateur.id, refreshToken);

  return { accessToken, refreshToken, utilisateur: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role } };
}

async function rafraichir(refreshToken) {
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const tokenValide = await UtilisateurRepository.verifierRefreshToken(payload.id, refreshToken);

  if (!tokenValide) {
    throw new NonAutoriseError("Session invalide, merci de te reconnecter");
  }

  const utilisateur = await UtilisateurRepository.trouverParId(payload.id);
  const nouvelAccessToken = jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
  return { accessToken: nouvelAccessToken };
}

async function deconnecter(utilisateurId) {
  await UtilisateurRepository.revoquerRefreshTokens(utilisateurId);
}

module.exports = { inscrire, connecter, rafraichir, deconnecter };
```

## 42.3 Contrôleur et routes d'authentification

```js
// src/controllers/auth.controller.js
const asyncHandler = require("../utils/asyncHandler");
const AuthService = require("../services/auth.service");

const inscrire = asyncHandler(async (req, res) => {
  const utilisateur = await AuthService.inscrire(req.body);
  res.status(201).json(utilisateur);
});

const connecter = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, utilisateur } = await AuthService.connecter(req.body.email, req.body.motDePasse);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, utilisateur });
});

const rafraichir = asyncHandler(async (req, res) => {
  const resultat = await AuthService.rafraichir(req.cookies.refreshToken);
  res.json(resultat);
});

const deconnecter = asyncHandler(async (req, res) => {
  await AuthService.deconnecter(req.utilisateur.id);
  res.clearCookie("refreshToken");
  res.status(204).send();
});

module.exports = { inscrire, connecter, rafraichir, deconnecter };
```

```js
// src/routes/auth.routes.js
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const { valider } = require("../middlewares/valider.middleware");
const { inscrireSchema, connecterSchema } = require("../validators/auth.validator");
const authentifier = require("../middlewares/authentifier.middleware");
const autoriser = require("../middlewares/autoriser.middleware");

const limiteurAuth = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.post("/inscription", authentifier, autoriser("ADMIN"), valider(inscrireSchema), authController.inscrire);
router.post("/connexion", limiteurAuth, valider(connecterSchema), authController.connecter);
router.post("/rafraichir", authController.rafraichir);
router.post("/deconnexion", authentifier, authController.deconnecter);

module.exports = router;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi l'inscription est réservée à un ADMIN</span>
Contrairement à une application grand public (comme MiniCours ou GestionCommerciale des manuels React/Java de ce même auteur), un système hospitalier ne permet pas l'auto-inscription libre : seul un administrateur crée les comptes du personnel (médecins, réceptionnistes), d'où la route `/inscription` elle-même protégée par `authentifier` + `autoriser("ADMIN")`.
</div>

## 42.4 Middlewares réutilisés tels quels

```js
// src/middlewares/autoriser.middleware.js — repris directement du chapitre 24
function autoriser(...rolesAutorises) {
  return function (req, res, next) {
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return next(new AccesRefuseError("Droits insuffisants"));
    }
    next();
  };
}
```

```js
// Utilisation sur les routes patients/consultations (détaillé au chapitre 43)
router.get("/patients", authentifier, autoriser("ADMIN", "MEDECIN", "RECEPTIONNISTE"), patientsController.lister);
router.delete("/patients/:id", authentifier, autoriser("ADMIN"), patientsController.supprimer);
```

## 42.5 Schéma de validation Zod pour l'authentification

```js
// src/validators/auth.validator.js
const { z } = require("zod");

const inscrireSchema = z.object({
  nom: z.string().min(2).max(100),
  email: z.string().email(),
  motDePasse: z.string().min(8),
  role: z.enum(["ADMIN", "MEDECIN", "RECEPTIONNISTE"]),
});

const connecterSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

module.exports = { inscrireSchema, connecterSchema };
```

## 42.6 Résumé du chapitre

- MediAPI reprend exactement le modèle access/refresh token du chapitre 23, avec un refresh token en cookie httpOnly.
- L'inscription est une route protégée (`ADMIN` uniquement), reflet du contexte métier hospitalier fermé.
- Les middlewares `authentifier`/`autoriser` (chapitres 23-24) et la validation Zod (chapitre 18) s'appliquent identiquement à toutes les routes du reste du projet.

*Chapitre suivant : les CRUD complets pour patients, consultations et rendez-vous.*
