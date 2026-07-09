import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hydrated: boolean;
  completeOnboarding: () => void;
  setHydrated: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      hydrated: false,
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "konekte_onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
