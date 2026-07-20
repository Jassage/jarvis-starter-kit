import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGuide, GuideResponse, CreneauEpg } from '../api/epg.api';
import { colors } from '../theme/colors';

function titre(c: CreneauEpg): string {
  return c.match ? `${c.match.nomEvenement} — ${c.match.equipes}` : c.contenu?.titre || 'Programme';
}

function horaire(c: CreneauEpg): string {
  if (!c.dateHeureDebut || !c.dateHeureFin) return '';
  const debut = new Date(c.dateHeureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fin = new Date(c.dateHeureFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${debut} – ${fin}`;
}

function labelJour(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const auj = new Date(); auj.setHours(0, 0, 0, 0);
  const demain = new Date(auj); demain.setDate(demain.getDate() + 1);
  if (d.getTime() === auj.getTime()) return "Aujourd'hui";
  if (d.getTime() === demain.getTime()) return 'Demain';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function GuideScreen({ onBack }: { onBack: () => void }) {
  const [guide, setGuide] = useState<GuideResponse | null>(null);
  const [jourActif, setJourActif] = useState(0);

  useEffect(() => {
    getGuide(5).then(setGuide).catch(() => {});
  }, []);

  const nomChaine = guide?.configChaine?.nomChaine ?? 'ANTENN';
  const jour = guide?.jours[jourActif];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Direct</Text>
        </TouchableOpacity>
        <Text style={styles.brandText}>{nomChaine}</Text>
      </View>

      <Text style={styles.pageTitle}>Guide des programmes</Text>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {guide?.jours.map((j, i) => (
            <TouchableOpacity
              key={j.date}
              onPress={() => setJourActif(i)}
              style={[styles.tab, jourActif === i && styles.tabActive]}
            >
              <Text style={[styles.tabText, jourActif === i && styles.tabTextActive]}>{labelJour(j.date)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {jour && jour.creneaux.length === 0 && (
          <Text style={styles.emptyText}>Aucun programme synchronisé ce jour-là.</Text>
        )}
        {jour?.creneaux.map((c) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.cardHoraire}>{horaire(c)}</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle} numberOfLines={2}>{titre(c)}</Text>
              {c.typeCreneau === 'MATCH_DIRECT' ? (
                <View style={styles.liveTag}><Text style={styles.liveTagText}>DIRECT</Text></View>
              ) : c.typeCreneau === 'PUB' ? (
                <View style={styles.pubTag}><Text style={styles.pubTagText}>Pub</Text></View>
              ) : (
                <View style={styles.progTag}><Text style={styles.progTagText}>Programme</Text></View>
              )}
            </View>
          </View>
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
  pageTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', paddingHorizontal: 16, marginBottom: 12 },
  tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  tab: {
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: colors.primarySoft },
  tabText: { color: colors.ink2, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  tabTextActive: { color: colors.primary },
  list: { padding: 16, gap: 8 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cardHoraire: { color: colors.ink3, fontSize: 12, fontWeight: '600', marginBottom: 4, fontVariant: ['tabular-nums'] },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { color: colors.ink, fontSize: 14, fontWeight: '700', flex: 1 },
  emptyText: { color: colors.ink3, fontSize: 13, textAlign: 'center', marginTop: 24 },
  liveTag: { backgroundColor: colors.liveSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  liveTagText: { color: colors.live, fontSize: 10, fontWeight: '800' },
  pubTag: { backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  pubTagText: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  progTag: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  progTagText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
});
