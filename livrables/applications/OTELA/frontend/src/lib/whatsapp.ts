// Même philosophie qu'ASSOCOTISE (relances) et REYINYON (invitation) : jamais
// d'envoi automatisé — on construit un lien wa.me pré-rempli, ouvert par un humain
// via son propre WhatsApp. Aucun crédit SMS, aucune API WhatsApp Business.

// Normalise un numéro haïtien : retire tout ce qui n'est pas un chiffre, préfixe
// l'indicatif 509 si absent (un numéro local à 8 chiffres n'a jamais son indicatif).
function normaliserTelephone(telephone: string): string {
  const chiffres = telephone.replace(/\D/g, '');
  if (chiffres.startsWith('509')) return chiffres;
  return `509${chiffres}`;
}

export function construireLienWhatsApp(telephone: string, message: string): string {
  const numero = normaliserTelephone(telephone);
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}
