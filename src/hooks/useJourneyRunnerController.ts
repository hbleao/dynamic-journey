"use client";

import { useJourneyStore } from "@/store/useJourneyStore";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { useJourneyForm } from "./useJourneyForm";
import { useJourneyNavigation } from "./useJourneyNavigation";
import { useJourneySteps } from "./useJourneySteps";

export type { GoNextOptions } from "./useJourneyNavigation";

export function useJourneyRunnerController(journey: JourneyDefinition) {
  const steps = useJourneySteps(journey);
  const form = useJourneyForm(journey, steps.currentStep);
  const navigation = useJourneyNavigation({
    steps: steps.steps,
    currentStep: steps.currentStep,
    currentStepIndex: steps.currentStepIndex,
    stepSlugToIndex: steps.stepSlugToIndex,
    currentStepFields: form.currentStepFields,
    getValues: form.getValues,
    handleSubmit: form.handleSubmit,
    trigger: form.trigger,
    getFieldState: form.getFieldState,
  });

  const { error: storedError, business } = useJourneyStore();
  const storedErrorEntries = Object.entries(storedError).filter(
    ([, v]) => !!v,
  ) as Array<[string, string]>;

  return {
    steps: steps.steps,
    stepCount: steps.stepCount,
    currentStep: steps.currentStep,
    currentStepIndex: steps.currentStepIndex,
    sortedElements: steps.sortedElements,
    navigationElements: steps.navigationElements,
    register: form.register,
    control: form.control,
    formState: form.formState,
    getValues: form.getValues,
    canProceed: form.canProceed,
    business,
    storedError,
    storedErrorEntries,
    goNext: navigation.goNext,
    goPrev: navigation.goPrev,
    submitted: navigation.submitted,
    setSubmitted: navigation.setSubmitted,
  };
}
