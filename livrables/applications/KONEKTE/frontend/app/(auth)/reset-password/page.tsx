"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { toast.error("Minimum 8 caractères"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Mot de passe réinitialisé !");
      router.push("/login");
    } catch {
      toast.error("Token invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center flex flex-col gap-4">
        <div className="text-5xl">❌</div>
        <p className="text-gray-500">Lien invalide.</p>
        <Link href="/forgot-password" className="btn-primary block">Redemander un lien</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Nouveau mot de passe</h2>
      <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Réinitialisation..." : "Réinitialiser"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
