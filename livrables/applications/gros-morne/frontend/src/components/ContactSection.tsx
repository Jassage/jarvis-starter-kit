"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Check, AlertCircle } from "lucide-react";
import { contactApi } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const { parametres } = useSiteSettings();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nom = String(formData.get("nom") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const sujet = String(formData.get("sujet") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    setEnvoiEnCours(true);
    try {
      await contactApi.envoyer({ nom, email, sujet: sujet || undefined, message });
      setSent(true);
    } catch {
      setErreur("Impossible d'envoyer le message pour le moment. Réessayez dans un instant.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Contactez-nous</h2>
            {sent ? (
              <div className="bg-green-50 rounded-2xl p-8 flex flex-col items-center text-center">
                <Check className="w-10 h-10 text-green-600 mb-3" />
                <p className="font-bold text-gray-900">Message envoyé !</p>
                <p className="text-sm text-gray-500 mt-1">Nous vous répondrons dans les meilleurs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {erreur && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {erreur}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <input name="nom" required placeholder="Votre nom" className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500" />
                  <input name="email" required type="email" placeholder="Votre email" className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500" />
                </div>
                <input name="sujet" placeholder="Sujet" className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500" />
                <textarea name="message" required rows={5} placeholder="Votre message" className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none" />
                <button type="submit" disabled={envoiEnCours} className="self-start flex items-center gap-2 px-6 py-3 rounded-full bg-green-700 text-white font-bold text-sm hover:bg-green-800 transition-colors disabled:opacity-60">
                  {envoiEnCours ? "Envoi..." : "Envoyer le message"} <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Info + map */}
          <div className="flex flex-col gap-6">
            <div className="bg-gray-50 rounded-3xl p-7 flex flex-col gap-4">
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> {parametres?.adresse || "Rue Principale, Gros-Morne, Haïti"}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-green-600 shrink-0" /> {parametres?.telephone || "+509 1234 5678"}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-green-600 shrink-0" /> {parametres?.email || "info@grosmorne.ht"}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-green-600 shrink-0" /> {parametres?.horaires || "Lun - Ven : 8:00 AM - 4:00 PM"}
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden h-64 bg-gray-100 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 40% 40%, #86efac 0%, transparent 60%)" }} />
              <div className="flex flex-col items-center gap-2 text-gray-400 relative">
                <MapPin className="w-8 h-8 text-green-600" />
                <span className="text-xs font-semibold">Gros-Morne, Artibonite, Haïti</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
