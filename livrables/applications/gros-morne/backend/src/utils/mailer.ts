import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

// Phase 4 : envoi réel de newsletter. Aucun identifiant SMTP réel n'est disponible dans cet
// environnement (jamais fourni par Jaslin) — même pattern que POSTA (mot de passe oublié) :
// no-op gracieux tant que la config est incomplète, le contenu est journalisé plutôt que
// silencieusement perdu, et rien n'échoue en amont (le formulaire admin reste utilisable).
const SMTP_CONFIGURE =
  !!env.SMTP_HOST && !!env.SMTP_PORT && !!env.SMTP_USER && !!env.SMTP_PASS && !!env.SMTP_FROM;

let transporteur: Transporter | null = null;

function getTransporteur(): Transporter {
  if (!transporteur) {
    transporteur = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporteur;
}

export interface EnvoiEmail {
  destinataires: string[];
  sujet: string;
  texte: string;
}

export interface ResultatEnvoi {
  envoyeReellement: boolean;
  destinatairesTouches: number;
}

// Envoi individuel (pas de champ "To" groupé) : évite d'exposer la liste des abonnés entre
// eux si un client mail affiche les destinataires, cohérent avec une pratique newsletter
// standard. Les échecs individuels ne bloquent pas les envois suivants ; le compte final
// reflète les envois réellement réussis.
export async function envoyerNewsletter({ destinataires, sujet, texte }: EnvoiEmail): Promise<ResultatEnvoi> {
  if (!SMTP_CONFIGURE) {
    console.log(
      `[mailer] SMTP non configuré — newsletter journalisée au lieu d'être envoyée.\n` +
        `Destinataires (${destinataires.length}): ${destinataires.join(', ')}\nSujet: ${sujet}\n${texte}`
    );
    return { envoyeReellement: false, destinatairesTouches: destinataires.length };
  }

  const transport = getTransporteur();
  let reussites = 0;
  for (const destinataire of destinataires) {
    try {
      await transport.sendMail({ from: env.SMTP_FROM, to: destinataire, subject: sujet, text: texte });
      reussites += 1;
    } catch (err) {
      console.error(`[mailer] Échec d'envoi à ${destinataire}:`, err);
    }
  }
  return { envoyeReellement: true, destinatairesTouches: reussites };
}
