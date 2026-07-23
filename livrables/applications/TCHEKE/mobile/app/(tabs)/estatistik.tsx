import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../src/theme/ThemeProvider";
import { useTirageStore } from "../../src/stores/tirageStore";
import { boulCho, boulFrèt, type FrekansBoul } from "../../src/bolet/estatistik";

type Onglet = "cho" | "frèt";

/** Ecran "Estatistik boul" (cf. maquette ecran 4) : boules chaudes/froides sur l'historique en cache. */
export default function EkranEstatistik() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { tirages, demarrerEcoute } = useTirageStore();
  const [onglet, setOnglet] = useState<Onglet>("cho");

  useEffect(() => demarrerEcoute(), []);

  const boules = useMemo<FrekansBoul[]>(
    () => (onglet === "cho" ? boulCho(tirages) : boulFrèt(tirages)),
    [tirages, onglet],
  );

  return (
    <View style={[styles.ecran, { backgroundColor: theme.bg }]}>
      <View style={styles.entete}>
        <Text style={[styles.titre, { color: theme.ink }]}>{t("estatistik.titre")}</Text>
        <Text style={[styles.soustitre, { color: theme.muted }]}>{t("estatistik.soustit")}</Text>
      </View>

      <View style={[styles.seg, { backgroundColor: theme.bg }]}>
        <SegBouton
          actif={onglet === "cho"}
          texte={t("estatistik.boulCho")}
          onPress={() => setOnglet("cho")}
          theme={theme}
        />
        <SegBouton
          actif={onglet === "frèt"}
          texte={t("estatistik.boulFrèt")}
          onPress={() => setOnglet("frèt")}
          theme={theme}
        />
      </View>

      <FlatList
        data={boules}
        keyExtractor={(item) => item.boul}
        numColumns={4}
        contentContainerStyle={styles.grille}
        renderItem={({ item }) => (
          <View style={[styles.ball, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <Text style={[styles.ballN, { color: onglet === "cho" ? theme.red : theme.ink }]}>{item.boul}</Text>
            <Text style={[styles.ballF, { color: theme.muted }]}>{item.fwa} fwa</Text>
          </View>
        )}
      />

      <Text style={[styles.avertissement, { color: theme.muted }]}>{t("estatistik.avètisman")}</Text>
    </View>
  );
}

function SegBouton({
  actif,
  texte,
  onPress,
  theme,
}: {
  actif: boolean;
  texte: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.segItem,
        {
          color: actif ? theme.navy : theme.muted,
          backgroundColor: actif ? theme.surface : "transparent",
        },
      ]}
    >
      {texte}
    </Text>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  entete: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  titre: { fontSize: 21, fontWeight: "800" },
  soustitre: { fontSize: 12.5, marginTop: 2 },
  seg: { flexDirection: "row", marginHorizontal: 15, borderRadius: 12, padding: 4, gap: 4 },
  segItem: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "700", paddingVertical: 8, borderRadius: 9 },
  grille: { padding: 15, gap: 9 },
  ball: { flex: 1, margin: 4.5, borderWidth: 1, borderRadius: 13, paddingVertical: 10, alignItems: "center" },
  ballN: { fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
  ballF: { fontSize: 10, marginTop: 2 },
  avertissement: { textAlign: "center", fontSize: 11, paddingHorizontal: 24, paddingBottom: 16, lineHeight: 16 },
});
