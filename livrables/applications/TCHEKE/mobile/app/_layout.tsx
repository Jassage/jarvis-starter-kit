import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, Text, Pressable } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n, { initI18n } from "../src/i18n";
import { ThemeProvider, useTheme } from "../src/theme/ThemeProvider";
import { assurerAuthAnonyme } from "../src/lib/firebase";
import { onboardingDejaVu } from "../src/lib/onboarding";

/**
 * Delai maximum tolere pour l'auth Firebase au demarrage. Sur une connexion
 * instable (contrainte centrale du produit, cf. PLAN.md), l'app ne doit
 * jamais rester bloquee indefiniment sur un ecran de chargement silencieux :
 * au-dela de ce delai, on bascule sur un ecran d'erreur avec "Reessaye".
 */
const DELAI_MAX_MS = 12000;

function delaiExpire(ms: number): Promise<"TIMEOUT"> {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

function Amorcage({ children }: { children: React.ReactNode }) {
  const [etat, setEtat] = useState<"chargement" | "pret" | "erreur">("chargement");
  const [ontboardingVu, setOnboardingVu] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const demarrer = useCallback(async () => {
    setEtat("chargement");
    try {
      const resultat = await Promise.race([
        Promise.all([initI18n(), assurerAuthAnonyme()]),
        delaiExpire(DELAI_MAX_MS),
      ]);
      if (resultat === "TIMEOUT") {
        setEtat("erreur");
        return;
      }
      const vu = await onboardingDejaVu();
      setOnboardingVu(vu);
      setEtat("pret");
    } catch (e) {
      console.error("Echec de l'amorcage:", e);
      setEtat("erreur");
    }
  }, []);

  useEffect(() => {
    demarrer();
  }, [demarrer]);

  useEffect(() => {
    if (etat !== "pret") return;
    const dansOnboarding = segments[0] === "onboarding";
    if (!ontboardingVu && !dansOnboarding) {
      router.replace("/onboarding");
    } else if (ontboardingVu && dansOnboarding) {
      router.replace("/(tabs)");
    }
  }, [etat, ontboardingVu, segments]);

  if (etat === "erreur") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg, padding: 24, gap: 16 }}>
        <Text style={{ color: theme.ink, fontSize: 15, fontWeight: "600", textAlign: "center" }}>
          Koneksyon an pran twòp tan
        </Text>
        <Text style={{ color: theme.muted, fontSize: 13, textAlign: "center" }}>
          Tcheke koneksyon entènèt ou epi eseye ankò.
        </Text>
        <Pressable
          onPress={demarrer}
          style={{ backgroundColor: theme.navy, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Eseye ankò</Text>
        </Pressable>
      </View>
    );
  }

  if (etat === "chargement") {
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
