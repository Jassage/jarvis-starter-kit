import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useTheme } from "../../src/theme/ThemeProvider";
import type { TauxOfficiel, TauxAgrege } from "../../src/types/firestore";

/** Ecran "To Dola Ameriken" (cf. maquette ecran 5, montree en mode sombre). */
export default function EkranTauxChanj() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tauxOfficiel, setTauxOfficiel] = useState<TauxOfficiel | null>(null);
  const [agrege, setAgrege] = useState<TauxAgrege | null>(null);
  const [montantUsd, setMontantUsd] = useState("100");

  useEffect(() => {
    const qOfficiel = query(collection(db, "taux_officiel"), orderBy("date", "desc"), limit(1));
    const desabonnerOfficiel = onSnapshot(qOfficiel, (snap) => {
      const doc = snap.docs[0];
      setTauxOfficiel(doc ? (doc.data() as TauxOfficiel) : null);
    });

    const qAgrege = query(collection(db, "taux_agrege"), orderBy("date", "desc"), limit(1));
    const desabonnerAgrege = onSnapshot(qAgrege, (snap) => {
      const doc = snap.docs[0];
      setAgrege(doc ? (doc.data() as TauxAgrege) : null);
    });

    return () => {
      desabonnerOfficiel();
      desabonnerAgrege();
    };
  }, []);

  const refBrh = tauxOfficiel?.refBrh ?? 0;
  const montant = Number(montantUsd.replace(",", ".")) || 0;
  const conversion = refBrh > 0 ? (montant * refBrh).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : "—";

  return (
    <View style={[styles.ecran, { backgroundColor: theme.bg }]}>
      <View style={styles.entete}>
        <Text style={[styles.titre, { color: theme.ink }]}>{t("tauxChanj.titre")}</Text>
      </View>

      <View style={styles.corps}>
        <View style={[styles.hero, { backgroundColor: theme.navy }]}>
          <Text style={styles.heroLab}>{t("tauxChanj.referansBrh")}</Text>
          <Text style={styles.heroBig}>
            {refBrh > 0 ? refBrh.toFixed(2) : "—"} <Text style={styles.heroPetit}>HTG</Text>
          </Text>
        </View>

        <View style={styles.cartes}>
          <View style={[styles.carte, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <Text style={[styles.carteK, { color: theme.muted }]}>{t("tauxChanj.achte")}</Text>
            <Text style={[styles.carteV, { color: theme.ink }]}>
              {agrege ? agrege.achatMwayen.toFixed(2) : "—"}
            </Text>
            <Text style={[styles.carteC, { color: theme.muted }]}>{t("tauxChanj.nanMache")}</Text>
          </View>
          <View style={[styles.carte, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <Text style={[styles.carteK, { color: theme.muted }]}>{t("tauxChanj.vann")}</Text>
            <Text style={[styles.carteV, { color: theme.ink }]}>
              {agrege ? agrege.venteMwayen.toFixed(2) : "—"}
            </Text>
            <Text style={[styles.carteC, { color: theme.muted }]}>{t("tauxChanj.nanMache")}</Text>
          </View>
        </View>

        <View style={[styles.calc, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.calcTitre, { color: theme.muted }]}>{t("tauxChanj.kalkilatè")}</Text>
          <View style={styles.calcRow}>
            <Text style={[styles.calcDevise, { color: theme.ink }]}>USD</Text>
            <TextInput
              value={montantUsd}
              onChangeText={setMontantUsd}
              keyboardType="numeric"
              style={[styles.calcInput, { color: theme.ink }]}
            />
          </View>
          <View style={[styles.calcSep, { backgroundColor: theme.line }]} />
          <View style={styles.calcRow}>
            <Text style={[styles.calcDevise, { color: theme.ink }]}>HTG</Text>
            <Text style={[styles.calcInput, { color: theme.ink }]}>{conversion}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  entete: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  titre: { fontSize: 21, fontWeight: "800" },
  corps: { padding: 15, gap: 12 },
  hero: { borderRadius: 22, padding: 18 },
  heroLab: { color: "rgba(255,255,255,.85)", fontSize: 12 },
  heroBig: { color: "#fff", fontSize: 40, fontWeight: "800", marginTop: 4, fontVariant: ["tabular-nums"] },
  heroPetit: { fontSize: 16, fontWeight: "700" },
  cartes: { flexDirection: "row", gap: 9 },
  carte: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 11 },
  carteK: { fontSize: 10.5, fontWeight: "600", textTransform: "uppercase" },
  carteV: { fontSize: 21, fontWeight: "800", marginTop: 3, fontVariant: ["tabular-nums"] },
  carteC: { fontSize: 10.5, marginTop: 1 },
  calc: { borderWidth: 1, borderRadius: 16, padding: 13, gap: 8 },
  calcTitre: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  calcRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  calcDevise: { fontWeight: "700", fontSize: 13 },
  calcInput: { fontSize: 23, fontWeight: "800", fontVariant: ["tabular-nums"] },
  calcSep: { height: 1 },
});
