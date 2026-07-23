import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../src/theme/ThemeProvider";
import { useTirageStore } from "../src/stores/tirageStore";
import { tchèkeBoul } from "../src/bolet/estatistik";

const TOUCHES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Efase", "0", "Tchèke"];

/** Ecran "Tchèke nimewo w" (cf. maquette ecran 3). Nimewo saisis restent locaux, pas de compte requis. */
export default function EkranTcheke() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { tirages, demarrerEcoute } = useTirageStore();
  const [saisie, setSaisie] = useState("");
  const [verifie, setVerifie] = useState<string | null>(null);

  useEffect(() => demarrerEcoute(), []);

  const resultat = useMemo(() => {
    if (!verifie) return null;
    for (const tr of tirages) {
      const lot = tchèkeBoul(verifie, tr);
      if (lot) return { tirage: tr, lot };
    }
    return null;
  }, [verifie, tirages]);

  function appuyer(touche: string) {
    if (touche === "Efase") return setSaisie((s) => s.slice(0, -1));
    if (touche === "Tchèke") return setVerifie(saisie.length > 0 ? saisie : null);
    if (saisie.length < 2) setSaisie((s) => s + touche);
  }

  return (
    <View style={[styles.ecran, { backgroundColor: theme.bg }]}>
      <View style={styles.entete}>
        <Text style={[styles.titre, { color: theme.ink }]}>{t("tchèke.titre")}</Text>
        <Text style={[styles.soustitre, { color: theme.muted }]}>{t("tchèke.soustit")}</Text>
      </View>

      <View style={styles.corps}>
        <View style={[styles.champ, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          <Text style={[styles.champTexte, { color: theme.ink }]}>{saisie || "—"}</Text>
        </View>

        {verifie && (
          <View
            style={[
              styles.resultat,
              { backgroundColor: resultat ? theme.up : theme.chip },
            ]}
          >
            <Text style={[styles.resultatTexte, { color: resultat ? "#fff" : theme.muted }]}>
              {resultat ? t("tchèke.boulSoti") : t("tchèke.boulPaSoti")}
            </Text>
          </View>
        )}

        <View style={styles.pave}>
          {TOUCHES.map((touche) => (
            <Pressable
              key={touche}
              onPress={() => appuyer(touche)}
              style={[
                styles.touche,
                {
                  backgroundColor: touche === "Efase" || touche === "Tchèke" ? theme.navy : theme.surface,
                  borderColor: theme.line,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: touche.length > 1 ? 13 : 20,
                  fontWeight: "700",
                  color: touche === "Efase" || touche === "Tchèke" ? "#fff" : theme.ink,
                }}
              >
                {touche === "Tchèke" ? t("tchèke.boutonTchèke") : touche === "Efase" ? t("tchèke.efase") : touche}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1 },
  entete: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 },
  titre: { fontSize: 21, fontWeight: "800" },
  soustitre: { fontSize: 12.5, marginTop: 2 },
  corps: { padding: 15, gap: 12 },
  champ: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  champTexte: { fontSize: 30, fontWeight: "800", letterSpacing: 3, fontVariant: ["tabular-nums"] },
  resultat: { borderRadius: 14, padding: 14, alignItems: "center" },
  resultatTexte: { fontSize: 14, fontWeight: "700" },
  pave: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  touche: { width: "31%", height: 46, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
