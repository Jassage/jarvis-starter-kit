"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";

const CITIES = ["Port-au-Prince", "Pétionville", "Delmas", "Carrefour", "Cap-Haïtien", "Gonaïves", "Les Cayes", "Jacmel", "Saint-Marc", "Pignon", "Gros-Morne", "Autre"];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    birthDate: "",
    gender: "",
    city: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    try {
      await register(form);
      toast.success("Bienvenue sur Konekte !");
      router.push("/discover");
    } catch {
      toast.error("Erreur lors de l'inscription. Vérifie tes informations.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {step === 1 && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Crée ton compte</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" placeholder="Marie" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" placeholder="ton@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">Suivant →</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Parle-nous de toi</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} required max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Je suis</label>
            <div className="flex gap-3">
              {["HOMME", "FEMME"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update("gender", g)}
                  className="flex-1 py-2 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: form.gender === g ? "#D4537E" : "white",
                    color: form.gender === g ? "white" : "#D4537E",
                    borderColor: "#D4537E",
                  }}
                >
                  {g === "HOMME" ? "Un homme" : "Une femme"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <select value={form.city} onChange={(e) => update("city", e.target.value)} required>
              <option value="">Choisir une ville</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" className="btn-outline flex-1" onClick={() => setStep(1)}>← Retour</button>
            <button type="submit" className="btn-primary flex-1" disabled={isLoading || !form.gender || !form.city}>
              {isLoading ? "Création..." : "Créer mon profil"}
            </button>
          </div>
        </>
      )}

      <p className="text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link href="/login" style={{ color: "#D4537E", fontWeight: 500 }}>Se connecter</Link>
      </p>
    </form>
  );
}
