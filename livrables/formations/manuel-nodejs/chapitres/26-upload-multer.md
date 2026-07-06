<div class="chapitre-titre-num">CHAPITRE 26</div>

# Téléversement de fichiers (Multer)

## Objectifs pédagogiques

Gérer l'upload de fichiers (images, documents) dans une API Express avec Multer, avec validation de type/taille et stockage local ou cloud.

## 26.1 Pourquoi un middleware dédié est nécessaire

<div class="encadre astuce">
<span class="encadre-titre">💡 multipart/form-data : un format différent du JSON habituel</span>
Un fichier ne peut pas être envoyé en JSON classique. Le navigateur (ou tout client HTTP) encode un formulaire contenant un fichier au format `multipart/form-data`, qu'`express.json()` (chapitre 13) ne sait **pas** parser — un middleware dédié comme **Multer** est nécessaire.
</div>

## 26.2 Configuration de base

```
$ npm install multer
```

```js
const multer = require("multer");
const path = require("path");

const stockage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // dossier de destination
  },
  filename: (req, file, cb) => {
    const suffixeUnique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${suffixeUnique}${path.extname(file.originalname)}`); // évite les collisions de noms
  },
});

const upload = multer({ storage: stockage });

module.exports = upload;
```

## 26.3 Middleware d'upload sur une route

```js
const upload = require("../config/multer");

// upload.single("champNom") : un SEUL fichier, attendu sous la clé "champNom" du formulaire
router.post("/utilisateurs/:id/avatar", upload.single("avatar"), avatarController.televerser);
```

```js
// controllers/avatar.controller.js
async function televerser(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const cheminRelatif = `/uploads/${req.file.filename}`;
    await UtilisateurService.mettreAJourAvatar(req.params.id, cheminRelatif);

    res.json({ message: "Avatar mis à jour", url: cheminRelatif });
  } catch (erreur) {
    next(erreur);
  }
}
```

`req.file` (singulier) contient les métadonnées du fichier téléversé : `originalname`, `filename` (nom généré), `path`, `size`, `mimetype`.

## 26.4 Plusieurs fichiers à la fois

```js
router.post("/produits/:id/photos", upload.array("photos", 5), produitsController.ajouterPhotos);
// upload.array("photos", 5) : jusqu'à 5 fichiers sous la clé "photos"
```

```js
async function ajouterPhotos(req, res, next) {
  try {
    const urls = req.files.map((fichier) => `/uploads/${fichier.filename}`); // req.files (pluriel) : un TABLEAU
    await ProduitService.ajouterPhotos(req.params.id, urls);
    res.json({ urls });
  } catch (erreur) {
    next(erreur);
  }
}
```

## 26.5 Valider le type et la taille des fichiers

```js
const upload = multer({
  storage: stockage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo maximum
  },
  fileFilter: (req, file, cb) => {
    const typesAutorises = ["image/jpeg", "image/png", "image/webp"];
    if (!typesAutorises.includes(file.mimetype)) {
      return cb(new Error("Format de fichier non autorisé (JPEG, PNG, WebP uniquement)"));
    }
    cb(null, true); // accepte le fichier
  },
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le mimetype envoyé par le client n'est pas totalement fiable</span>
`file.mimetype` provient d'un en-tête envoyé par le **client**, potentiellement falsifiable par un attaquant renommant un fichier malveillant avec une extension/mimetype trompeur. Pour une validation réellement robuste, une vérification du contenu réel du fichier (via une librairie comme `file-type`, qui inspecte les premiers octets du fichier plutôt que de faire confiance à l'en-tête déclaré) est recommandée pour les cas sensibles.
</div>

## 26.6 Gérer les erreurs Multer spécifiquement

```js
const multer = require("multer");

function gestionnaireErreurs(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Fichier trop volumineux" });
    }
    return res.status(400).json({ message: err.message });
  }
  // ... reste du gestionnaire d'erreurs centralisé (chapitre 19) ...
  next(err);
}
```

## 26.7 Stockage local vs cloud (S3, Cloudinary)

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi le stockage local ne suffit pas toujours en production</span>
`multer.diskStorage` écrit les fichiers directement sur le disque du serveur — fonctionne bien en développement ou sur un serveur unique, mais pose problème dès qu'il y a **plusieurs instances** du serveur (chapitre 39) : chaque instance aurait son propre disque, sans partage automatique des fichiers uploadés. En production, un stockage **cloud** (Amazon S3, Cloudinary, Google Cloud Storage) centralisé et accessible depuis toutes les instances est généralement préférable.
</div>

```js
// Exemple avec multer-storage-cloudinary (aperçu, configuration Cloudinary omise pour la brièveté)
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const stockageCloudinary = new CloudinaryStorage({
  cloudinary,
  params: { folder: "avatars", allowed_formats: ["jpg", "png", "webp"] },
});

const uploadCloud = multer({ storage: stockageCloudinary });
```

## 26.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de créer le dossier de destination</span>
Si le dossier `uploads/` n'existe pas physiquement, Multer lève une erreur au moment de l'upload. Toujours s'assurer que le dossier existe au démarrage de l'application (via `fs.mkdir(..., { recursive: true })`, rappel du chapitre 11), plutôt que de découvrir le problème seulement au premier upload réel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Servir le dossier uploads/ sans aucune restriction</span>
```js
app.use("/uploads", express.static("uploads")); // ⚠️ rend TOUT le contenu du dossier publiquement accessible
```
Si des fichiers sensibles ou privés (documents personnels, pièces d'identité) sont stockés dans ce dossier, les rendre tous accessibles publiquement via une simple URL est une fuite de données potentielle — pour du contenu sensible, préférer une route authentifiée qui sert le fichier après vérification des droits, plutôt qu'un accès statique direct.
</div>

## 26.9 Résumé du chapitre

- Multer gère l'upload multipart/form-data, qu'`express.json()` ne peut pas parser.
- `upload.single("champ")` pour un fichier, `upload.array("champ", max)` pour plusieurs.
- `limits` et `fileFilter` valident taille et type déclaré, mais le mimetype client reste falsifiable pour des besoins réellement sensibles.
- Le stockage local convient au développement ; un stockage cloud partagé est nécessaire dès plusieurs instances de serveur.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.1</span>

Configure Multer pour n'accepter que des fichiers PDF de moins de 2 Mo, sur une route `POST /documents`.
</div>

**Corrigé :**
```js
const uploadDocument = multer({
  storage: stockage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les fichiers PDF sont acceptés"));
    }
    cb(null, true);
  },
});

router.post("/documents", uploadDocument.single("document"), documentsController.creer);
```

*Chapitre suivant : l'envoi d'e-mails avec Nodemailer.*
