import { Request, Response } from 'express';
import twilio from 'twilio';
import { env } from '../../config/env';
import { trouverParCodeTelephone } from '../reunions/reunions.service';
import logger from '../../utils/logger';

const { VoiceResponse } = twilio.twiml;

function urlComplete(req: Request): string {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}`;
}

// Empêche quiconque de spammer ce webhook public avec de faux appels — Twilio
// signe chaque requête avec HMAC-SHA1(authToken, url+params), impossible à
// forger sans connaître TWILIO_AUTH_TOKEN.
function verifierSignatureTwilio(req: Request): boolean {
  if (!env.TWILIO_AUTH_TOKEN) return false;
  const signature = req.header('X-Twilio-Signature');
  if (!signature) return false;
  return twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, urlComplete(req), req.body);
}

// Décroche l'appel, demande le code de réunion à 6 chiffres au clavier.
// Étape 1 de l'IVR — cf. integrations/telephony.ts pour ce qui reste hors
// périmètre (pont audio réel vers LiveKit, nécessite un déploiement public).
export async function accueil(req: Request, res: Response) {
  if (!verifierSignatureTwilio(req)) {
    logger.warn({ ip: req.ip }, 'Requête /telephony/accueil avec signature Twilio invalide, rejetée');
    res.status(403).send('Signature invalide');
    return;
  }

  const twiml = new VoiceResponse();
  const gather = twiml.gather({
    numDigits: 6,
    action: '/api/telephony/valider',
    method: 'POST',
    timeout: 10,
  });
  gather.say({ language: 'fr-FR' }, 'Bienvenue sur Reyinyon. Entrez le code de réunion à 6 chiffres.');
  twiml.say({ language: 'fr-FR' }, 'Aucune saisie reçue. Au revoir.');

  res.type('text/xml').send(twiml.toString());
}

// Étape 2 — identifie la réunion depuis les chiffres saisis. Ne fait QUE
// confirmer que la réunion a été trouvée : ne bascule pas encore l'appelant
// dans le flux audio (LiveKit SIP non branché cette session, cf. checklist).
export async function valider(req: Request, res: Response) {
  if (!verifierSignatureTwilio(req)) {
    res.status(403).send('Signature invalide');
    return;
  }

  const digits = typeof req.body.Digits === 'string' ? req.body.Digits : undefined;
  const twiml = new VoiceResponse();
  const reunion = digits ? await trouverParCodeTelephone(digits) : null;

  if (!reunion) {
    twiml.say({ language: 'fr-FR' }, 'Code invalide. Réessayez avec le lien web. Au revoir.');
  } else if (reunion.statut === 'TERMINEE') {
    twiml.say({ language: 'fr-FR' }, 'Cette réunion est déjà terminée. Au revoir.');
  } else {
    twiml.say(
      { language: 'fr-FR' },
      `Réunion trouvée : ${reunion.titre}. La connexion audio directe par téléphone n'est pas encore activée sur ce numéro. Merci de rejoindre depuis le lien web pour l'instant. Au revoir.`
    );
  }

  res.type('text/xml').send(twiml.toString());
}
