<div class="chapitre-titre-num">CHAPITRE 42</div>

# Projet final — Authentification et gestion des utilisateurs/rôles

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Implémenter le module d'authentification complet de MediAPI, en réutilisant exactement le modèle access/refresh token du chapitre 23 et le RBAC du chapitre 24, adaptés au contexte spécifique d'un système hospitalier fermé. À la fin de ce chapitre, MediAPI disposera d'une fondation d'authentification prête à protéger tous les modules suivants.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le médecin-directeur de la clinique (rappel du chapitre 41) insiste sur un point : "je ne veux surtout pas que n'importe qui puisse créer un compte sur le système — seul moi, ou la personne que je désigne, doit pouvoir ajouter un membre du personnel." C'est une contrainte métier réelle qui change directement la conception technique : contrairement à une application grand public où l'inscription est ouverte à tous, MediAPI doit fermer complètement cette porte, ne laissant que l'administrateur créer de nouveaux comptes. Ce chapitre construit exactement ce module, réutilisant les fondations des chapitres 22 à 24 sans les réinventer.
</div>

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
Contrairement à une application grand public (comme MiniCours ou GestionCommerciale des manuels React/Java de ce même auteur), un système hospitalier ne permet pas l'auto-inscription libre : seul un administrateur crée les comptes du personnel (médecins, réceptionnistes), d'où la route `/inscription` elle-même protégée par `authentifier` + `autoriser("ADMIN")`. Exactement la contrainte exprimée par le médecin-directeur dans la mise en situation d'ouverture.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Remarque essentielle sur cette route : `router.post("/inscription", authentifier, autoriser("ADMIN"), ...)` place les middlewares d'authentification et d'autorisation **avant** le contrôleur, exactement l'ordre critique enseigné au chapitre 14 — inverser cet ordre romprait la protection de cette route sensible.
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

## Atelier — Implémenter et vérifier le module d'authentification

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 42 — De l'inscription fermée à la session complète</span>

**Objectif** : implémenter ce module dans le squelette du chapitre 41, et vérifier chaque contrainte métier de la mise en situation d'ouverture.

**Préparation** : le squelette MediAPI de l'atelier 41, une base PostgreSQL de test.

**Étapes détaillées** :
1. Ajoute le modèle `Utilisateur` au schéma Prisma (section 42.1), lance la migration.
2. Implémente le service, le contrôleur et les routes d'authentification (sections 42.2-42.3).
3. Crée un premier compte `ADMIN` directement via un script de seed (puisque `/inscription` exige déjà d'être authentifié en `ADMIN` — un problème d'amorçage classique).
4. Teste avec Postman : connexion de l'admin, puis utilisation de son token pour créer un compte `MEDECIN` via `/inscription`.
5. Teste qu'un compte `MEDECIN` fraîchement créé reçoit bien un 403 s'il tente d'appeler `/inscription` lui-même.

**Validation** : seul un `ADMIN` authentifié doit pouvoir créer un nouveau compte ; toute tentative sans authentification ou avec un rôle insuffisant doit être rejetée (401 ou 403 selon le cas).

**Résultat attendu** : exactement le comportement demandé par le médecin-directeur dans la mise en situation d'ouverture, vérifié en conditions réelles.

**Dépannage** : si le tout premier compte admin ne peut pas être créé (problème d'amorçage), c'est normal et attendu — un script de seed direct en base (contournant l'API) est la solution standard pour ce cas précis, documentée dans de nombreux projets de ce portefeuille.

**Nettoyage** : aucun, ce module reste la fondation du reste du projet.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier le problème d'amorçage du premier compte admin</span>
Si `/inscription` exige déjà d'être `ADMIN`, comment créer le tout premier compte admin ? Ce problème, souvent découvert tardivement, doit être anticipé dès la conception — un script de seed (`prisma/seed.js`) créant un premier compte admin directement en base est la solution standard, jamais une route d'inscription non protégée "juste pour la première fois".
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Dupliquer la logique JWT au lieu de réutiliser le chapitre 23</span>
Réimplémenter différemment la génération de tokens pour "s'adapter" au contexte hospitalier, plutôt que de réutiliser directement le pattern déjà éprouvé du chapitre 23, introduit un risque de régression et une incohérence inutile avec le reste du portefeuille.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : impossible de créer le tout premier compte utilisateur</span>

- **Cause** : `/inscription` exige déjà un compte `ADMIN` authentifié pour fonctionner — un problème d'amorçage normal (erreur fréquente n°1), pas un bug.
- **Solution** : créer le premier compte admin via un script de seed direct en base de données, jamais via l'API elle-même.
</div>

## En entreprise

- **Amorçage des systèmes fermés** : ce problème du "premier compte admin" est extrêmement fréquent dans tout système sans inscription publique (rappel du même défi rencontré sur ASSOCOTISE dans ce portefeuille) — un script de seed dédié est la solution standard de l'industrie.
- **Réutilisation de patterns d'authentification éprouvés** : dans une vraie équipe, le module d'authentification est souvent le code le moins "réinventé" d'un projet à l'autre, précisément parce que les erreurs de sécurité y sont les plus coûteuses.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment créer le tout premier compte administrateur si l'inscription elle-même exige d'être admin ?"**
Réponse attendue : via un script de seed exécuté directement contre la base de données, contournant l'API pour cette unique opération d'amorçage — jamais en affaiblissant temporairement la protection de la route d'inscription.

**Q2. "Pourquoi restreindre l'inscription à un rôle ADMIN dans certains systèmes ?"**
Réponse attendue : quand le contexte métier exige un contrôle strict de qui peut accéder au système (personnel hospitalier, employés d'une entreprise), l'auto-inscription libre n'a pas de sens — seule une personne de confiance doit pouvoir créer de nouveaux comptes.

**Q3. "Ce module d'authentification diffère-t-il fondamentalement de celui du chapitre 23 ?"**
Réponse attendue : non, il réutilise exactement le même modèle access/refresh token — seule la règle métier autour de qui peut créer un compte change, pas le mécanisme d'authentification lui-même.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le rate limiter sur `/connexion` (5 tentatives/15 min, rappel du chapitre 25) reste indispensable même dans un système fermé — un compte du personnel reste une cible pour une attaque par force brute, au même titre que n'importe quel compte utilisateur.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documenter explicitement, dans le `README.md` du projet, la procédure de création du premier compte admin (script de seed) — une étape facilement oubliée par un nouveau développeur découvrant le projet sans ce contexte.
</div>

## Résumé du chapitre

- MediAPI reprend exactement le modèle access/refresh token du chapitre 23, avec un refresh token en cookie httpOnly.
- L'inscription est une route protégée (`ADMIN` uniquement), reflet du contexte métier hospitalier fermé.
- Le problème d'amorçage du premier compte admin se résout par un script de seed, jamais par une route non protégée.
- Les middlewares `authentifier`/`autoriser` (chapitres 23-24) et la validation Zod (chapitre 18) s'appliquent identiquement à toutes les routes du reste du projet.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Qui peut créer un nouveau compte utilisateur dans MediAPI ?
   - a) N'importe quel visiteur
   - b) Uniquement un ADMIN déjà authentifié
   - c) Uniquement un MEDECIN
   - d) Personne, jamais

