import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/colors';

/**
 * Lecteur VOD (replay) — même moteur natif que Player.tsx (expo-video : AVPlayer
 * sur iOS, ExoPlayer sur Android), mais la source vient d'une prop : chaque replay
 * a son propre fichier, contrairement au direct qui n'a qu'une URL de flux.
 *
 * Contrairement au direct, pas de lecture automatique ni de son coupé : un replay
 * se regarde à la demande, le spectateur déclenche lui-même la lecture.
 */
export default function VodPlayer({ src, onDemarrage }: { src: string; onDemarrage?: () => void }) {
  const demarre = useRef(false);
  const player = useVideoPlayer(src || null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (!player) return;
    // Une seule vue comptée par visionnage, même après pause/reprise.
    const sub = player.addListener('playingChange', (payload: { isPlaying?: boolean }) => {
      if (payload?.isPlaying && !demarre.current) {
        demarre.current = true;
        onDemarrage?.();
      }
    });
    return () => sub?.remove();
  }, [player, onDemarrage]);

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
    borderWidth: 1,
    borderColor: colors.line,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
