import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/theme/ThemeProvider";
import { useTirageStore } from "../../src/stores/tirageStore";
import { DrawCard } from "../../src/components/DrawCard";

/** Ecran "Rezilta jodi a" (cf. maquette ecran 1) : les tirages du jour, du plus recent au plus ancien. */
export default function EkranBolet() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { tirages, chargement, horsLigne, demarrerEcoute } = useTirageStore();

  useEffect(() => demarrerEcoute(), []);

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const tirageDuJour = tirages.filter((tr) => tr.date === aujourdhui);

  return (
    <View style={[styles.ecran, { backgroundColor: theme.bg }]}>
      <View style={styles.entete}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={[styles.titre, { color: theme.ink }]}>{t("bolet.titre")}</Text>
            <Text style={[styles.soustitre, { color: theme.muted }]}>{t("bolet.jodiA")}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/tcheke")}
            style={[styles.tchekeBtn, { backgroundColor: theme.navy }]}
          >
            <Text style={styles.tchekeBtnTexte}>{t("tchèke.boutonTchèke")}</Text>
          </Pressable>
        </View>
      </View>

      {horsLigne && (
        <View style={[styles.bandeau, { backgroundColor: theme.chip }]}>
          <Text style={[styles.bandeauTexte, { color: theme.muted }]}>{t("komen.pAKoneksyon")}</Text>
        </View>
      )}

      <FlatList
        data={tirageDuJour}
        keyExtractor={(item) => `${item.date}_${item.etat}_${item.moment}`}
        renderItem={({ item }) => <DrawCard tirage={item} />}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={
          !chargement ? (
            <Text style={[styles.vide, { color: theme.muted }]}>{t("bolet.apTann")}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  entete: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  titre: { fontSize: 21, fontWeight: "800" },
  soustitre: { fontSize: 12.5, marginTop: 2 },
  bandeau: { marginHorizontal: 18, borderRadius: 10, padding: 10, marginBottom: 4 },
  bandeauTexte: { fontSize: 11.5, textAlign: "center" },
  liste: { padding: 15 },
  vide: { textAlign: "center", marginTop: 40, fontSize: 13 },
  tchekeBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  tchekeBtnTexte: { color: "#fff", fontWeight: "700", fontSize: 12.5 },
});
