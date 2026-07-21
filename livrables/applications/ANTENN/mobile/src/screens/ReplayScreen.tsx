import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCatalogue, ReplayCarte, TypeReplay } from '../api/replay.api';
import { colors } from '../theme/colors';
import ReplayLectureScreen from './ReplayLectureScreen';

const FILTRES: Array<{ valeur: TypeReplay | null; label: string }> = [
  { valeur: null, label: 'Tout' },
  { valeur: 'PROGRAMME', label: 'Programmes' },
  { valeur: 'MATCH', label: 'Matchs' },
];

function formatDuree(secondes: number): string {
  const h = Math.floor(secondes / 3600);
  const m = Math.round((secondes % 3600) / 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}

export default function ReplayScreen({ onBack }: { onBack: () => void }) {
  const [replays, setReplays] = useState<ReplayCarte[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeReplay | null>(null);
  const [chargement, setChargement] = useState(true);
  // Navigation interne catalogue -> lecture : l'app n'embarque pas de librairie de
  // navigation, on garde la même approche que la bascule Direct/Guide.
  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const timer = setTimeout(async () => {
      setChargement(true);
      try {
        const data = await getCatalogue({ q: q.trim() || undefined, type: type ?? undefined });
        if (!annule) setReplays(data.replays);
      } catch {
        // Écran public : on garde la dernière liste connue plutôt que de casser l'écran.
      } finally {
        if (!annule) setChargement(false);
      }
    }, 280);
    return () => { annule = true; clearTimeout(timer); };
  }, [q, type]);

  if (selection) {
    return <ReplayLectureScreen id={selection} onBack={() => setSelection(null)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Direct</Text>
        </TouchableOpacity>
        <Text style={styles.brandText}>Replay</Text>
      </View>

      <Text style={styles.pageTitle}>Replay</Text>
      <Text style={styles.pageHint}>Revoyez à la demande les programmes déjà passés à l&apos;antenne.</Text>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color={colors.ink3} />
        <TextInput
          style={styles.search}
          placeholder="Rechercher un programme..."
          placeholderTextColor={colors.ink3}
          value={q}
          onChangeText={setQ}
        />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {FILTRES.map((f) => (
            <TouchableOpacity
              key={f.label}
              onPress={() => setType(f.valeur)}
              style={[styles.tab, type === f.valeur && styles.tabActive]}
            >
              <Text style={[styles.tabText, type === f.valeur && styles.tabTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {!chargement && replays.length === 0 && (
          <Text style={styles.emptyText}>Aucun replay disponible pour l&apos;instant.</Text>
        )}
        {replays.map((r) => (
          <TouchableOpacity key={r.id} style={styles.card} onPress={() => setSelection(r.id)}>
            <View style={styles.vignetteWrapper}>
              {r.vignetteUrl ? (
                <Image source={{ uri: r.vignetteUrl }} style={styles.vignette} resizeMode="cover" />
              ) : (
                <Ionicons name="film-outline" size={26} color={colors.ink3} />
              )}
              <View style={styles.dureeTag}>
                <Text style={styles.dureeText}>{formatDuree(r.dureeSecondes)}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle} numberOfLines={2}>{r.titre}</Text>
                {r.matchId ? (
                  <View style={styles.liveTag}><Text style={styles.liveTagText}>MATCH</Text></View>
                ) : (
                  <View style={styles.progTag}><Text style={styles.progTagText}>Programme</Text></View>
                )}
              </View>
              {r.description && <Text style={styles.cardDesc} numberOfLines={2}>{r.description}</Text>}
              <View style={styles.meta}>
                <Ionicons name="eye-outline" size={13} color={colors.ink3} />
                <Text style={styles.metaText}>{r.nombreVues}</Text>
                {r.creneau && (
                  <Text style={styles.metaText}>
                    · Diffusé le {new Date(r.creneau.dateHeureDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
  pageTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', paddingHorizontal: 16 },
  pageHint: { color: colors.ink3, fontSize: 13, paddingHorizontal: 16, marginTop: 2, marginBottom: 12 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  search: { flex: 1, color: colors.ink, fontSize: 14 },
  tabs: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  tab: { backgroundColor: colors.surface2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  tabActive: { backgroundColor: colors.primarySoft },
  tabText: { color: colors.ink2, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  vignetteWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vignette: { width: '100%', height: '100%' },
  dureeTag: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dureeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  cardBody: { padding: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', flex: 1 },
  cardDesc: { color: colors.ink3, fontSize: 12, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, flexWrap: 'wrap' },
  metaText: { color: colors.ink3, fontSize: 12 },
  emptyText: { color: colors.ink3, fontSize: 13, textAlign: 'center', marginTop: 32 },
  liveTag: { backgroundColor: colors.liveSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  liveTagText: { color: colors.live, fontSize: 10, fontWeight: '800' },
  progTag: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  progTagText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
});
