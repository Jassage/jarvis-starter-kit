import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEpg, EpgResponse } from '../api/epg.api';
import { colors } from '../theme/colors';
import Player from '../components/Player';
import LiveBadge from '../components/LiveBadge';
import LogoOverlay from '../components/LogoOverlay';
import ChannelLogoOverlay from '../components/ChannelLogoOverlay';
import BandeauOverlay from '../components/BandeauOverlay';
import EpgList from '../components/EpgList';
import NetworkIndicator from '../components/NetworkIndicator';
import GuideScreen from './GuideScreen';

const REFRESH_INTERVAL_MS = 60_000;

export default function WatchScreen() {
  const [epg, setEpg] = useState<EpgResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [vue, setVue] = useState<'direct' | 'guide'>('direct');

  const fetchEpg = useCallback(async () => {
    try {
      const data = await getEpg();
      setEpg(data);
    } catch {
      // Réseau indisponible — on garde le dernier EPG connu plutôt que de casser l'écran.
    }
  }, []);

  useEffect(() => {
    fetchEpg();
    const interval = setInterval(fetchEpg, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchEpg]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEpg();
    setRefreshing(false);
  };

  const enDirect = epg?.enCours?.typeCreneau === 'MATCH_DIRECT';
  const estRepli = !!epg?.enCours?.estRepli;
  const nomChaine = epg?.configChaine?.nomChaine ?? 'ANTENN';

  if (vue === 'guide') {
    return <GuideScreen onBack={() => setVue('direct')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Ionicons name="tv" size={20} color={colors.primary} />
            <Text style={styles.brandText}>{nomChaine}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.guideBtn} onPress={() => setVue('guide')}>
              <Ionicons name="calendar-outline" size={16} color={colors.ink2} />
              <Text style={styles.guideBtnText}>Guide</Text>
            </TouchableOpacity>
            <NetworkIndicator />
          </View>
        </View>

        <View style={styles.playerWrapper}>
          <Player enDirect={enDirect} estRepli={estRepli} />
          {enDirect && <LiveBadge />}
          {epg?.enCours && <LogoOverlay incrustations={epg.enCours.incrustations} />}
          <ChannelLogoOverlay config={epg?.configChaine ?? null} />
          {epg?.enCours && <BandeauOverlay bandeaux={epg.enCours.bandeaux} />}
        </View>

        <EpgList enCours={epg?.enCours ?? null} aSuivre={epg?.aSuivre ?? []} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  guideBtnText: {
    color: colors.ink2,
    fontSize: 13,
    fontWeight: '700',
  },
  playerWrapper: {
    position: 'relative',
  },
});
