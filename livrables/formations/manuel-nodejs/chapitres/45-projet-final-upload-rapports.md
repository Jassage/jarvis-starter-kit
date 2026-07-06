<div class="chapitre-titre-num">CHAPITRE 45</div>

# Projet final — Upload de documents et génération de rapports

## 45.1 Upload de documents médicaux liés à un patient

```js
// src/config/multer.js — repris du chapitre 26
const multer = require("multer");
const path = require("path");

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const suffixe = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${suffixe}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: stockage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo, adapté à des résultats d'examens scannés
  fileFilter: (req, file, cb) => {
    const typesAutorises = ["application/pdf", "image/jpeg", "image/png"];
    if (!typesAutorises.includes(file.mimetype)) {
      return cb(new Error("Format non autorisé (PDF, JPEG, PNG uniquement)"));
    }
    cb(null, true);
  },
});

module.exports = upload;
```

```js
// src/services/documents.service.js
const DocumentRepository = require("../repositories/documents.repository");
const PatientService = require("./patients.service");

async function ajouterDocument(patientId, fichier, typeDocument) {
  await PatientService.obtenirPatient(patientId); // vérifie l'existence du patient (chapitre 43)

  return DocumentRepository.creer({
    patientId,
    nomFichier: fichier.originalname,
    cheminFichier: `/uploads/${fichier.filename}`,
    typeDocument,
  });
}

async function listerDocumentsPatient(patientId) {
  await PatientService.obtenirPatient(patientId);
  return DocumentRepository.listerParPatient(patientId);
}

module.exports = { ajouterDocument, listerDocumentsPatient };
```

```js
// src/controllers/documents.controller.js
const asyncHandler = require("../utils/asyncHandler");
const DocumentService = require("../services/documents.service");

const ajouter = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Aucun fichier fourni" });

  const document = await DocumentService.ajouterDocument(
    Number(req.params.patientId),
    req.file,
    req.body.typeDocument
  );
  res.status(201).json(document);
});

module.exports = { ajouter };
```

```js
// src/routes/documents.routes.js
const router = require("express").Router({ mergeParams: true }); // mergeParams : accède à req.params du router parent
const upload = require("../config/multer");
const documentsController = require("../controllers/documents.controller");

router.post("/", upload.single("document"), documentsController.ajouter);

module.exports = router;
```

```js
// src/routes/patients.routes.js — montage imbriqué
router.use("/:patientId/documents", require("./documents.routes"));
// URL finale : POST /api/patients/:patientId/documents
```

<div class="encadre astuce">
<span class="encadre-titre">💡 mergeParams: true : accéder aux paramètres du router parent</span>
Sans cette option, le router `documents.routes.js`, monté sous `/:patientId/documents`, ne pourrait **pas** accéder à `req.params.patientId` depuis ses propres gestionnaires de route — `mergeParams` fusionne les paramètres du router parent avec ceux du router enfant.
</div>

## 45.2 Servir les documents de façon sécurisée (pas en accès statique direct)

```js
// src/controllers/documents.controller.js (ajout)
const fs = require("fs");
const path = require("path");

const telecharger = asyncHandler(async (req, res) => {
  const document = await DocumentRepository.trouverParId(Number(req.params.id));
  if (!document) return res.status(404).json({ message: "Document introuvable" });

  const cheminAbsolu = path.join(__dirname, "../..", document.cheminFichier);
  res.download(cheminAbsolu, document.nomFichier); // force le téléchargement, avec vérification d'authentification EN AMONT
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rappel du chapitre 26 : ne jamais exposer /uploads en accès statique direct pour du contenu sensible</span>
Des documents médicaux sont des données **hautement sensibles** — la route `telecharger` ci-dessus passe par le middleware `authentifier` (comme toute route du router patients), garantissant qu'un accès non authentifié ne peut jamais atteindre un fichier, contrairement à un simple `express.static("uploads")` qui rendrait tout le dossier public sans aucune vérification.
</div>

## 45.3 Rapport d'activité : consultations par période et par médecin

```js
// src/services/rapports.service.js
const prisma = require("../config/prisma");

async function genererRapportActivite(dateDebut, dateFin) {
  const [totalConsultations, parMedecin, parJour] = await Promise.all([
    prisma.consultation.count({
      where: { date: { gte: dateDebut, lte: dateFin } },
    }),

    prisma.consultation.groupBy({
      by: ["medecinId"],
      where: { date: { gte: dateDebut, lte: dateFin } },
      _count: { id: true },
    }),

    prisma.$queryRaw`
      SELECT DATE("date") as jour, COUNT(*) as nombre
      FROM "Consultation"
      WHERE "date" BETWEEN ${dateDebut} AND ${dateFin}
      GROUP BY DATE("date")
      ORDER BY jour
    `,
  ]);

  // Enrichir parMedecin avec le nom du médecin (Prisma groupBy ne joint pas automatiquement)
  const medecinIds = parMedecin.map((r) => r.medecinId);
  const medecins = await prisma.utilisateur.findMany({
    where: { id: { in: medecinIds } },
    select: { id: true, nom: true },
  });

  const parMedecinAvecNom = parMedecin.map((r) => ({
    medecin: medecins.find((m) => m.id === r.medecinId)?.nom,
    nombreConsultations: r._count.id,
  }));

  return { totalConsultations, parMedecin: parMedecinAvecNom, evolutionQuotidienne: parJour };
}

module.exports = { genererRapportActivite };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 $queryRaw : quand Prisma seul ne suffit pas</span>
Le regroupement par jour calendaire (`DATE("date")`) est une opération que l'API déclarative de Prisma ne couvre pas nativement — `$queryRaw` permet d'exécuter du SQL brut **paramétré en toute sécurité** (les valeurs interpolées via des template literals restent protégées contre l'injection SQL, rappel du chapitre 25) quand un besoin dépasse ce que l'ORM propose directement.
</div>

## 45.4 Export du rapport en PDF (aperçu)

```js
// Génération d'un PDF simple avec pdfkit
const PDFDocument = require("pdfkit");

async function genererRapportPDF(rapport, res) {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=rapport-activite.pdf");

  doc.pipe(res); // le PDF est directement STREAMÉ vers la réponse HTTP, sans fichier temporaire sur disque

  doc.fontSize(18).text("Rapport d'activité MediAPI", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Total consultations : ${rapport.totalConsultations}`);

  rapport.parMedecin.forEach((ligne) => {
    doc.text(`${ligne.medecin} : ${ligne.nombreConsultations} consultations`);
  });

  doc.end();
}
```

## 45.5 Résumé du chapitre

- L'upload de documents médicaux réutilise directement Multer (chapitre 26), avec des routes imbriquées (`mergeParams`) sous `/patients/:patientId/documents`.
- Les documents sensibles sont servis via une route authentifiée (`res.download`), jamais en accès statique direct.
- `groupBy` et `$queryRaw` combinés permettent des rapports agrégés riches, au-delà des simples requêtes CRUD.
- Un PDF de rapport peut être généré et streamé directement dans la réponse HTTP, sans fichier intermédiaire.

*Chapitre suivant : la documentation Swagger complète de MediAPI et sa suite de tests.*
