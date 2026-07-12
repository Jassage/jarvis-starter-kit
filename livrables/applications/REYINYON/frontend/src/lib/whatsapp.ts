// Génère un message d'invitation prêt à coller sur WhatsApp — le brief exclut
// explicitement toute automatisation d'envoi complète (nécessiterait l'API
// WhatsApp Business officielle, hors périmètre), seulement un texte prêt à
// partager + un lien wa.me qui ouvre WhatsApp avec le texte pré-rempli.
export function genererMessageInvitation(params: {
  titre: string;
  lienReunion: string;
  codeAcces?: string | null;
  numeroDialIn?: string | null;
  codeTelephone?: string | null;
}): string {
  const lignes = [`📹 Invitation — ${params.titre}`, '', `Rejoignez la réunion : ${params.lienReunion}`];

  if (params.codeAcces) {
    lignes.push(`Code d'accès : ${params.codeAcces}`);
  }

  if (params.numeroDialIn && params.codeTelephone) {
    lignes.push('', `Pas de data fiable ? Appelez : ${params.numeroDialIn}`, `Code réunion (au clavier) : ${params.codeTelephone}`);
  }

  return lignes.join('\n');
}

export function construireLienWhatsapp(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
