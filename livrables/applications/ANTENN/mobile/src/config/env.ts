export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4006/api',
  // Jamais codée en dur — vide tant qu'aucun flux HLS réel n'est configuré
  // (cf. ANTENN/backend et ANTENN/frontend, même convention).
  cdnStreamUrl: process.env.EXPO_PUBLIC_CDN_STREAM_URL ?? '',
};
