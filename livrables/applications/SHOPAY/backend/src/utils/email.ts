import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
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

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Best-effort, jamais bloquant : un SMTP mal configuré ou en panne ne doit jamais faire
// échouer l'action métier (inscription, mot de passe oublié...) qui déclenche l'email.
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const t = getTransporter();
  if (!t) {
    // En l'absence de SMTP configuré (dev local), on affiche le contenu au lieu de l'envoyer,
    // pour pouvoir suivre les liens (vérification, reset...) sans dépendre d'un vrai SMTP.
    logger.warn({ to, subject, html }, 'SMTP non configuré (SMTP_HOST manquant) : email non envoyé, contenu ci-dessous');
    return;
  }
  try {
    await t.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    logger.error({ err, to, subject }, "Échec d'envoi d'email");
  }
}

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#0EA5E9;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0">${title}</h1>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
        ${bodyHtml}
      </div>
    </div>
  `;
}

export function emailVerificationTemplate(firstName: string, token: string): string {
  const link = `${env.FRONTEND_URL}/verify-email/${token}`;
  return layout(
    'SHOPAY',
    `<h2>Bonjour ${firstName},</h2>
     <p>Merci de vous être inscrit sur SHOPAY. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.</p>
     <div style="text-align:center;margin:30px 0">
       <a href="${link}" style="background:#0EA5E9;color:white;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Vérifier mon email</a>
     </div>
     <p style="color:#666;font-size:12px">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>`
  );
}

export function passwordResetTemplate(firstName: string, token: string): string {
  const link = `${env.FRONTEND_URL}/reset-password/${token}`;
  return layout(
    'SHOPAY',
    `<h2>Bonjour ${firstName},</h2>
     <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
     <div style="text-align:center;margin:30px 0">
       <a href="${link}" style="background:#0EA5E9;color:white;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">Réinitialiser mon mot de passe</a>
     </div>
     <p style="color:#666;font-size:12px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>`
  );
}
