import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { colors } from '../theme/colors';

function label(state: NetInfoState | null): string {
  if (!state) return '…';
  if (state.type === 'wifi') return 'WiFi';
  if (state.type === 'cellular') {
    const gen = state.details?.cellularGeneration;
    return gen ? gen.toUpperCase() : 'Mobile';
  }
  return state.isConnected ? 'Connecté' : 'Hors ligne';
}

export default function NetworkIndicator() {
  const [state, setState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setState);
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: state?.isConnected ? colors.success : colors.live }]} />
      <Text style={styles.text}>{label(state)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    color: colors.ink3,
    fontSize: 11,
    fontWeight: '600',
  },
});
