"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") return <div className="text-center text-gray-400 py-4">Vérification en cours...</div>;

  if (status === "success") return (
    <div className="text-center flex flex-col gap-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-lg font-semibold text-gray-800">Email vérifié !</h2>
      <p className="text-gray-500 text-sm">Ton compte est maintenant actif.</p>
      <Link href="/discover" className="btn-primary block">Commencer à swiper</Link>
    </div>
  );

  return (
    <div className="text-center flex flex-col gap-4">
      <div className="text-5xl">❌</div>
      <h2 className="text-lg font-semibold text-gray-800">Lien invalide</h2>
      <p className="text-gray-500 text-sm">Ce lien est expiré ou invalide.</p>
      <Link href="/login" className="btn-primary block">Retour à la connexion</Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400">Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
