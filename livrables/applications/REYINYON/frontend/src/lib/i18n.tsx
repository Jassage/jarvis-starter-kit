'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Langue = 'fr' | 'ht';

// Sélecteur FR/Kreyòl — le brief le demande explicitement en plus de l'anglais
// habituel des concurrents (Zoom/Meet). Dictionnaire volontairement léger (pas
// de librairie i18n complète) : seules les chaînes de l'expérience de réunion
// sont couvertes, pas l'ensemble du site.
const DICTIONNAIRE = {
  fr: {
    rejoindre: 'Rejoindre',
    votreNom: 'Votre nom',
    codeAcces: "Code d'accès",
    codeAccesOptionnel: "Code d'accès (si demandé)",
    modeDonneesMinimales: 'Mode données minimales',
    modeDonneesMinimalesHint: 'Caméra désactivée par défaut, résolution plafonnée si activée — vous maîtrisez votre consommation de data.',
    salleAttente: "En attente d'admission par l'hôte...",
    micro: 'Micro',
    camera: 'Caméra',
    partagerEcran: "Partager l'écran",
    quitter: 'Quitter',
    chat: 'Discussion',
    ecrireMessage: 'Écrire un message...',
    envoyer: 'Envoyer',
    participants: 'Participants',
    verrouillerReunion: 'Verrouiller la réunion',
    deverrouillerReunion: 'Déverrouiller la réunion',
    couperMicro: 'Couper le micro',
    couperCamera: 'Couper la caméra',
    demarrerEnregistrement: "Démarrer l'enregistrement",
    arreterEnregistrement: "Arrêter l'enregistrement",
    enregistrementEnCours: 'Enregistrement en cours',
    retirerParticipant: 'Retirer',
    admettre: 'Admettre',
    rejeterParticipant: 'Rejeter',
    connexionExcellente: 'Connexion excellente',
    connexionBonne: 'Connexion moyenne',
    connexionFaible: 'Connexion faible',
    passeEnAudioSeul: 'est passé en audio seul — connexion faible',
    inviterWhatsapp: 'Inviter par WhatsApp',
    rappelWhatsapp: 'Envoyer un rappel',
    enAttenteAdmission: "En attente d'admission",
  },
  ht: {
    rejoindre: 'Antre',
    votreNom: 'Non ou',
    codeAcces: 'Kòd aksè',
    codeAccesOptionnel: 'Kòd aksè (si yo mande l)',
    modeDonneesMinimales: 'Mòd ekonomi done',
    modeDonneesMinimalesHint: 'Kamera fèmen pa default, rezolisyon limite si w aktive l — ou kontwole konsomasyon done ou.',
    salleAttente: "W ap tann otorizasyon animatè a...",
    micro: 'Mikwo',
    camera: 'Kamera',
    partagerEcran: 'Pataje ekran',
    quitter: 'Kite',
    chat: 'Chat',
    ecrireMessage: 'Ekri yon mesaj...',
    envoyer: 'Voye',
    participants: 'Patisipan',
    verrouillerReunion: 'Fèmen reyinyon an',
    deverrouillerReunion: 'Louvri reyinyon an',
    couperMicro: 'Koupe mikwo',
    couperCamera: 'Koupe kamera',
    demarrerEnregistrement: 'Kòmanse anrejistreman',
    arreterEnregistrement: 'Sispann anrejistreman',
    enregistrementEnCours: 'Anrejistreman ap fèt',
    retirerParticipant: 'Retire',
    admettre: 'Aksepte',
    rejeterParticipant: 'Refize',
    connexionExcellente: 'Koneksyon ekselan',
    connexionBonne: 'Koneksyon mwayen',
    connexionFaible: 'Koneksyon fèb',
    passeEnAudioSeul: 'pase an mòd odyo sèlman — koneksyon fèb',
    inviterWhatsapp: 'Envite sou WhatsApp',
    rappelWhatsapp: 'Voye yon rapèl',
    enAttenteAdmission: 'W ap tann otorizasyon',
  },
} as const;

type CleTraduction = keyof (typeof DICTIONNAIRE)['fr'];

interface I18nContextValue {
  langue: Langue;
  setLangue: (l: Langue) => void;
  t: (cle: CleTraduction) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>('fr');
  const t = (cle: CleTraduction) => DICTIONNAIRE[langue][cle] ?? cle;
  return <I18nContext.Provider value={{ langue, setLangue, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé à l\'intérieur de I18nProvider');
  return ctx;
}
