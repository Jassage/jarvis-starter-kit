"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Token manquant"); return; }

    api.get(`/auth/verify-email/${token}`)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/login"), 4000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err?.response?.data?.error || "Lien invalide ou expiré");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-sm text-center">

        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl animate-pulse" style={{ background: "#FBEAF0" }}>
              ❤
            </div>
            <h1 className="text-lg font-bold text-gray-800 mb-2">Vérification en cours...</h1>
            <p className="text-sm text-gray-400">Merci de patienter quelques secondes.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl" style={{ background: "#d1fae5" }}>
              ✅
            </div>
            <h1 className="text-lg font-bold text-gray-800 mb-2">Email vérifié !</h1>
            <p className="text-sm text-gray-400 mb-6">Ton adresse email a été confirmée. Tu vas être redirigé vers la connexion dans quelques secondes.</p>
            <Link
              href="/login"
              className="block w-full py-3 rounded-full text-white font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, #e8688a, #D4537E)" }}
            >
              Se connecter
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl" style={{ background: "#fee2e2" }}>
              ❌
            </div>
            <h1 className="text-lg font-bold text-gray-800 mb-2">Lien invalide</h1>
            <p className="text-sm text-gray-400 mb-6">{errorMsg}</p>
            <Link
              href="/login"
              className="block w-full py-3 rounded-full text-white font-semibold text-sm"
              style={{ background: "#D4537E" }}
            >
              Retour à la connexion
            </Link>
          </>
        )}

      </div>

      <p className="mt-6 text-xs text-gray-400">
        ❤ Konekte
      </p>
    </div>
  );
}
