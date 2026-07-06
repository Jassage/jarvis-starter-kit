<div class="chapitre-titre-num">CHAPITRE 43</div>

# Projet final — CRUD complets

## 43.1 Patients : repository, service, contrôleur

```js
// src/repositories/patients.repository.js
const prisma = require("../config/prisma");

async function creer(donnees) {
  return prisma.patient.create({ data: donnees });
}
async function trouverParId(id) {
  return prisma.patient.findUnique({ where: { id } });
}
async function rechercherEtLister({ recherche, page, limite }) {
  const filtres = recherche ? { nom: { contains: recherche, mode: "insensitive" } } : {};
  const [patients, total] = await Promise.all([
    prisma.patient.findMany({ where: filtres, skip: (page - 1) * limite, take: limite, orderBy: { nom: "asc" } }),
    prisma.patient.count({ where: filtres }),
  ]);
  return { patients, total };
}
async function modifier(id, donnees) {
  return prisma.patient.update({ where: { id }, data: donnees });
}
async function supprimer(id) {
  return prisma.patient.delete({ where: { id } });
}

module.exports = { creer, trouverParId, rechercherEtLister, modifier, supprimer };
```

```js
// src/services/patients.service.js
const PatientRepository = require("../repositories/patients.repository");
const { NonTrouveError } = require("../errors");

async function creerPatient(donnees) {
  return PatientRepository.creer(donnees);
}

async function obtenirPatient(id) {
  const patient = await PatientRepository.trouverParId(id);
  if (!patient) throw new NonTrouveError("Patient introuvable");
  return patient;
}

async function listerPatients({ recherche, page = 1, limite = 20 }) {
  const { patients, total } = await PatientRepository.rechercherEtLister({ recherche, page, limite });
  return { donnees: patients, pagination: { page, limite, total, totalPages: Math.ceil(total / limite) } };
}

async function modifierPatient(id, donnees) {
  await obtenirPatient(id); // vérifie l'existence avant modification (lève NonTrouveError sinon)
  return PatientRepository.modifier(id, donnees);
}

async function supprimerPatient(id) {
  await obtenirPatient(id);
  return PatientRepository.supprimer(id);
}

module.exports = { creerPatient, obtenirPatient, listerPatients, modifierPatient, supprimerPatient };
```

```js
// src/controllers/patients.controller.js
const asyncHandler = require("../utils/asyncHandler");
const PatientService = require("../services/patients.service");

const creer = asyncHandler(async (req, res) => {
  const patient = await PatientService.creerPatient(req.body);
  res.status(201).json(patient);
});

const obtenir = asyncHandler(async (req, res) => {
  const patient = await PatientService.obtenirPatient(Number(req.params.id));
  res.json(patient);
});

const lister = asyncHandler(async (req, res) => {
  const resultat = await PatientService.listerPatients({
    recherche: req.query.recherche,
    page: Number(req.query.page) || 1,
    limite: Number(req.query.limite) || 20,
  });
  res.json(resultat);
});

const modifier = asyncHandler(async (req, res) => {
  const patient = await PatientService.modifierPatient(Number(req.params.id), req.body);
  res.json(patient);
});

const supprimer = asyncHandler(async (req, res) => {
  await PatientService.supprimerPatient(Number(req.params.id));
  res.status(204).send();
});

module.exports = { creer, obtenir, lister, modifier, supprimer };
```

## 43.2 Consultations : logique métier avec relation patient + médecin

```js
// src/services/consultations.service.js
const ConsultationRepository = require("../repositories/consultations.repository");
const PatientService = require("./patients.service");

async function creerConsultation({ patientId, medecinId, motif, diagnostic, prescriptions }) {
  await PatientService.obtenirPatient(patientId); // vérifie que le patient existe réellement (lève NonTrouveError sinon)

  return ConsultationRepository.creer({
    patientId,
    medecinId,
    motif,
    diagnostic,
    prescriptions,
    date: new Date(),
  });
}

async function listerConsultationsPatient(patientId) {
  await PatientService.obtenirPatient(patientId);
  return ConsultationRepository.listerParPatient(patientId);
}

module.exports = { creerConsultation, listerConsultationsPatient };
```