2. Comment créer le tout premier compte admin ?
   - a) Via la route /inscription normale
   - b) Via un script de seed direct en base de données
   - c) Ce n'est pas possible
   - d) En désactivant temporairement l'authentification

3. Où le refresh token est-il stocké côté client dans MediAPI ?
   - a) Dans le localStorage
   - b) Dans un cookie httpOnly
   - c) Dans l'URL
   - d) Dans le titre de la page

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. MediAPI permet l'auto-inscription libre, comme une application grand public. — **Faux**.
2. Le rate limiter sur la connexion est inutile dans un système fermé au personnel. — **Faux**.
3. Le service d'authentification de MediAPI réutilise le pattern du chapitre 23 sans réinvention. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Pourquoi la contrainte du médecin-directeur ("seul moi peut créer des comptes") a-t-elle un impact direct sur la conception technique de la route /inscription, plutôt que d'être une simple règle appliquée après coup ?

**Corrigé** : cette contrainte métier détermine directement quels middlewares protègent la route (`authentifier` + `autoriser("ADMIN")`, avant même le contrôleur), et crée un problème d'amorçage à anticiper dès la conception (comment créer le tout premier compte admin). Une règle métier de ce type n'est jamais "ajoutée après coup" sans risque — elle façonne l'architecture de la route dès sa conception, exactement pourquoi ce chapitre insiste sur la traduction directe du besoin client en décision technique.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 42.1</span>

Écris le script de seed `prisma/seed.js` qui crée le tout premier compte `ADMIN` de MediAPI, avec un mot de passe haché.
</div>

**Corrigé :**
```js
// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const motDePasseHash = await bcrypt.hash("Admin@123", 10);

  await prisma.utilisateur.upsert({
    where: { email: "admin@mediapi.ht" },
    update: {},
    create: {
      nom: "Administrateur",
      email: "admin@mediapi.ht",
      motDePasseHash,
      role: "ADMIN",
    },
  });

  console.log("Compte admin créé : admin@mediapi.ht");
}

main().finally(() => prisma.$disconnect());
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai implémenté le schéma Utilisateur avec les 3 rôles requis.</li>
<li>☐ J'ai implémenté le service d'authentification complet (inscrire, connecter, rafraîchir, déconnecter).</li>
<li>☐ J'ai créé le premier compte admin via un script de seed.</li>
<li>☐ J'ai vérifié que /inscription est bien protégée par ADMIN uniquement.</li>
<li>☐ J'ai vérifié le rate limiting sur la route de connexion.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Pourquoi ne pas simplement désactiver temporairement la protection pour créer le premier admin ?</dt>
<dd>Une fenêtre de vulnérabilité temporaire, même brève, reste un risque réel si elle est oubliée active ou exploitée pendant cette période — le script de seed élimine ce risque en ne passant jamais par l'API elle-même.</dd>

<dt>Un médecin peut-il créer un compte réceptionniste ?</dt>
<dd>Non, dans MediAPI, seul un `ADMIN` peut créer n'importe quel type de compte — cohérent avec la contrainte explicite du médecin-directeur ("seul moi peut créer des comptes").</dd>

<dt>Faut-il une route de récupération de mot de passe oublié pour MediAPI ?</dt>
<dd>Non implémentée dans cette version du projet final (hors périmètre de ce manuel), mais suivrait le même pattern que celui documenté pour POSTA ou ASSOCOTISE dans ce portefeuille — un token opaque à usage unique envoyé par email.</dd>
</dl>

## Références et pour aller plus loin

- Rappel des chapitres 22 (bcrypt), 23 (JWT) et 24 (RBAC) pour les fondations complètes de ce module.

*Chapitre suivant : les CRUD complets pour patients, consultations et rendez-vous.*
