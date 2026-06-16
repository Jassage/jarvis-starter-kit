"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      router.push("/discover");
    } catch {
      toast.error("Email ou mot de passe incorrect");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="ton@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>

      <p className="text-center text-sm">
        <Link href="/forgot-password" style={{ color: "#D4537E" }}>Mot de passe oublié ?</Link>
      </p>
      <p className="text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link href="/register" style={{ color: "#D4537E", fontWeight: 500 }}>
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
