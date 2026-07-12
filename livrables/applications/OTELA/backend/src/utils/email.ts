import nodemailer from 'nodemailer';
import { env } from '../config/env';
import logger from './logger';

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

// Best-effort : n'échoue jamais la réservation si l'envoi échoue ou si le SMTP
// n'est pas configuré (pattern POSTA/SHOPAY) — le contenu est loggé en dev.
export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    logger.info({ to, subject, html }, '📧 Email (SMTP non configuré, contenu loggé)');
    return;
  }
  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    logger.error(err, `Échec envoi email à ${to}`);
  }
}
