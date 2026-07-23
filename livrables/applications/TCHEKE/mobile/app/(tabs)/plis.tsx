import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/theme/ThemeProvider";
import { changerLangue, type Langue } from "../../src/i18n";
import { activerNotificationsBolet } from "../../src/lib/push";

/** Ecran "Paramèt" (cf. maquette ecran 6) : langue (Kreyol par defaut), notifications. */
export default function EkranPlis() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [notifBolet, setNotifBolet] = useState(false);

  async function onChoisirLangue(langue: Langue) {
    await changerLangue(langue);
  }

  async function onToggleNotifBolet(valeur: boolean) {
    if (valeur) {
      const ok = await activerNotificationsBolet();
      setNotifBolet(ok);
    } else {
      setNotifBolet(false);
    }
  }

  return (
    <View style={[styles.ecran, { backgroundColor: theme.bg }]}>
      <View style={styles.entete}>
        <Text style={[styles.titre, { color: theme.ink }]}>{t("paramèt.titre")}</Text>
      </View>

      <View style={styles.corps}>
        <Text style={[styles.groupe, { color: theme.muted }]}>{t("paramèt.lang")}</Text>
        <View style={[styles.carte, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <LangOption
            label="Kreyòl"
            actif={i18n.language === "ht"}
            onPress={() => onChoisirLangue("ht")}
            theme={theme}
          />
          <LangOption
            label="Français"
            actif={i18n.language === "fr"}
            onPress={() => onChoisirLangue("fr")}
            theme={theme}
          />
        </View>

        <Text style={[styles.groupe, { color: theme.muted }]}>{t("paramèt.notifikasyon")}</Text>
        <View style={[styles.carte, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <View style={styles.ligne}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ligneA, { color: theme.ink }]}>{t("paramèt.rezilteBolet")}</Text>
              <Text style={[styles.ligneB, { color: theme.muted }]}>{t("paramèt.avètiRezilta")}</Text>
            </View>
            <Switch value={notifBolet} onValueChange={onToggleNotifBolet} />
          </View>
        </View>
      </View>
    </View>
  );
}

function LangOption({
  label,
  actif,
  onPress,
  theme,
}: {
  label: string;
  actif: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable onPress={onPress} style={styles.ligne}>
      <Text style={{ flex: 1, fontSize: 13.5, fontWeight: "600", color: theme.ink }}>
        {label}
        {actif ? <Text style={{ color: theme.muted, fontWeight: "500" }}>  {"— par default"}</Text> : null}
      </Text>
      {actif && (
        <View style={[styles.check, { backgroundColor: theme.navy }]}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  entete: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  titre: { fontSize: 21, fontWeight: "800" },
  corps: { padding: 15, gap: 8 },
  groupe: { fontSize: 10.5, fontWeight: "700", textTransform: "uppercase", marginTop: 6, marginBottom: 4, marginLeft: 4 },
  carte: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  ligne: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 13, paddingVertical: 12 },
  ligneA: { fontSize: 13, fontWeight: "600" },
  ligneB: { fontSize: 11, marginTop: 1 },
  check: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
