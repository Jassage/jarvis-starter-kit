"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Package,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const FEATURES = [
  {
    icon: Package,
    title: "Stock intelligent",
    description:
      "Gestion multi-emplacement en temps réel avec alertes automatiques",
  },
  {
    icon: ShoppingCart,
    title: "Ventes unifiées",
    description: "Centralisez ventes, achats et transferts en un seul flux",
  },
  {
    icon: BarChart3,
    title: "Analytique intégrée",
    description: "Tableaux de bord et comptabilité pour piloter votre activité",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.motDePasse);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Identifiants invalides");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Panneau de marque - Redesign */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                GESCOM
              </h1>
              <p className="text-xs text-blue-200/60">Gestion Commerciale</p>
            </div>
          </div>

          {/* Contenu central */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-blue-200 mb-4">
                <Sparkles className="w-3 h-3" />
                Nouvelle version 3.0
              </div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-3">
                Votre business,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                  en toute simplicité
                </span>
              </h2>
              <p className="text-blue-200/70 text-lg leading-relaxed">
                La plateforme tout-en-un qui transforme votre gestion
                commerciale au quotidien.
              </p>
            </div>

            {/* Features interactives */}
            <div className="grid gap-4">
              {FEATURES.map((feature, index) => (
                <button
                  key={feature.title}
                  onClick={() => setActiveFeature(index)}
                  className={`text-left p-4 rounded-2xl transition-all duration-300 cursor-pointer
                    ${
                      activeFeature === index
                        ? "bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${activeFeature === index ? "bg-blue-500 text-white" : "bg-white/10 text-blue-300"}`}
                    >
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold mb-1 transition-colors
                        ${activeFeature === index ? "text-white" : "text-blue-100"}`}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm text-blue-200/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-blue-200/40">
            <span>© {new Date().getFullYear()} GESCOM</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-200/80 transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-blue-200/80 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau formulaire - Redesign */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">GESCOM</span>
            </div>
          </div>

          {/* En-tête formulaire */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Bienvenue
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Connectez-vous
            </h2>
            <p className="text-slate-500">
              Accédez à votre espace de gestion en quelques secondes.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vous@gescom.ht"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                    placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={form.motDePasse}
                  onChange={(e) =>
                    setForm({ ...form, motDePasse: e.target.value })
                  }
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                    placeholder:text-slate-400 text-slate-800 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg 
                    hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={
                    showPwd
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  Se souvenir de moi
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">!</span>
                  </div>
                  {error}
                </div>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 
                text-white font-semibold hover:from-blue-700 hover:to-indigo-700 
                focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode démonstration */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Compte de démonstration
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({ email: "admin@gescom.ht", motDePasse: "Admin@123" })
                }
                className="w-full p-3 rounded-lg bg-white border border-slate-200 
                  hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-slate-700">
                      Super Admin
                    </div>
                    <div className="text-xs text-slate-500">
                      admin@gescom.ht
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Remplir →
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
