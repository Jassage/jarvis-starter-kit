# ErsatzTV + MediaMTX — instance de test locale

Moteur de playout du client (existant, non recodé — cf. `../backend/src/integrations/ersatztv.ts`).
Ce dossier n'est là que pour tester en local ; en production, les mêmes images tournent sur le VPS du client.

## Pourquoi MediaMTX ?

Bunny (et la plupart des CDN) ne font que du **re-streaming HLS** : ils cachent/distribuent un flux
HLS qui doit déjà exister quelque part — ils ne transforment pas du RTMP en HLS. MediaMTX est ce
maillon manquant entre l'encodeur terrain (OBS/Larix) et le CDN.

```
OBS/Larix --RTMP--> MediaMTX --HLS--> Bunny Pull Zone (origin = ce HLS) --> player ANTENN
```

## Démarrer

```bash
docker compose up -d
```

- ErsatzTV : http://localhost:8409
- MediaMTX ingest RTMP : `rtmp://localhost:1935/test`
- MediaMTX sortie HLS : http://localhost:8888/test/index.m3u8

## Config initiale ErsatzTV

1. Ajouter une **Media Source** pointant vers `./medias` (les fichiers déposés dans ce dossier sont visibles dans le conteneur sous `/media`).
2. Créer une **Channel**.
3. Définir un **FFmpeg Profile** (résolution/bitrate de sortie).
4. Construire un **Schedule** minimal pour valider que la chaîne diffuse.

## Tester le direct (RTMP → HLS)

1. Dans OBS Studio → Réglages → Flux → Serveur personnalisé : `rtmp://localhost:1935/test` (pas de clé, ou n'importe laquelle après le nom du path).
2. Démarrer la diffusion.
3. Ouvrir `http://localhost:8888/test/index.m3u8` dans VLC ou coller cette URL dans `NEXT_PUBLIC_CDN_STREAM_URL` du frontend ANTENN pour vérifier la lecture.

## En production

- MediaMTX tourne sur le même VPS qu'ErsatzTV (ou un serveur dédié streaming), avec le port 1935 ouvert publiquement pour l'ingest.
- Créer un **Pull Zone Bunny** dont l'origin pointe vers `http://<ip-du-vps>:8888/<stream-key>/index.m3u8` — Bunny se charge alors du cache/CDN à grande échelle. C'est l'URL Bunny résultante (pas l'URL MediaMTX directe) qui va dans `CDN_BASE_URL`.
- Le champ `Match.ingestUrlRtmp` dans ANTENN contient alors `rtmp://<ip-du-vps>:1935/<stream-key>`.

## Arrêter

```bash
docker compose down
```
