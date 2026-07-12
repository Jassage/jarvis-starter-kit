import { Image, StyleSheet, View } from 'react-native';
import type { Incrustation } from '../api/epg.api';

const POSITION_STYLE: Record<Incrustation['position'], object> = {
  HAUT_GAUCHE: { top: 10, left: 10 },
  HAUT_DROITE: { top: 10, right: 10 },
  BAS_GAUCHE: { bottom: 10, left: 10 },
  BAS_DROITE: { bottom: 10, right: 10 },
};

// Overlay React Native par-dessus la vidéo (même arbitrage que le web,
// cf. Overlay.tsx côté frontend) : plus simple à faire évoluer côté client
// qu'une incrustation brûlée dans le flux par ErsatzTV, au prix de ne pas être
// visible si le flux est regardé en dehors de l'app/site ANTENN.
export default function LogoOverlay({ incrustations }: { incrustations: Incrustation[] }) {
  const actives = incrustations.filter((i) => i.actif);
  if (actives.length === 0) return null;

  return (
    <>
      {actives.map((i) => (
        <View key={i.id} style={[styles.wrapper, POSITION_STYLE[i.position]]}>
          <Image source={{ uri: i.logoUrl }} style={[styles.logo, { opacity: i.opacite }]} resizeMode="contain" />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  logo: {
    width: 56,
    height: 56,
  },
});
