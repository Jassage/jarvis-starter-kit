import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Demande la permission de notifications et enregistre le token Expo dans
 * `push_tokens/{token}` (cf. firestore.rules : cree/mis a jour uniquement par
 * le proprietaire, jamais lu par un client). Renvoie false si refuse ou si on
 * tourne dans un simulateur (les push ne fonctionnent que sur un vrai appareil).
 */
export async function activerNotificationsBolet(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: statutActuel } = await Notifications.getPermissionsAsync();
  let statut = statutActuel;
  if (statut !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    statut = status;
  }
  if (statut !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "TCHEKE",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  await setDoc(doc(db, "push_tokens", token), {
    token,
    uid,
    bolet: true,
  });

  return true;
}
