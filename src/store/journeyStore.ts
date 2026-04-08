import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type JourneyState = {
  fields: Record<string, unknown>;
  error: Record<string, unknown>;
  business: Record<string, unknown>;
  services: Record<string, unknown>;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  mergeFields: (partial: Record<string, unknown>) => void;
  setError: (error: Record<string, unknown>) => void;
  mergeBusiness: (partial: Record<string, unknown>) => void;
  mergeServices: (partial: Record<string, unknown>) => void;
  reset: () => void;
};

export const journeyStore = create<JourneyState>()(
  persist(
    (set) => ({
      fields: {},
      error: {},
      business: {},
      services: {},
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      mergeFields: (partial) =>
        set((state) => ({ fields: { ...state.fields, ...partial } })),
      setError: (error) => set({ error }),
      mergeBusiness: (partial) =>
        set((state) => ({ business: { ...state.business, ...partial } })),
      mergeServices: (partial) =>
        set((state) => ({ services: { ...state.services, ...partial } })),
      reset: () => set({ fields: {}, error: {}, business: {}, services: {} }),
    }),
    {
      name: "journey-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : undefined as never,
      ),
      partialize: (state) => ({
        fields: state.fields,
        error: state.error,
        business: state.business,
        services: state.services,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
