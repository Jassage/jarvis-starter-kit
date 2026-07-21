import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { compterVue, getReplay, ReplayDetail } from '../api/replay.api';
import { colors } from '../theme/colors';
import VodPlayer from '../components/VodPlayer';
import LogoOverlay from '../components/LogoOverlay';
import ChannelLogoOverlay from '../components/ChannelLogoOverlay';
import BandeauOverlay from '../components/BandeauOverlay';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ReplayLectureScreen({ id, onBack }: { id: string; onBack: () => void }) {
  const [detail, setDetail] = useState<ReplayDetail | null>(null);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    getReplay(id).then(setDetail).catch(() => setIntrouvable(true));
  }, [id]);

  const onDemarrage = useCallback(() => {
    compterVue(id).catch(() => {});
  }, [id]);

  const r = detail?.replay;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Replay</Text>
        </TouchableOpacity>
        <Text style={styles.brandText}>{detail?.configChaine?.nomChaine ?? 'ANTENN'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {introuvable && (
          <Text style={styles.emptyText}>Ce programme n&apos;est plus disponible en rattrapage.</Text>
        )}

        {r && (
          <>
            <View style={styles.playerWrapper}>
              <VodPlayer src={r.urlVod} onDemarrage={onDemarrage} />
              {/* Habillage rejoué : incrustations et bandeau du créneau d'origine,
                  plus le logo permanent de la chaîne — parité avec le player web. */}
              <LogoOverlay incrustations={detail.incrustations} />
              <ChannelLogoOverlay config={detail.configChaine} />
              <BandeauOverlay bandeaux={detail.bandeaux} />
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.titre}>{r.titre}</Text>
              {r.matchId ? (
                <View style={styles.liveTag}><Text style={styles.liveTagText}>MATCH</Text></View>
              ) : (
                <View style={styles.progTag}><Text style={styles.progTagText}>Programme</Text></View>
              )}
            </View>

            {r.match && <Text style={styles.equipes}>{r.match.equipes}</Text>}

            <View style={styles.meta}>
              <Ionicons name="eye-outline" size={14} color={colors.ink3} />
              <Text style={styles.metaText}>{r.nombreVues} vue(s)</Text>
              {r.creneau && <Text style={styles.metaText}>· Diffusé le {formatDate(r.creneau.dateHeureDebut)}</Text>}
            </View>

            {r.description && <Text style={styles.description}>{r.description}</Text>}

            {detail.incrustations.length > 0 && (
              <Text style={styles.sponsors}>
                Avec le soutien de {detail.incrustations.map((i) => i.sponsor?.nomSponsor).filter(Boolean).join(', ')}.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  brandText: { color: colors.ink, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  content: { padding: 16 },
  playerWrapper: { position: 'relative', marginBottom: 14 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  titre: { color: colors.ink, fontSize: 17, fontWeight: '800', flex: 1 },
  equipes: { color: colors.ink2, fontSize: 14, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, flexWrap: 'wrap' },
  metaText: { color: colors.ink3, fontSize: 12 },
  description: { color: colors.ink2, fontSize: 14, marginTop: 14, lineHeight: 20 },
  sponsors: { color: colors.ink3, fontSize: 12, marginTop: 16 },
  emptyText: { color: colors.ink3, fontSize: 13, textAlign: 'center', marginTop: 40 },
  liveTag: { backgroundColor: colors.liveSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  liveTagText: { color: colors.live, fontSize: 10, fontWeight: '800' },
  progTag: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  progTagText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
});
