// Persistance légère côté client, entièrement en sessionStorage (jamais
// localStorage) pour les deux besoins suivants :
// 1. reconnectToken opaque reçu à l'admission — permet la reprise de session
//    en un clic après un rechargement du MÊME onglet (brief : "rejoindre en
//    un clic depuis le même lien... sans redemander l'autorisation d'entrée
//    si la salle d'attente était déjà passée").
// 2. Jeton LiveKit et infos de session transmis de l'écran de pré-jointe à la
//    salle de réunion — jamais persisté au-delà d'une session LiveKit (le
//    jeton expire après 6h).
// localStorage a été délibérément évité : il est partagé entre TOUS les
// onglets d'une même origine (comportement standard des navigateurs, pas une
// particularité de cet environnement) — un hôte ouvrant un second onglet pour
// tester "comme un participant" reprendrait alors l'identité du premier
// onglet au lieu d'en obtenir une nouvelle. sessionStorage reste bien isolé
// par onglet tout en survivant à un simple rechargement de page.

export interface ParticipantSession {
  participantId: string;
  reconnectToken: string;
  nomAffiche: string;
}

export interface AccesSalle {
  livekitToken: string;
  livekitRoomName: string;
  titre: string;
  participantId: string;
  reconnectToken: string;
  nomAffiche: string;
  modeDonneesMinimales: boolean;
}

function cleSession(codeReunion: string) {
  return `reyinyon_participant_${codeReunion}`;
}

function cleAcces(codeReunion: string) {
  return `reyinyon_acces_${codeReunion}`;
}

export function sauvegarderSession(codeReunion: string, session: ParticipantSession) {
  sessionStorage.setItem(cleSession(codeReunion), JSON.stringify(session));
}

export function chargerSession(codeReunion: string): ParticipantSession | null {
  const brut = sessionStorage.getItem(cleSession(codeReunion));
  return brut ? (JSON.parse(brut) as ParticipantSession) : null;
}

export function sauvegarderAccesSalle(codeReunion: string, acces: AccesSalle) {
  sessionStorage.setItem(cleAcces(codeReunion), JSON.stringify(acces));
}

export function chargerAccesSalle(codeReunion: string): AccesSalle | null {
  const brut = sessionStorage.getItem(cleAcces(codeReunion));
  return brut ? (JSON.parse(brut) as AccesSalle) : null;
}
