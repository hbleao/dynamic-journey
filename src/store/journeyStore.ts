import { create } from "zustand";

type JourneyState = {
  fields: Record<string, unknown>;
  error: Record<string, unknown>;
  business: Record<string, unknown>;
  services: Record<string, unknown>;
  mergeFields: (partial: Record<string, unknown>) => void;
  setError: (error: Record<string, unknown>) => void;
  mergeBusiness: (partial: Record<string, unknown>) => void;
  mergeServices: (partial: Record<string, unknown>) => void;
  reset: () => void;
};

export const journeyStore = create<JourneyState>((set) => ({
  fields: {},
  error: {},
  business: {},
  services: {},
  mergeFields: (partial) =>
    set((state) => ({ fields: { ...state.fields, ...partial } })),
  setError: (error) => set({ error }),
  mergeBusiness: (partial) =>
    set((state) => ({ business: { ...state.business, ...partial } })),
  mergeServices: (partial) =>
    set((state) => ({ services: { ...state.services, ...partial } })),
  reset: () => set({ fields: {}, error: {}, business: {}, services: {} }),
}));
