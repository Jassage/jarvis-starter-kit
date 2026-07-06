<div class="chapitre-titre-num">CHAPITRE 27</div>

# Envoi d'e-mails (Nodemailer)

## Objectifs pédagogiques

Configurer l'envoi d'e-mails transactionnels (confirmation de compte, réinitialisation de mot de passe) avec Nodemailer, et gérer proprement les échecs d'envoi.

## 27.1 Configuration de base avec Nodemailer

```
$ npm install nodemailer
```

```js
// src/config/mailer.js
const nodemailer = require("nodemailer");

const transporteur = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465", // true pour le port 465 (SSL direct), false pour 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

module.exports = transporteur;
```

## 27.2 Envoyer un e-mail simple

```js
const transporteur = require("../config/mailer");

async function envoyerEmailBienvenue(destinataire, nom) {
  await transporteur.sendMail({
    from: '"Mon Application" <no-reply@monapp.com>',
    to: destinataire,
    subject: "Bienvenue sur Mon Application !",
    text: `Bonjour ${nom}, bienvenue !`, // version texte brut (fallback)
    html: `<h1>Bonjour ${nom}</h1><p>Bienvenue sur notre plateforme !</p>`,
  });
}
```

## 27.3 Templates d'e-mails avec des variables

```js
// src/templates/reinitialisationMotDePasse.js
function genererTemplateReinitialisation(nom, lienReinitialisation) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Réinitialisation de mot de passe</h2>
      <p>Bonjour ${nom},</p>
      <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe (valable 1 heure) :</p>
      <a href="${lienReinitialisation}" style="background:#2e8b57;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">
        Réinitialiser mon mot de passe
      </a>
      <p style="color:#888;font-size:12px;margin-top:20px;">
        Si tu n'as pas demandé cette réinitialisation, ignore cet e-mail.
      </p>
    </div>
  `;
}

module.exports = { genererTemplateReinitialisation };
```

```js
async function envoyerEmailReinitialisation(utilisateur, token) {
  const lien = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe?token=${token}`;

  await transporteur.sendMail({
    from: '"Mon Application" <no-reply@monapp.com>',
    to: utilisateur.email,
    subject: "Réinitialisation de ton mot de passe",
    html: genererTemplateReinitialisation(utilisateur.nom, lien),
  });
}
```

## 27.4 Ne jamais bloquer une requête HTTP sur l'envoi d'un e-mail

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'envoi d'e-mail peut être lent ou échouer, sans que ce soit un vrai problème métier</span>
```js
// ❌ Si le serveur SMTP est lent ou en panne, TOUTE la requête d'inscription échoue ou traîne
async function inscrire(req, res, next) {
  const utilisateur = await UtilisateurService.creer(req.body);
  await envoyerEmailBienvenue(utilisateur.email, utilisateur.nom); // bloque la réponse HTTP !
  res.status(201).json(utilisateur);
}
```
```js
// ✅ L'inscription réussit indépendamment de l'envoi d'e-mail ; l'échec d'envoi est journalisé, pas bloquant
async function inscrire(req, res, next) {
  const utilisateur = await UtilisateurService.creer(req.body);

  envoyerEmailBienvenue(utilisateur.email, utilisateur.nom).catch((erreur) => {
    logger.error("Échec d'envoi de l'e-mail de bienvenue", { erreur: erreur.message, email: utilisateur.email });
  }); // PAS de "await" ici : ne bloque pas la réponse au client

  res.status(201).json(utilisateur);
}
```
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Pour un besoin critique (email de réinitialisation), une file d'attente est plus robuste</span>
Sur un système à fort trafic, déléguer l'envoi d'e-mails à une **file d'attente** (comme BullMQ avec Redis) avec des tentatives automatiques en cas d'échec est plus robuste qu'un simple `.catch()` silencieux — un sujet avancé, mentionné ici pour orienter une évolution future du projet final (chapitre 41).
</div>

## 27.5 Tester les e-mails en développement sans vrai serveur SMTP

```
$ npm install --save-dev nodemailer  # déjà installé, utiliser son compte de test intégré
```

```js
// Ethereal (via Nodemailer) : un faux service SMTP pour le développement, capture les e-mails sans les envoyer réellement
const compteTest = await nodemailer.createTestAccount();

const transporteurTest = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: { user: compteTest.user, pass: compteTest.pass },
});

const info = await transporteurTest.sendMail({ /* ... */ });
console.log("Aperçu de l'e-mail :", nodemailer.getTestMessageUrl(info)); // lien pour VOIR l'e-mail envoyé
```

## 27.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser des identifiants SMTP réels dans un environnement de test/CI</span>
Les tests automatisés (chapitre 29-30) ne devraient **jamais** envoyer de vrais e-mails à de vraies adresses. Utiliser un service de test (Ethereal) ou simuler complètement le transporteur (`jest.mock`) dans l'environnement de test.
</div>

## 27.7 Résumé du chapitre

- Nodemailer configure un transporteur SMTP réutilisable pour tout l'envoi d'e-mails de l'application.
- Les templates HTML avec variables interpolées produisent des e-mails transactionnels professionnels.
- L'envoi d'e-mail ne doit jamais bloquer la réponse HTTP principale ; un échec d'envoi doit être journalisé, pas nécessairement bloquant pour l'utilisateur.
- Ethereal (via Nodemailer) permet de tester l'envoi d'e-mails en développement sans jamais envoyer de vrais messages.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.1</span>

Écris une fonction `envoyerEmailConfirmationCommande(commande)` qui envoie un e-mail récapitulatif (numéro de commande, montant total) sans bloquer la réponse HTTP du contrôleur qui l'appelle.
</div>

**Corrigé :**
```js
async function envoyerEmailConfirmationCommande(commande) {
  await transporteur.sendMail({
    from: '"Ma Boutique" <no-reply@maboutique.com>',
    to: commande.clientEmail,
    subject: `Confirmation de votre commande #${commande.id}`,
    html: `<p>Merci pour votre commande de ${commande.total} HTG.</p>`,
  });
}

// Dans le contrôleur :
envoyerEmailConfirmationCommande(commande).catch((e) => logger.error("Échec email commande", { erreur: e.message }));
res.status(201).json(commande);
```

*Chapitre suivant : la documentation Swagger/OpenAPI, pour documenter l'API de façon interactive et exploitable par d'autres développeurs.*