```js
// src/repositories/consultations.repository.js
const prisma = require("../config/prisma");

async function creer(donnees) {
  return prisma.consultation.create({
    data: donnees,
    include: { medecin: { select: { nom: true } }, patient: { select: { nom: true } } },
  });
}

async function listerParPatient(patientId) {
  return prisma.consultation.findMany({
    where: { patientId },
    include: { medecin: { select: { nom: true } } },
    orderBy: { date: "desc" },
  });
}

module.exports = { creer, listerParPatient };
```

## 43.3 Rendez-vous : gestion des statuts (enum)

```prisma
model RendezVous {
  id         Int             @id @default(autoincrement())
  patient    Patient         @relation(fields: [patientId], references: [id])
  patientId  Int
  medecin    Utilisateur     @relation("MedecinRendezVous", fields: [medecinId], references: [id])
  medecinId  Int
  dateHeure  DateTime
  statut     StatutRendezVous @default(PLANIFIE)
}

enum StatutRendezVous {
  PLANIFIE
  CONFIRME
  ANNULE
  TERMINE
}
```

```js
// src/services/rendezvous.service.js
const RendezVousRepository = require("../repositories/rendezvous.repository");
const { ValidationError } = require("../errors");

const TRANSITIONS_AUTORISEES = {
  PLANIFIE: ["CONFIRME", "ANNULE"],
  CONFIRME: ["TERMINE", "ANNULE"],
  ANNULE: [],
  TERMINE: [],
};

async function changerStatut(rendezVousId, nouveauStatut) {
  const rendezVous = await RendezVousRepository.trouverParId(rendezVousId);
  if (!rendezVous) throw new NonTrouveError("Rendez-vous introuvable");

  if (!TRANSITIONS_AUTORISEES[rendezVous.statut].includes(nouveauStatut)) {
    throw new ValidationError(`Transition ${rendezVous.statut} → ${nouveauStatut} non autorisée`);
  }

  return RendezVousRepository.modifierStatut(rendezVousId, nouveauStatut);
}

module.exports = { changerStatut };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une machine à états explicite évite les transitions incohérentes</span>
`TRANSITIONS_AUTORISEES` empêche par exemple de faire passer un rendez-vous directement de `ANNULE` à `TERMINE` — une règle métier centralisée dans le service, testable indépendamment (chapitre 29), plutôt que dispersée dans plusieurs contrôleurs.
</div>

## 43.4 Routes complètes assemblées

```js
// src/routes/patients.routes.js
const router = require("express").Router();
const authentifier = require("../middlewares/authentifier.middleware");
const autoriser = require("../middlewares/autoriser.middleware");
const { valider } = require("../middlewares/valider.middleware");
const { creerPatientSchema, modifierPatientSchema } = require("../validators/patients.validator");
const patientsController = require("../controllers/patients.controller");

router.use(authentifier); // TOUTES les routes de ce router exigent une authentification

router.get("/", autoriser("ADMIN", "MEDECIN", "RECEPTIONNISTE"), patientsController.lister);
router.post("/", autoriser("ADMIN", "RECEPTIONNISTE"), valider(creerPatientSchema), patientsController.creer);
router.get("/:id", autoriser("ADMIN", "MEDECIN", "RECEPTIONNISTE"), patientsController.obtenir);
router.put("/:id", autoriser("ADMIN", "RECEPTIONNISTE"), valider(modifierPatientSchema), patientsController.modifier);
router.delete("/:id", autoriser("ADMIN"), patientsController.supprimer);

module.exports = router;
```

## 43.5 Résumé du chapitre

- Patients, consultations et rendez-vous suivent tous le même patron architectural (repository → service → contrôleur) du chapitre 17.
- Les consultations valident l'existence du patient avant création, réutilisant directement `PatientService.obtenirPatient`.
- Les rendez-vous appliquent une machine à états explicite (`TRANSITIONS_AUTORISEES`), centralisant une règle métier autrement facile à contourner.
- Chaque route applique précisément les rôles autorisés selon l'action (lecture vs écriture vs suppression), reflet direct du chapitre 24.

*Chapitre suivant : le schéma Prisma complet et les migrations, pour formaliser l'ensemble du modèle de données de MediAPI.*
