"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, authChecked, bootstrap } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Attend que Zustand persist ait fini d'hydrater (le user affiché de
    // façon optimiste ; le token, lui, n'est plus persisté du tout)
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    // L'access token ne survit pas à un rechargement de page (il n'est plus
    // en localStorage) : on l'échange contre un nouveau via le cookie
    // httpOnly de refresh avant de décider si l'utilisateur est connecté.
    if (hydrated && !authChecked) bootstrap();
  }, [hydrated, authChecked, bootstrap]);

  useEffect(() => {
    if (authChecked && !token) router.replace("/login");
  }, [authChecked, token, router]);

  if (!hydrated || !authChecked) return null;
  if (!token) return null;
  return <>{children}</>;
}
