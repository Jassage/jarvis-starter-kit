import { useEffect, useRef, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/auth.store";
import { useSocketStore } from "../store/socket.store";
import { useOnboardingStore } from "../store/onboarding.store";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import SplashLogoScreen from "../screens/SplashLogoScreen";

// Durée minimale d'affichage du logo pour éviter un flash trop bref sur
// les connexions rapides (bootstrap() résolu quasi instantanément en local).
const MIN_SPLASH_MS = 700;

export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const authChecked = useAuthStore((s) => s.authChecked);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const connectSocket = useSocketStore((s) => s.connect);
  const disconnectSocket = useSocketStore((s) => s.disconnect);

  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const onboardingHydrated = useOnboardingStore((s) => s.hydrated);

  const mountedAt = useRef(Date.now());
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (user && token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [user, token, connectSocket, disconnectSocket]);

  const ready = authChecked && onboardingHydrated;

  useEffect(() => {
    if (!ready) return;
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(MIN_SPLASH_MS - elapsed, 0);
    const timer = setTimeout(() => setMinDelayElapsed(true), remaining);
    return () => clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (ready && minDelayElapsed) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, minDelayElapsed]);

  if (!ready || !minDelayElapsed) {
    return <SplashLogoScreen />;
  }

  if (!user && !hasSeenOnboarding) {
    return <OnboardingScreen />;
  }

  return <NavigationContainer>{user ? <AppTabs /> : <AuthStack />}</NavigationContainer>;
}
