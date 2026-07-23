import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { themeClair, themeSombre, type Theme } from "./tokens";

const ThemeContext = createContext<Theme>(themeClair);

/**
 * Suit le theme systeme du telephone (pas de bascule manuelle en v1, cf.
 * maquette Parametres "Mode sombre : Automatique dapre telefòn nan").
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo(() => (scheme === "dark" ? themeSombre : themeClair), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
