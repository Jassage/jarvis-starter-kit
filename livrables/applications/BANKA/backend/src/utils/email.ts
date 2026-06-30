import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || 'BANKA <noreply@banka.ht>';

export async function sendPasswordResetEmail(opts: {
  to: string;
  nom: string;
  resetUrl: string;
}): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: FROM,
    to: opts.to,
    subject: 'Réinitialisation de votre mot de passe BANKA',
    text: [
      `Bonjour ${opts.nom},`,
      '',
      'Vous avez demandé la réinitialisation de votre mot de passe BANKA.',
      'Cliquez sur le lien ci-dessous — il expire dans 1 heure :',
      '',
      opts.resetUrl,
      '',
      'Si vous n\'avez pas fait cette demande, ignorez cet email. Votre mot de passe reste inchangé.',
      '',
      'Cordialement,',
      'L\'équipe BANKA',
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1e3a5f;padding:20px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">BANKA</h1>
  </div>
  <div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="color:#1e3a5f;margin-top:0">Réinitialisation du mot de passe</h2>
    <p>Bonjour <strong>${opts.nom}</strong>,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe BANKA.</p>
    <p>Cliquez sur le bouton ci-dessous. Ce lien expire dans <strong>1 heure</strong>.</p>
    <div style="text-align:center;margin:30px 0">
      <a href="${opts.resetUrl}"
         style="background:#1e3a5f;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="color:#666;font-size:14px">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${opts.resetUrl}" style="color:#1e3a5f;word-break:break-all">${opts.resetUrl}</a>
    </p>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
    <p style="color:#999;font-size:12px">
      Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe reste inchangé.
    </p>
  </div>
</body>
</html>`,
  });
}
