import { Image, StyleSheet, View } from 'react-native';
import type { ConfigChaine } from '../api/epg.api';

const POSITION_STYLE: Record<ConfigChaine['logoPosition'], object> = {
  HAUT_GAUCHE: { top: 10, left: 10 },
  HAUT_DROITE: { top: 10, right: 10 },
  BAS_GAUCHE: { bottom: 10, left: 10 },
  BAS_DROITE: { bottom: 10, right: 10 },
};

// Logo d'identité de la chaîne — rendu en permanence par-dessus le player,
// indépendamment du programme, du repli et des incrustations sponsors (le "bug"
// d'une vraie chaîne TV). Parité avec Overlay.tsx / logoChaine côté web.
export default function ChannelLogoOverlay({ config }: { config: ConfigChaine | null }) {
  if (!config) return null;

  return (
    <View style={[styles.wrapper, POSITION_STYLE[config.logoPosition]]}>
      <Image source={{ uri: config.logoUrl }} style={[styles.logo, { opacity: config.logoOpacite }]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  logo: {
    width: 64,
    height: 40,
  },
});
