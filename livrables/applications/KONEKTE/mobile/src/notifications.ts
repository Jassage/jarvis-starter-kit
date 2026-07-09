import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { registerPushToken } from "./api/push.api";
import { navigateFromNotification } from "./navigation/navigationRef";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Best-effort : les notifications push distantes ne sont plus supportées par
// Expo Go sur Android depuis le SDK 53 (getExpoPushTokenAsync échoue) — ça
// ne doit jamais faire planter le démarrage de l'app, seulement dans une
// vraie build (EAS dev client / standalone) que le token sera obtenu.
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#E11D74",
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await registerPushToken(token);
  } catch {
    // cf. commentaire ci-dessus
  }
}

// À appeler une seule fois au démarrage de l'app (App.tsx).
export function setupNotificationResponseListener() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as
      | { type?: string; conversationId?: string; matchId?: string }
      | undefined;
    if (!data?.type) return;

    if (data.type === "NEW_MESSAGE" && data.conversationId) {
      navigateFromNotification("Chat", { screen: "Conversation", params: { conversationId: data.conversationId } });
    } else if (data.type === "NEW_MATCH") {
      navigateFromNotification("Matches");
    }
  });
}
