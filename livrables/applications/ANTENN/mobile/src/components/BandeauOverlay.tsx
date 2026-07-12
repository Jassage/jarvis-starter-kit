import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { Bandeau } from '../api/epg.api';

export default function BandeauOverlay({ bandeaux }: { bandeaux: Bandeau[] }) {
  const actif = bandeaux.find((b) => b.actif);
  const translateX = useRef(new Animated.Value(0)).current;

  const texte = actif ? actif.items.map((i) => i.texte).join('   •   ') : '';

  useEffect(() => {
    if (!actif) return;
    translateX.setValue(300);
    const duration = Math.max(4000, 60000 / actif.vitesseDefilement);
    const loop = Animated.loop(
      Animated.timing(translateX, { toValue: -600, duration, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [actif, translateX]);

  if (!actif) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
      <Text style={styles.text} numberOfLines={1}>{texte}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 6,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
