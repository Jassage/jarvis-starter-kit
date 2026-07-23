import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/theme/ThemeProvider";
import { changerLangue } from "../../src/i18n";

/**
 * Onboarding, ecran 1/2 : bienvenue + choix de la langue.
 * Decision produit (cf. conversation) : pas de slider marketing a 4 slides
 * (friction inutile pour une app utilitaire). Deux ecrans fonctionnels
 * seulement, skippables, montres une seule fois.
 */
export default function OnboardingBienvenue() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();

  return (
    <View style={[styles.ecran, { backgroundColor: theme.navy }]}>
      <View style={styles.contenu}>
        <View style={styles.logo}>
          <Text style={styles.logoTexte}>T</Text>
        </View>
        <Text style={styles.titre}>{t("onboarding.byenveni")}</Text>
        <Text style={styles.soustitre}>{t("onboarding.soustitreByenveni")}</Text>

        <View style={styles.langues}>
          <Pressable
            style={[styles.langueBtn, i18n.language === "ht" && styles.langueBtnActif]}
            onPress={() => changerLangue("ht")}
          >
            <Text style={[styles.langueTexte, i18n.language === "ht" && styles.langueTexteActif]}>Kreyòl</Text>
          </Pressable>
          <Pressable
            style={[styles.langueBtn, i18n.language === "fr" && styles.langueBtnActif]}
            onPress={() => changerLangue("fr")}
          >
            <Text style={[styles.langueTexte, i18n.language === "fr" && styles.langueTexteActif]}>Français</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.bouton} onPress={() => router.push("/onboarding/notifikasyon")}>
        <Text style={styles.boutonTexte}>{t("onboarding.swivan")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, justifyContent: "space-between", padding: 28, paddingTop: 90, paddingBottom: 50 },
  contenu: { alignItems: "center", gap: 14 },
  logo: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: "rgba(255,255,255,.15)",
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  logoTexte: { color: "#fff", fontSize: 30, fontWeight: "800" },
  titre: { color: "#fff", fontSize: 24, fontWeight: "800", textAlign: "center" },
  soustitre: { color: "rgba(255,255,255,.8)", fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 12 },
  langues: { flexDirection: "row", gap: 10, marginTop: 20 },
  langueBtn: { paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: "rgba(255,255,255,.3)" },
  langueBtnActif: { backgroundColor: "#fff", borderColor: "#fff" },
  langueTexte: { color: "#fff", fontWeight: "700", fontSize: 13.5 },
  langueTexteActif: { color: "#0B2A6B" },
  bouton: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  boutonTexte: { color: "#0B2A6B", fontWeight: "800", fontSize: 15 },
});
