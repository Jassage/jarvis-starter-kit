"use client";
import { Check, Star, Zap, Eye, RotateCcw, Heart } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

const FEATURES = [
  { icon: Eye, label: "Voir qui t'a liké", desc: "Accède à la liste complète des personnes qui t'ont liké" },
  { icon: Star, label: "Super Likes illimités", desc: "Envoie autant de Super Likes que tu veux chaque jour" },
  { icon: RotateCcw, label: "Retour en arrière illimité", desc: "Annule autant de swipes que tu veux" },
  { icon: Zap, label: "Boost mensuel", desc: "Ton profil est mis en avant pendant 30 minutes" },
  { icon: Heart, label: "Plus de matchs", desc: "Priorité dans le discover pour tous les utilisateurs" },
];

const PLANS = [
  { label: "1 mois", price: "5$", monthly: "5$/mois", popular: false },
  { label: "3 mois", price: "12$", monthly: "4$/mois", popular: true, save: "Économise 20%" },
  { label: "6 mois", price: "20$", monthly: "3.3$/mois", popular: false, save: "Économise 33%" },
];

export default function PremiumPage() {
  const { user } = useAuthStore();
  const isPremium = user?.subscriptionPlan !== "FREE";

  if (isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4 px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>✨</div>
        <h2 className="text-xl font-bold text-gray-800">Tu es déjà Premium !</h2>
        <p className="text-gray-400 text-sm">Profite de tous les avantages sans limite.</p>
        <Link href="/discover" className="btn-primary">Continuer à swiper</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-6 flex flex-col gap-5">
      {/* Header */}
      <div
        className="rounded-3xl p-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #e8688a 0%, #D4537E 50%, #993556 100%)" }}
      >
        <div className="text-4xl mb-3">✨</div>
        <h1 className="text-2xl font-black mb-1">Konekte Premium</h1>
        <p className="text-white/80 text-sm">Trouve l'amour plus vite avec tous les avantages</p>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <h2 className="font-bold text-gray-800">Ce que tu obtiens</h2>
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FBEAF0" }}>
              <Icon size={17} style={{ color: "#D4537E" }} />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Check size={16} className="ml-auto flex-shrink-0 mt-0.5 text-green-400" />
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-gray-800">Choisir un plan</h2>
        {PLANS.map((plan) => (
          <div
            key={plan.label}
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between border-2 transition-all"
            style={{ borderColor: plan.popular ? "#D4537E" : "transparent" }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">{plan.label}</span>
                {plan.popular && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#D4537E" }}>
                    POPULAIRE
                  </span>
                )}
                {plan.save && !plan.popular && (
                  <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{plan.save}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{plan.monthly}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-lg text-gray-800">{plan.price}</p>
              <button
                className="mt-1 text-xs font-bold px-4 py-1.5 rounded-full text-white"
                style={{ background: plan.popular ? "#D4537E" : "#9ca3af" }}
                onClick={() => alert("Intégration paiement à venir (Stripe / MonCash)")}
              >
                Choisir
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-400 px-4">
        Paiement sécurisé · Annulation à tout moment · Sans engagement
      </p>
    </div>
  );
}
