"use client";
import { useState } from "react";
import { Check, Star, Zap, Eye, RotateCcw, Heart, CreditCard, Smartphone } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import toast from "react-hot-toast";

const FEATURES = [
  { icon: Eye, label: "Voir qui t'a liké", desc: "Accède à la liste complète des personnes qui t'ont liké" },
  { icon: Star, label: "Super Likes illimités", desc: "Envoie autant de Super Likes que tu veux chaque jour" },
  { icon: RotateCcw, label: "Retour en arrière illimité", desc: "Annule autant de swipes que tu veux" },
  { icon: Zap, label: "Boost mensuel", desc: "Ton profil est mis en avant pendant 30 minutes" },
  { icon: Heart, label: "Plus de matchs", desc: "Priorité dans le discover pour tous les utilisateurs" },
];

const PLANS = [
  { id: "1mo", label: "1 mois",  price: "$5",  monthly: "$5/mois",     popular: false },
  { id: "3mo", label: "3 mois",  price: "$12", monthly: "$4/mois",     popular: true,  save: "Économise 20%" },
  { id: "6mo", label: "6 mois",  price: "$20", monthly: "$3.3/mois",   popular: false, save: "Économise 33%" },
];

export default function PremiumPage() {
  const { user } = useAuthStore();
  const isPremium = user?.subscriptionPlan !== "FREE";
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<"stripe" | "moncash" | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayModal(true);
  };

  const payWithStripe = async () => {
    if (!selectedPlan) return;
    setLoading("stripe");
    try {
      const res = await api.post("/payments/stripe/create-checkout", { planId: selectedPlan });
      const { url } = res.data.data;
      if (url) window.location.href = url;
    } catch {
      toast.error("Erreur lors de la redirection vers Stripe");
    } finally {
      setLoading(null);
    }
  };

  const payWithMoncash = async () => {
    if (!selectedPlan) return;
    setLoading("moncash");
    try {
      const res = await api.post("/payments/moncash/create", { planId: selectedPlan });
      const { redirectUrl } = res.data.data;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch {
      toast.error("Erreur lors de la redirection vers MonCash");
    } finally {
      setLoading(null);
    }
  };

  if (isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-4 px-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>✨</div>
        <h2 className="text-xl font-bold text-gray-800">Tu es déjà Premium !</h2>
        <p className="text-gray-400 text-sm">Profite de tous les avantages sans limite.</p>
        <Link href="/discover" className="px-6 py-2.5 rounded-full text-white font-semibold text-sm" style={{ background: "#D4537E" }}>
          Continuer à swiper
        </Link>
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
            key={plan.id}
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
                onClick={() => handleSelectPlan(plan.id)}
                className="mt-1 text-xs font-bold px-4 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ background: plan.popular ? "#D4537E" : "#9ca3af" }}
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

      {/* Modal choix du moyen de paiement */}
      {showPayModal && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowPayModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-800 text-lg mb-1">Choisir le paiement</h3>
            <p className="text-sm text-gray-400 mb-5">
              Plan sélectionné : <strong>{PLANS.find(p => p.id === selectedPlan)?.label}</strong> — {PLANS.find(p => p.id === selectedPlan)?.price}
            </p>

            {/* Stripe */}
            <button
              onClick={payWithStripe}
              disabled={loading !== null}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all mb-3 disabled:opacity-50"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <CreditCard size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">Carte bancaire</p>
                <p className="text-xs text-gray-400">Visa, Mastercard, via Stripe</p>
              </div>
              {loading === "stripe" && <span className="ml-auto text-xs text-blue-500 animate-pulse">Chargement...</span>}
            </button>

            {/* MonCash */}
            <button
              onClick={payWithMoncash}
              disabled={loading !== null}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: "#E30613" }}>
                <Smartphone size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">MonCash</p>
                <p className="text-xs text-gray-400">Paiement mobile Digicel</p>
              </div>
              {loading === "moncash" && <span className="ml-auto text-xs text-red-500 animate-pulse">Chargement...</span>}
            </button>

            <button
              onClick={() => setShowPayModal(false)}
              className="w-full mt-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
