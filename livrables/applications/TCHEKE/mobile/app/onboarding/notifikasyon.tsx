import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/theme/ThemeProvider";
import { activerNotificationsBolet } from "../../src/lib/push";
import { marquerOnboardingTermine } from "../../src/lib/onboarding";

/**
 * Onboarding, ecran 2/2 : demande de la permission notifications, avec le
 * contexte explique (le taux d'acceptation grimpe quand on explique le
 * benefice avant de demander, plutot que de demander a froid au lancement).
 */
export default function OnboardingNotifications() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  async function terminer() {
    await marquerOnboardingTermine();
    router.replace("/(tabs)");
  }

  async function activer() {
    await activerNotificationsBolet();
    await terminer();
  }

  return (
    <View style={[styles.ecran, { backgroundColor: theme.bg }]}>
      <View style={styles.contenu}>
        <View style={[styles.icone, { backgroundColor: theme.chip }]}>
          <Text style={{ fontSize: 34 }}>🔔</Text>
        </View>
        <Text style={[styles.titre, { color: theme.ink }]}>{t("onboarding.notifTitre")}</Text>
        <Text style={[styles.soustitre, { color: theme.muted }]}>{t("onboarding.notifSoustitre")}</Text>
      </View>

      <View style={styles.boutons}>
        <Pressable style={[styles.boutonPri, { backgroundColor: theme.navy }]} onPress={activer}>
          <Text style={styles.boutonPriTexte}>{t("onboarding.aktive")}</Text>
        </Pressable>
        <Pressable style={styles.boutonSec} onPress={terminer}>
          <Text style={[styles.boutonSecTexte, { color: theme.muted }]}>{t("onboarding.pasKounyeA")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, justifyContent: "space-between", padding: 28, paddingTop: 100, paddingBottom: 50 },
  contenu: { alignItems: "center", gap: 14 },
  icone: { width: 76, height: 76, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  titre: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  soustitre: { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 12 },
  boutons: { gap: 10 },
  boutonPri: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  boutonPriTexte: { color: "#fff", fontWeight: "800", fontSize: 15 },
  boutonSec: { paddingVertical: 12, alignItems: "center" },
  boutonSecTexte: { fontWeight: "600", fontSize: 13.5 },
});
