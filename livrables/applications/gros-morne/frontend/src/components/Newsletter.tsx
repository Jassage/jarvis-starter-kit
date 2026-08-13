"use client";

import { useState } from "react";
import { Mail, Check, AlertCircle } from "lucide-react";
import { newsletterApi } from "@/lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      await newsletterApi.sabonner(email);
      setSent(true);
    } catch {
      setErreur("Inscription impossible pour le moment. Réessayez plus tard.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-green-800 to-green-600">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 30%, white 0%, transparent 55%)" }} />
      <div className="relative max-w-5xl mx-auto px-6 sm:px-12 py-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1">Restez informé</h3>
          <p className="text-green-100 text-sm">
            Abonnez-vous à notre newsletter pour recevoir les dernières actualités et informations.
          </p>
          {erreur && (
            <p className="text-white/90 bg-red-900/30 rounded-full px-3 py-1 text-xs inline-flex items-center gap-1.5 mt-2">
              <AlertCircle className="w-3.5 h-3.5" /> {erreur}
            </p>
          )}
        </div>
        {sent ? (
          <div className="flex items-center gap-2 text-white font-semibold bg-white/15 px-5 py-3 rounded-full shrink-0">
            <Check className="w-4 h-4" /> Merci de votre inscription !
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full sm:w-auto gap-2 shrink-0">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="flex-1 sm:w-64 px-4 py-3 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button type="submit" disabled={envoiEnCours} className="px-6 py-3 rounded-full bg-white text-green-800 font-bold text-sm hover:bg-green-50 transition-colors disabled:opacity-60">
              {envoiEnCours ? "..." : "S'abonner"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
