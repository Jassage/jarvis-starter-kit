import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { db } from "./firebase.js";
import type { ResultatBorlette } from "./borlette/mapping.js";

const expo = new Expo();

const LABEL_ETAT: Record<string, string> = { NY: "New York", FL: "Florida" };
const LABEL_MOMENT: Record<string, string> = { MIDI: "Midi", SOIR: "Aswe" };

/**
 * Recupere les tokens push des utilisateurs abonnes aux resultats borlette.
 * Les tokens sont ecrits par l'app dans `push_tokens/{token}` avec un flag
 * `bolet: true`. On ne stocke que le token, aucune donnee personnelle.
 */
async function tokensAbonnesBolet(): Promise<string[]> {
  const snap = await db
    .collection("push_tokens")
    .where("bolet", "==", true)
    .get();
  return snap.docs
    .map((d) => d.get("token") as string)
    .filter((t) => Expo.isExpoPushToken(t));
}

/** Notifie tous les abonnes qu'un tirage vient de sortir. */
export async function notifierTirage(r: ResultatBorlette): Promise<void> {
  const tokens = await tokensAbonnesBolet();
  if (tokens.length === 0) return;

  const titre = `${LABEL_ETAT[r.etat] ?? r.etat} — ${LABEL_MOMENT[r.moment] ?? r.moment}`;
  const corps = `1ye ${r.premyeLo} · 2em ${r.dezyemLo} · 3em ${r.twazyemLo}  (L3 ${r.lotto3} · L4 ${r.lotto4})`;

  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: titre,
    body: corps,
    data: { type: "tirage", id: `${r.date}_${r.etat}_${r.moment}` },
  }));

  for (const lot of expo.chunkPushNotifications(messages)) {
    try {
      await expo.sendPushNotificationsAsync(lot);
    } catch (e) {
      console.error("Echec envoi lot de notifications:", e);
    }
  }
}
