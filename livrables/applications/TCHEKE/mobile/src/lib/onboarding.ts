import AsyncStorage from "@react-native-async-storage/async-storage";

const CLE = "tcheke.onboardingTermine";

/** L'onboarding (2 ecrans : langue + notifications) ne se montre qu'une seule fois. */
export async function onboardingDejaVu(): Promise<boolean> {
  return (await AsyncStorage.getItem(CLE)) === "1";
}

export async function marquerOnboardingTermine(): Promise<void> {
  await AsyncStorage.setItem(CLE, "1");
}
