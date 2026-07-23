/** Dictionnaire Kreyol (langue par defaut de l'app). */
export const kreyol = {
  onglet: {
    bolet: "Bòlèt",
    tauxChanj: "To Chanj",
    estatistik: "Estatistik",
    plis: "Plis",
  },
  bolet: {
    titre: "Rezilta Bòlèt",
    jodiA: "Jodi a",
    ofisyèl: "Ofisyèl",
    apTann: "Ap tann",
    midi: "Midi",
    aswè: "Aswè",
    premyeLo: "1ye lo",
    dezyemLo: "2èm lo",
    twazyemLo: "3èm lo",
    lotto3: "Lotto 3",
    lotto4: "Lotto 4",
    pataje: "Pataje sou WhatsApp",
    detayTiraj: "Detay tiraj",
    dènyeTiraj: "Dènye tiraj yo",
  },
  tchèke: {
    titre: "Tchèke nimewo w",
    soustit: "Antre yon boul, gade si l soti",
    boulSoti: "Boul ou an soti! 🎉",
    boulPaSoti: "Boul sa a pa soti jodi a",
    efase: "Efase",
    boutonTchèke: "Tchèke",
  },
  estatistik: {
    titre: "Estatistik boul",
    soustit: "Frekans sou 30 dènye jou",
    boulCho: "Boul cho",
    boulFrèt: "Boul frèt",
    tout: "Tout",
    avètisman: "Estatistik pou enfòmasyon sèlman. Sa ki pase pa garanti sa k ap vini.",
  },
  tauxChanj: {
    titre: "To Dola Ameriken",
    referansBrh: "Referans BRH",
    achte: "Achte",
    vann: "Vann",
    nanMache: "nan mache a",
    kalkilatè: "Kalkilatè",
    kontribye: "To ou wè yon lòt kote? Kontribye pou kominote a",
    depiYè: "depi yè",
  },
  paramèt: {
    titre: "Paramèt",
    lang: "Lang",
    aparans: "Aparans",
    mòdNwit: "Mòd nwit",
    otomatik: "Otomatik dapre telefòn nan",
    notifikasyon: "Notifikasyon",
    rezilteBolet: "Rezilta bòlèt",
    avètiRezilta: "Avèti m lè yon tiraj soti",
    alèTo: "Alèt to dola",
    siDepase: "Si dola depase {{seuil}} HTG",
  },
  onboarding: {
    byenveni: "Byenveni nan TCHEKE",
    soustitreByenveni: "Rezilta bòlèt ak to dola, chak jou, san konplike.",
    swivan: "Swivan",
    notifTitre: "Pa janm manke yon rezilta",
    notifSoustitre: "Resevwa yon notifikasyon osito yon tiraj soti.",
    aktive: "Aktive notifikasyon",
    pasKounyeA: "Pa kounye a",
    kòmanse: "Kòmanse",
  },
  komen: {
    ok: "Oke",
    anile: "Anile",
    chajman: "L ap chaje...",
    pAKoneksyon: "Ou pa konekte. N ap montre dènye done ki sove yo.",
  },
};

/**
 * Type derive avec des `string` larges (pas de litteraux) pour chaque texte,
 * afin que francais.ts puisse fournir ses propres valeurs sans etre force de
 * reprendre mot pour mot les chaines kreyol.
 */
type Elargir<T> = { [K in keyof T]: T[K] extends object ? Elargir<T[K]> : string };
export type Dictionnaire = Elargir<typeof kreyol>;
