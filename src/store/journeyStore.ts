import { create } from "zustand";

type JourneyState = {
  stepSlug: string;
  fields: Record<string, unknown>;
  error: Record<string, unknown>;
  business: Record<string, unknown>;
  services: Record<string, unknown>;
  setStepSlug: (stepSlug: string) => void;
  setFields: (fields: Record<string, unknown>) => void;
  mergeFields: (partial: Record<string, unknown>) => void;
  setError: (error: Record<string, unknown>) => void;
  mergeBusiness: (partial: Record<string, unknown>) => void;
  mergeServices: (partial: Record<string, unknown>) => void;
  reset: () => void;
};

export const journeyStore = create<JourneyState>((set) => ({
  stepSlug: "",
  fields: {},
  error: {},
  business: {},
  services: {},
  setStepSlug: (stepSlug) => set({ stepSlug }),
  setFields: (fields) => set({ fields }),
  mergeFields: (partial) =>
    set((state) => ({ fields: { ...state.fields, ...partial } })),
  setError: (error) => set({ error }),
  mergeBusiness: (partial) =>
    set((state) => ({ business: { ...state.business, ...partial } })),
  mergeServices: (partial) =>
    set((state) => ({ services: { ...state.services, ...partial } })),
  reset: () =>
    set({ stepSlug: "", fields: {}, error: {}, business: {}, services: {} }),
}));
