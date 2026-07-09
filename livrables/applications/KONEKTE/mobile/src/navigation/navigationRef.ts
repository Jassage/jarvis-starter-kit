import { createNavigationContainerRef } from "@react-navigation/native";

// Pas de RootParamList unifié (RootNavigator rend AuthStack OU AppTabs
// directement, sans Stack englobant) — navigation non typée ici, comme pour
// tout appel de navigation qui traverse un navigateur imbriqué.
export const navigationRef = createNavigationContainerRef<Record<string, object | undefined>>();

// Utilisé en dehors de l'arbre React (listener de tap sur notification, qui
// peut se déclencher avant que la navigation soit montée).
export function navigateFromNotification(name: string, params?: object) {
  if (!navigationRef.isReady()) return;
  (navigationRef as unknown as { navigate: (name: string, params?: object) => void }).navigate(name, params);
}
