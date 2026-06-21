"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function PremiumSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    refreshUser().catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5 px-6">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
        style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
      >
        ✨
      </div>
      <div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Bienvenue dans Premium !</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Ton paiement a été confirmé. Tous les avantages Premium sont maintenant actifs sur ton compte.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/discover"
          className="py-3 rounded-full text-white font-bold text-sm text-center"
          style={{ background: "linear-gradient(135deg, #e8688a, #D4537E)" }}
        >
          Commencer à swiper ✨
        </Link>
        <Link
          href="/likes"
          className="py-3 rounded-full font-semibold text-sm text-center border-2"
          style={{ borderColor: "#D4537E", color: "#D4537E" }}
        >
          Voir qui m'a liké
        </Link>
      </div>
    </div>
  );
}
