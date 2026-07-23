import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

interface BoulProps {
  valeur: string;
  etiquette: string;
  taille?: "moyen" | "gros" | "geant";
}

/**
 * Le "chip" de boule ovale/or utilise partout (resultats, detail, tcheke).
 * Toujours en chiffres tabulaires pour que les colonnes s'alignent (cf.
 * maquettes : c'est une app de chiffres avant tout).
 */
export function Boul({ valeur, etiquette, taille = "gros" }: BoulProps) {
  const theme = useTheme();
  const dimension = taille === "geant" ? 70 : taille === "gros" ? 62 : 34;
  const police = taille === "geant" ? 30 : taille === "gros" ? 25 : 14;

  return (
    <View style={styles.colonne}>
      <View
        style={[
          styles.boul,
          {
            width: dimension,
            height: dimension,
            backgroundColor: theme.gold,
          },
        ]}
      >
        <Text style={[styles.chiffre, { fontSize: police, color: "#3a2400" }]}>
          {valeur}
        </Text>
      </View>
      <Text style={[styles.etiquette, { color: theme.muted }]}>{etiquette}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  colonne: { alignItems: "center", gap: 5 },
  boul: {
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  chiffre: {
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.5,
  },
  etiquette: { fontSize: 10, fontWeight: "600" },
});
