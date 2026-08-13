<div class="chapitre-titre-num">CHAPITRE 45</div>

# Projet final — Upload de documents et génération de rapports

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Implémenter l'upload de documents médicaux liés à un patient et la génération de rapports d'activité agrégés, en réutilisant directement Multer (chapitre 26) et les techniques d'agrégation Prisma (chapitre 34). À la fin de ce chapitre, MediAPI pourra stocker des résultats d'examens en toute sécurité et produire des rapports exportables en PDF.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Lors d'un audit de sécurité rapide avant la mise en production, tu remarques qu'une version antérieure du projet servait le dossier `uploads/` directement via `express.static("uploads")`. N'importe qui connaissant (ou devinant) l'URL d'un fichier pouvait télécharger le résultat d'examen d'un patient, sans la moindre authentification — une fuite de données médicales potentiellement grave, exactement le genre d'erreur que ce chapitre corrige structurellement dès la conception, pas en rustine après coup.
</div>

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
Des documents médicaux sont des données **hautement sensibles** — la route `telecharger` ci-dessus passe par le middleware `authentifier` (comme toute route du router patients), garantissant qu'un accès non authentifié ne peut jamais atteindre un fichier, contrairement à un simple `express.static("uploads")` qui rendrait tout le dossier public sans aucune vérification. Exactement la faille corrigée dans la mise en situation d'ouverture.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — au-delà de l'authentification, vérifier aussi l'autorisation</span>
L'authentification seule ne suffit pas : un `MEDECIN` connecté ne devrait accéder qu'aux documents pertinents pour son activité, pas nécessairement à ceux de tous les patients sans distinction — rappel de la vigilance IDOR du chapitre 24, applicable ici à chaque téléchargement de document.
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

## Atelier — Corriger et vérifier la faille de la mise en situation

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 45 — De l'accès public à la sécurisation complète</span>

**Objectif** : reproduire puis corriger exactement la faille découverte dans la mise en situation d'ouverture.

**Préparation** : MediAPI avec authentification (chapitre 42) et le module documents de ce chapitre.

**Étapes détaillées** :
1. Configure temporairement `app.use("/uploads", express.static("uploads"))` (reproduisant la version vulnérable).
2. Upload un document de test via l'API, note l'URL générée du fichier.
3. Depuis un navigateur en navigation privée (sans être connecté à l'API), essaie d'accéder directement à cette URL : observe que le fichier est accessible sans authentification.
4. Retire cette ligne `express.static`, implémente la route `telecharger` sécurisée (section 45.2).
5. Reteste : l'accès direct doit maintenant échouer (401), et seul un accès via l'API authentifiée (avec le bon token) doit réussir.

**Validation** : après correction, aucun document ne doit être accessible sans passer par l'authentification, quelle que soit la façon dont l'URL a été obtenue.

**Résultat attendu** : la démonstration complète que la faille de la mise en situation d'ouverture est corrigée, pas seulement masquée.

**Dépannage** : si l'accès direct fonctionne encore après correction, vérifie qu'aucune autre route `express.static` pointant vers le dossier `uploads/` ne subsiste ailleurs dans `app.js`.

**Nettoyage** : supprime le document de test uploadé.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Servir /uploads en accès statique direct pour du contenu sensible</span>
Exactement la faille de la mise en situation d'ouverture — une pratique acceptable pour des images publiques (avatars, photos de produits) mais catastrophique pour des documents médicaux ou tout contenu confidentiel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier mergeParams: true sur un router imbriqué</span>
Sans cette option, `req.params.patientId` resterait `undefined` dans les routes de `documents.routes.js`, provoquant une erreur silencieuse ou un comportement incorrect lors de l'association d'un document à un patient.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : req.params.patientId est undefined dans un router imbriqué</span>

- **Cause** : `mergeParams: true` manquant lors de la création du router enfant (erreur fréquente n°2).
- **Solution** : ajouter `{ mergeParams: true }` à `express.Router()` dans le router imbriqué concerné.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un fichier reste accessible sans authentification</span>

- **Cause probable** : une route `express.static` pointant encore vers le dossier d'uploads (erreur fréquente n°1).
- **Solution** : retirer cette route, servir exclusivement via un contrôleur authentifié (section 45.2).
</div>

## En entreprise

- **Audit de sécurité avant chaque mise en production** : la découverte de la mise en situation d'ouverture illustre pourquoi un audit systématique (même rapide) avant le déploiement d'un projet manipulant des données sensibles est une pratique standard, pas une option.
- **Rapports d'activité comme livrable client fréquent** : la génération de rapports agrégés exportables (PDF, section 45.4) est une demande récurrente dans la quasi-totalité des projets de gestion de ce portefeuille (BANKA, GESCOM, OTELA) — un savoir-faire transversal réutilisable.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment sécuriserais-tu l'accès à des fichiers uploadés contenant des données sensibles ?"**
Réponse attendue : ne jamais les servir via un accès statique public ; toujours passer par une route authentifiée qui vérifie les droits avant de streamer le fichier, exactement le pattern de la section 45.2.

**Q2. "À quoi sert mergeParams: true sur un router Express imbriqué ?"**
Réponse attendue : permet au router enfant d'accéder aux paramètres d'URL définis par le router parent (comme `:patientId`), sinon ces paramètres resteraient inaccessibles dans les gestionnaires de route du router enfant.

**Q3. "Pourquoi utiliser $queryRaw alors que Prisma propose déjà une API de requête ?"**
Réponse attendue : certaines opérations (comme un regroupement par jour calendaire) dépassent les capacités de l'API déclarative de Prisma ; `$queryRaw` permet du SQL brut tout en restant protégé contre l'injection SQL via des paramètres correctement liés.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Pour un contenu aussi sensible que des documents médicaux, envisager un chiffrement au repos (chiffrement du fichier sur disque, déchiffré uniquement à la demande) en complément du contrôle d'accès applicatif, selon le niveau d'exigence réglementaire du projet.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Streamer directement le PDF généré vers la réponse HTTP (`doc.pipe(res)`, section 45.4) évite d'écrire un fichier temporaire sur disque puis de le relire — plus rapide et plus propre pour un document généré à la demande.
</div>

## Résumé du chapitre

- L'upload de documents médicaux réutilise directement Multer (chapitre 26), avec des routes imbriquées (`mergeParams`) sous `/patients/:patientId/documents`.
- Les documents sensibles sont servis via une route authentifiée (`res.download`), jamais en accès statique direct — une correction structurelle, pas une rustine.
- `groupBy` et `$queryRaw` combinés permettent des rapports agrégés riches, au-delà des simples requêtes CRUD.
- Un PDF de rapport peut être généré et streamé directement dans la réponse HTTP, sans fichier intermédiaire.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Comment servir un document médical sensible en toute sécurité ?
   - a) Via express.static("uploads") directement
   - b) Via une route authentifiée qui vérifie les droits avant de streamer le fichier
   - c) En le rendant public avec un nom de fichier difficile à deviner
   - d) Peu importe, ce n'est jamais un vrai risque

