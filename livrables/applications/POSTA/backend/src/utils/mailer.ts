import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

// Best-effort, jamais bloquant : un SMTP mal configuré ou en panne ne doit jamais faire
// échouer l'action métier (création de compte, demande de reset...) qui déclenche l'email.
export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    // En l'absence de SMTP configuré (dev local), on affiche le contenu au lieu de l'envoyer,
    // pour pouvoir suivre les liens (reset, invitation...) sans dépendre d'un vrai SMTP.
    logger.warn({ to, subject, html }, 'SMTP non configuré (SMTP_HOST manquant) : email non envoyé, contenu ci-dessous');
    return;
  }
  try {
    await t.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    logger.error({ err, to, subject }, "Échec d'envoi d'email");
  }
}
