import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Konekte <noreply@konekte.ht>";
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3001";

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${BASE_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Vérifie ton adresse email — Konekte",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
        <h2 style="color:#D4537E;margin-bottom:8px">❤ Konekte</h2>
        <p>Bienvenue ! Clique sur le bouton ci-dessous pour vérifier ton adresse email.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#D4537E;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">
          Vérifier mon email
        </a>
        <p style="color:#9ca3af;font-size:13px">Ce lien expire dans 24h. Si tu n'as pas créé de compte, ignore cet email.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Réinitialisation de ton mot de passe — Konekte",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
        <h2 style="color:#D4537E;margin-bottom:8px">❤ Konekte</h2>
        <p>Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#D4537E;color:#fff;border-radius:999px;text-decoration:none;font-weight:600">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#9ca3af;font-size:13px">Ce lien expire dans 1h. Si tu n'as pas fait cette demande, ignore cet email.</p>
      </div>
    `,
  });
}