2. À quoi sert mergeParams: true ?
   - a) À fusionner deux bases de données
   - b) À permettre à un router enfant d'accéder aux paramètres du router parent
   - c) À accélérer les requêtes
   - d) Rien de particulier

3. Pourquoi utiliser $queryRaw dans ce chapitre ?
   - a) Prisma ne fonctionne pas avec PostgreSQL
   - b) Pour un regroupement par jour calendaire, hors de la capacité de l'API Prisma standard
   - c) Pour éviter toute validation
   - d) C'est obligatoire pour chaque requête

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. express.static("uploads") est une pratique sûre pour des documents médicaux. — **Faux**.
2. $queryRaw avec des valeurs interpolées via template literals reste protégé contre l'injection SQL avec Prisma. — **Vrai**.
3. Un PDF généré avec pdfkit doit toujours être écrit sur disque avant d'être envoyé au client. — **Faux** (peut être streamé directement).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Pourquoi la faille découverte dans la mise en situation d'ouverture est-elle particulièrement grave dans le contexte spécifique d'une application médicale, comparée à une simple application de vente en ligne ?

**Corrigé** : des données médicales sont une catégorie de données particulièrement sensible, souvent soumise à des exigences réglementaires renforcées de confidentialité (secret médical) — une fuite expose non seulement des informations personnelles, mais des informations de santé dont la divulgation peut avoir des conséquences graves pour le patient concerné (discrimination, stigmatisation). L'enjeu dépasse largement celui d'une fuite de catalogue produit ou d'informations commerciales, justifiant une vigilance de sécurité renforcée dès la conception, pas seulement une correction réactive après découverte.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 45.1</span>

Ajoute une vérification dans la route `telecharger` (section 45.2) : un `MEDECIN` ne peut télécharger que les documents des patients qu'il a lui-même consultés au moins une fois.
</div>

**Corrigé (esquisse) :**
```js
const telecharger = asyncHandler(async (req, res) => {
  const document = await DocumentRepository.trouverParId(Number(req.params.id));
  if (!document) return res.status(404).json({ message: "Document introuvable" });

  if (req.utilisateur.role === "MEDECIN") {
    const aConsulte = await prisma.consultation.findFirst({
      where: { patientId: document.patientId, medecinId: req.utilisateur.id },
    });
    if (!aConsulte) {
      return res.status(403).json({ message: "Vous n'avez pas consulté ce patient" });
    }
  }

  const cheminAbsolu = path.join(__dirname, "../..", document.cheminFichier);
  res.download(cheminAbsolu, document.nomFichier);
});
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai implémenté l'upload de documents avec Multer, lié à un patient.</li>
<li>☐ Je sers les documents exclusivement via une route authentifiée, jamais en accès statique direct.</li>
<li>☐ J'ai implémenté le rapport d'activité avec groupBy et $queryRaw.</li>
<li>☐ J'ai vérifié que mergeParams fonctionne correctement sur les routes imbriquées.</li>
<li>☐ J'ai testé la génération de PDF streamée.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il chiffrer les documents médicaux sur le disque du serveur ?</dt>
<dd>Pour un projet à faible enjeu réglementaire, le contrôle d'accès applicatif (section 45.2) suffit souvent ; pour un contexte réglementé plus strict, un chiffrement au repos additionnel est recommandé, hors périmètre détaillé de ce manuel.</dd>

<dt>Peut-on générer d'autres formats de rapport que le PDF ?</dt>
<dd>Oui, un export CSV/Excel (via `exceljs`, comme documenté dans le portefeuille de projets de cet auteur) suit un principe similaire — construire les données agrégées côté service, puis les formater dans la couche appropriée.</dd>

<dt>$queryRaw est-il moins performant que l'API Prisma standard ?</dt>
<dd>Non, il exécute une requête SQL directe, potentiellement aussi rapide (voire plus) qu'une requête générée par l'API standard — la différence est uniquement le niveau d'abstraction, pas la performance brute.</dd>
</dl>

## Références et pour aller plus loin

- Rappel du chapitre 26 (upload Multer) et 34 (ORM Prisma, $queryRaw) pour les fondations de ce chapitre.
- Documentation pdfkit : [https://pdfkit.org](https://pdfkit.org)

*Chapitre suivant : la documentation Swagger complète de MediAPI et sa suite de tests.*
