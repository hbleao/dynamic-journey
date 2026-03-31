"use client";

import { journeyStore } from "./journeyStore";

export function useJourneyStore() {
  const fields = journeyStore((s) => s.fields);
  const mergeFields = journeyStore((s) => s.mergeFields);
  const error = journeyStore((s) => s.error);
  const setError = journeyStore((s) => s.setError);
  const business = journeyStore((s) => s.business);
  const mergeBusiness = journeyStore((s) => s.mergeBusiness);
  const services = journeyStore((s) => s.services);
  const mergeServices = journeyStore((s) => s.mergeServices);
  const reset = journeyStore((s) => s.reset);

  return {
    fields,
    mergeFields,
    error,
    setError,
    business,
    mergeBusiness,
    services,
    mergeServices,
    reset,
  };
}
