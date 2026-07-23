import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { kreyol } from "./kreyol";
import { francais } from "./francais";

export const LANGUES = ["ht", "fr"] as const;
export type Langue = (typeof LANGUES)[number];

const CLE_STOCKAGE = "tcheke.langue";

/**
 * Kreyol par defaut (decision produit : la langue du public, pas celle du
 * telephone). Le francais reste disponible via le selecteur dans Parametres.
 * Le choix est persiste localement, pas dans Firestore (pas besoin de compte
 * pour changer de langue).
 */
export async function initI18n(): Promise<void> {
  const sauvegardee = (await AsyncStorage.getItem(CLE_STOCKAGE)) as Langue | null;
  const langueInitiale: Langue = sauvegardee ?? "ht";

  await i18n.use(initReactI18next).init({
    resources: {
      ht: { translation: kreyol },
      fr: { translation: francais },
    },
    lng: langueInitiale,
    fallbackLng: "ht",
    interpolation: { escapeValue: false },
  });
}

export async function changerLangue(langue: Langue): Promise<void> {
  await i18n.changeLanguage(langue);
  await AsyncStorage.setItem(CLE_STOCKAGE, langue);
}

export default i18n;
