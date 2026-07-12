// Point d'intégration dial-in téléphonique.
//
// État réel (mis à jour) : Jaslin a un compte Twilio et un numéro (américain,
// pas local Haïti — cf. avertissement ci-dessous). L'IVR (décrocher l'appel,
// demander le code de réunion à 6 chiffres au clavier, identifier la réunion)
// est RÉELLEMENT implémenté et testé avec un vrai appel — cf.
// modules/telephony/telephony.controller.ts (`accueil`, `valider`). Ce qui
// reste NON fait, documenté ci-dessous : le pont audio réel vers LiveKit (SIP)
// — un appelant qui compose le bon code entend une confirmation vocale, mais
// n'est pas encore connecté au flux audio de la réunion.
//
// ⚠️ POINT À VÉRIFIER EN PREMIER, AVANT DE PAYER QUOI QUE CE SOIT : la
// couverture Twilio pour Haïti (+509) en numéros LOCAUX vocaux est incertaine
// — beaucoup de fournisseurs internationaux (Twilio inclus, historiquement)
// n'offrent PAS de numéros locaux haïtiens en self-service, seulement
// certains pays. Avant de créer un compte : aller sur
// https://www.twilio.com/en-us/guidelines/regulatory (ou console Twilio >
// Phone Numbers > Buy a Number > filtrer Haiti) et confirmer qu'un numéro
// LOCAL (pas juste SMS, pas juste mobile) est réellement en vente. Si Haïti
// n'est pas couvert, deux alternatives à évaluer avec Jaslin avant de coder :
//   a) Un numéro international (ex. +1 américain) — moins "local" mais
//      fonctionne partout, contournable avec du crédit d'appel international.
//   b) Un fournisseur télécom local haïtien (Digicel/Natcom Business) avec
//      une offre SIP trunk — plus proche du besoin réel mais probablement
//      plus lent à intégrer (pas de self-service API comme Twilio).
//
// Checklist :
// 1. ✅ Compte Twilio créé, identité/paiement vérifiés.
// 2. ✅ Numéro acheté (américain — voir avertissement ci-dessus, pas local Haïti).
// 3. ✅ IVR : décrocher l'appel, demander le code à 6 chiffres au clavier,
//    identifier la réunion — `telephony.controller.ts`, testé avec un vrai
//    appel via un tunnel public temporaire (cloudflared).
// 4. ❌ Configurer LiveKit SIP (composant séparé à ajouter au docker-compose,
//    cf. https://docs.livekit.io/sip/quickstart/ — un `sip.yaml` + le
//    conteneur `livekit/sip`, sur le même principe que `livekit.yaml`/
//    `egress` déjà en place) : créer un SIP Trunk entrant + une Dispatch Rule
//    associant les appels à une room selon le code composé.
// 5. ❌ Configurer le numéro Twilio en "Elastic SIP Trunking" pointant vers
//    l'IP/domaine du SIP trunk LiveKit (nécessite un serveur avec IP publique
//    stable ET un certificat TLS — un déploiement réel, pas ce sandbox local).
//    Une fois fait, remplacer le <Say> de confirmation dans
//    `telephony.controller.ts::valider` par un <Dial><Sip> vers le trunk.
// 6. ❌ Gérer plusieurs appels simultanés sur la même réunion : chaque appel
//    obtiendrait sa propre identité LiveKit (même génération que
//    `participants.service.ts::rejoindre`, à réutiliser plutôt que dupliquer),
//    le code composé au clavier servant uniquement à router vers la bonne
//    room, pas à distinguer les appelants entre eux (chacun a un CallSid
//    Twilio unique, utilisable comme `nomAffiche` par défaut : "Appelant ...").
//
// Interface :

import { env } from '../config/env';

export interface AppelEntrant {
  callSid: string;
  numeroAppelant: string;
  codeReunionSaisi?: string;
}

export interface TelephonyProvider {
  // La vraie logique IVR vit désormais dans modules/telephony/telephony.controller.ts
  // (accueil/valider) — cette méthode n'est qu'un point d'extension pour le
  // futur pont SIP (étapes 4-6 de la checklist ci-dessus, non implémentées).
  gererAppelEntrant(appel: AppelEntrant): Promise<string>;
  // Numéro affiché dans l'invitation WhatsApp (cf. frontend/src/lib/whatsapp.ts).
  obtenirNumeroDialIn(): string | null;
}

export const telephonyProvider: TelephonyProvider = {
  async gererAppelEntrant() {
    throw new Error('Pont audio SIP vers LiveKit non branché — cf. étapes 4-6 de la checklist en tête de fichier.');
  },
  obtenirNumeroDialIn() {
    return env.TWILIO_PHONE_NUMBER || null;
  },
};
