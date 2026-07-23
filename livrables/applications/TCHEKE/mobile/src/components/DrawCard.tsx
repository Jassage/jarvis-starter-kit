import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme/ThemeProvider";
import { Boul } from "./Boul";
import type { Tirage } from "../types/firestore";

const DRAPEAU: Record<Tirage["etat"], { fond: string; texte: string }> = {
  NY: { fond: "#0B2A6B", texte: "NY" },
  FL: { fond: "#E23744", texte: "FL" },
};

/** Carte d'un tirage dans la liste "Rezilta jodi a" (cf. maquette ecran 1). */
export function DrawCard({ tirage }: { tirage: Tirage }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const drapeau = DRAPEAU[tirage.etat];
  const nomEtat = tirage.etat === "NY" ? "New York" : "Florida";
  const moment = tirage.moment === "MIDI" ? t("bolet.midi") : t("bolet.aswè");

  return (
    <View style={[styles.carte, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <View style={styles.entete}>
        <View style={[styles.drapeau, { backgroundColor: drapeau.fond }]}>
          <Text style={styles.drapeauTexte}>{drapeau.texte}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.nom, { color: theme.ink }]}>{nomEtat}</Text>
          <Text style={[styles.heure, { color: theme.muted }]}>{moment}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: "rgba(18,133,90,.13)" }]}>
          <Text style={[styles.badgeTexte, { color: theme.up }]}>{t("bolet.ofisyèl")}</Text>
        </View>
      </View>

      <View style={styles.los}>
        <Boul valeur={tirage.premyeLo} etiquette={t("bolet.premyeLo")} />
        <Boul valeur={tirage.dezyemLo} etiquette={t("bolet.dezyemLo")} />
        <Boul valeur={tirage.twazyemLo} etiquette={t("bolet.twazyemLo")} />
      </View>

      <View style={styles.lottoRow}>
        <View style={[styles.lotto, { backgroundColor: theme.bg }]}>
          <Text style={[styles.lottoK, { color: theme.muted }]}>{t("bolet.lotto3")}</Text>
          <Text style={[styles.lottoV, { color: theme.ink }]}>{tirage.lotto3}</Text>
        </View>
        <View style={[styles.lotto, { backgroundColor: theme.bg }]}>
          <Text style={[styles.lottoK, { color: theme.muted }]}>{t("bolet.lotto4")}</Text>
          <Text style={[styles.lottoV, { color: theme.ink }]}>{tirage.lotto4}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { borderWidth: 1, borderRadius: 18, padding: 13, marginBottom: 11 },
  entete: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 11 },
  drapeau: { width: 30, height: 21, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  drapeauTexte: { color: "#fff", fontSize: 9, fontWeight: "800" },
  nom: { fontWeight: "700", fontSize: 13.5 },
  heure: { fontSize: 11, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeTexte: { fontSize: 9.5, fontWeight: "700", textTransform: "uppercase" },
  los: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  lottoRow: { flexDirection: "row", gap: 8, marginTop: 11 },
  lotto: { flex: 1, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lottoK: { fontSize: 10.5, fontWeight: "600" },
  lottoV: { fontSize: 18, fontWeight: "800", letterSpacing: 1, fontVariant: ["tabular-nums"] },
});
