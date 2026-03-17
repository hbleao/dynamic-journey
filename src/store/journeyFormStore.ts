import { create } from "zustand";

export type JourneyFormFields = Record<string, unknown>;
export type JourneyFormError = Record<string, unknown>;
export type JourneyFormBussines = Record<string, unknown>;
export type JourneyFormServices = Record<string, unknown>;

type JourneyFormStore = {
  stepSlug: string;
  fieds: JourneyFormFields;
  error: JourneyFormError;
  bussines: JourneyFormBussines;
  services: JourneyFormServices;
  setStepSlug: (stepSlug: string) => void;
  setFieds: (fieds: JourneyFormFields) => void;
  mergeFieds: (partial: JourneyFormFields) => void;
  setError: (error: JourneyFormError) => void;
  mergeBussines: (partial: JourneyFormBussines) => void;
  mergeServices: (partial: JourneyFormServices) => void;
  reset: () => void;
};

export const useJourneyFormStore = create<JourneyFormStore>((set) => ({
  stepSlug: "",
  fieds: {},
  error: {},
  bussines: {},
  services: {},
  setStepSlug: (stepSlug) => set({ stepSlug }),
  setFieds: (fieds) => set({ fieds }),
  mergeFieds: (partial) =>
    set((state) => ({ fieds: { ...state.fieds, ...partial } })),
  setError: (error) => set({ error }),
  mergeBussines: (partial) =>
    set((state) => ({ bussines: { ...state.bussines, ...partial } })),
  mergeServices: (partial) =>
    set((state) => ({ services: { ...state.services, ...partial } })),
  reset: () =>
    set({ stepSlug: "", fieds: {}, error: {}, bussines: {}, services: {} }),
}));
