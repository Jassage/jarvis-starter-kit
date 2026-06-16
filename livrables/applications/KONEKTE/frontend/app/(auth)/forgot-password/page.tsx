"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center flex flex-col gap-4">
        <div className="text-5xl">📩</div>
        <h2 className="text-lg font-semibold text-gray-800">Vérifie ta boîte mail</h2>
        <p className="text-gray-500 text-sm">Si cet email existe, tu recevras un lien pour réinitialiser ton mot de passe.</p>
        <Link href="/login" className="btn-primary block">Retour à la connexion</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">Mot de passe oublié</h2>
      <p className="text-sm text-gray-500">Entre ton email et on t&apos;envoie un lien de réinitialisation.</p>
      <input type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer le lien"}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" style={{ color: "#D4537E" }}>← Retour à la connexion</Link>
      </p>
    </form>
  );
}
