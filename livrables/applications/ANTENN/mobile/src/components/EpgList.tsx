import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CreneauEpg } from '../api/epg.api';
import { colors } from '../theme/colors';

function titre(c: CreneauEpg): string {
  return c.match ? `${c.match.nomEvenement} — ${c.match.equipes}` : c.contenu?.titre || 'Programme';
}

function horaire(c: CreneauEpg): string {
  const debut = new Date(c.dateHeureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fin = new Date(c.dateHeureFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${debut} – ${fin}`;
}

export default function EpgList({ enCours, aSuivre }: { enCours: CreneauEpg | null; aSuivre: CreneauEpg[] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>EN CE MOMENT</Text>
      {enCours ? (
        <View style={[styles.card, styles.cardCurrent]}>
          {enCours.typeCreneau === 'MATCH_DIRECT' && (
            <View style={styles.liveTag}>
              <Text style={styles.liveTagText}>DIRECT</Text>
            </View>
          )}
          <Text style={styles.cardTitle}>{titre(enCours)}</Text>
          <Text style={styles.cardHoraire}>{horaire(enCours)}</Text>
        </View>
      ) : (
        <Text style={styles.emptyText}>Aucun programme en cours.</Text>
      )}

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>À SUIVRE</Text>
      {aSuivre.length === 0 ? (
        <Text style={styles.emptyText}>Rien de prévu pour l'instant.</Text>
      ) : (
        aSuivre.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitleSmall} numberOfLines={1}>{titre(c)}</Text>
              {c.typeCreneau === 'MATCH_DIRECT' && <Ionicons name="football-outline" size={14} color={colors.live} />}
            </View>
            <Text style={styles.cardHoraire}>{horaire(c)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionLabel: {
    color: colors.ink3,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cardCurrent: {
    borderColor: colors.primarySoft,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  cardTitleSmall: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  cardHoraire: {
    color: colors.ink3,
    fontSize: 12,
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.liveSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  liveTagText: {
    color: colors.live,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.ink3,
    fontSize: 13,
  },
});
