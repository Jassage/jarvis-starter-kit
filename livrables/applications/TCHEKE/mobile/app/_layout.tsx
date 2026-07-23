import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n, { initI18n } from "../src/i18n";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";
import { assurerAuthAnonyme } from "../src/lib/firebase";
import { onboardingDejaVu } from "../src/lib/onboarding";

function Amorcage({ children }: { children: React.ReactNode }) {
  const [pret, setPret] = useState(false);
  const [ontboardingVu, setOnboardingVu] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      await Promise.all([initI18n(), assurerAuthAnonyme()]);
      const vu = await onboardingDejaVu();
      setOnboardingVu(vu);
      setPret(true);
    })();
  }, []);

  useEffect(() => {
    if (!pret) return;
    const dansOnboarding = segments[0] === "onboarding";
    if (!ontboardingVu && !dansOnboarding) {
      router.replace("/onboarding");
    } else if (ontboardingVu && dansOnboarding) {
      router.replace("/(tabs)");
    }
  }, [pret, ontboardingVu, segments]);

  if (!pret) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.navy} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Amorcage>
          <Slot />
        </Amorcage>
      </I18nextProvider>
    </ThemeProvider>
  );
}
