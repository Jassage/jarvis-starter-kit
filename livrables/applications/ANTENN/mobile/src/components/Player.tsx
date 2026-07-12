import { View, Text, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { env } from '../config/env';
import { colors } from '../theme/colors';

// Lecture HLS native (AVPlayer sur iOS, ExoPlayer sur Android via expo-video) —
// généralement plus fiable que le HLS natif d'un navigateur desktop (cf. le bug
// de démuxage Chrome rencontré et corrigé côté player web, HlsPlayer.tsx).
export default function Player({ enDirect }: { enDirect: boolean }) {
  const streamUrl = env.cdnStreamUrl;

  const player = useVideoPlayer(streamUrl || null, (p) => {
    if (streamUrl) {
      p.loop = false;
      p.muted = true;
      p.play();
    }
  });

  if (!streamUrl) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Ionicons name="tv-outline" size={40} color={colors.ink3} />
        <Text style={styles.emptyTitle}>{enDirect ? 'Direct en préparation...' : 'Hors antenne'}</Text>
        <Text style={styles.emptyHint}>
          Aucun flux CDN configuré (EXPO_PUBLIC_CDN_STREAM_URL). Le player s'activera dès que le CDN de diffusion sera provisionné.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture nativeControls />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  emptyTitle: {
    color: colors.ink2,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyHint: {
    color: colors.ink3,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
  },
});
