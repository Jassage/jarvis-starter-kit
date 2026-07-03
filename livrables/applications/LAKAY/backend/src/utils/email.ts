import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn(`[email] SMTP non configuré — email à "${to}" ignoré (sujet: "${subject}")`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    console.error('[email] Échec d\'envoi:', err);
  }
}

export function emailVerificationTemplate(firstName: string, token: string): string {
  const link = `${env.FRONTEND_URL}/verify-email/${token}`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#FF6B35;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0">🏠 LAKAY</h1>
        <p style="color:rgba(255,255,255,0.9);margin:4px 0 0">Plateforme immobilière haïtienne</p>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
        <h2>Bonjour ${firstName},</h2>
        <p>Merci de vous être inscrit sur LAKAY. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${link}" style="background:#FF6B35;color:white;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Vérifier mon email
          </a>
        </div>
        <p style="color:#666;font-size:12px">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
      </div>
    </div>
  `;
}

export function passwordResetTemplate(firstName: string, token: string): string {
  const link = `${env.FRONTEND_URL}/reset-password/${token}`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#FF6B35;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0">🏠 LAKAY</h1>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
        <h2>Bonjour ${firstName},</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${link}" style="background:#FF6B35;color:white;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color:#666;font-size:12px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    </div>
  `;
}

export function subscriptionActivatedTemplate(firstName: string, planName: string): string {
  const link = `${env.FRONTEND_URL}/dashboard`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#FF6B35;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0">🎉 Abonnement ${planName} activé</h1>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
        <h2>Bonjour ${firstName},</h2>
        <p>Votre paiement a bien été reçu et votre abonnement <strong>${planName}</strong> est maintenant actif pour 30 jours.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${link}" style="background:#FF6B35;color:white;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Accéder à mon tableau de bord
          </a>
        </div>
        <p style="color:#666;font-size:12px">Merci de votre confiance. L'équipe LAKAY.</p>
      </div>
    </div>
  `;
}

export function listingApprovedTemplate(firstName: string, listingTitle: string, listingId: string): string {
  const link = `${env.FRONTEND_URL}/properties/${listingId}`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#22c55e;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0">✅ Annonce approuvée</h1>
      </div>
      <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px">
        <h2>Bonjour ${firstName},</h2>
        <p>Votre annonce <strong>"${listingTitle}"</strong> a été approuvée et est maintenant visible sur LAKAY.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${link}" style="background:#22c55e;color:white;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Voir mon annonce
          </a>
        </div>
      </div>
    </div>
  `;
}
