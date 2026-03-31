"use client";

import { useEffect } from "react";
import type { NavigationElementType } from "@/components/elementRegistry";
import { useJourneyStore } from "@/store/useJourneyStore";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type JourneyStep = JourneyDefinition["steps"][number];
type JourneyElement = JourneyDefinition["steps"][number]["elements"][number];

export function useJourneySteps(journey: JourneyDefinition) {
  const steps = journey.steps;
  const stepCount = steps.length;

  const { stepSlug, setStepSlug, mergeBusiness } = useJourneyStore();

  const stepSlugToIndex = new Map<string, number>(
    steps.map((step, i) => [step.slug, i]),
  );

  const currentStep: JourneyStep | null =
    stepSlug && stepCount > 0
      ? (steps[stepSlugToIndex.get(stepSlug) ?? 0] ?? null)
      : null;

  const currentStepIndex = currentStep
    ? (stepSlugToIndex.get(currentStep.slug) ?? 0)
    : 0;

  const sortedElements: JourneyElement[] = currentStep?.elements ?? [];

  const navigationElements: NavigationElementType[] = sortedElements.filter(
    (e): e is NavigationElementType => e.type === "NAVIGATION",
  );

  function syncInitialStep() {
    if (stepCount === 0) return;
    if (!stepSlug || !stepSlugToIndex.has(stepSlug)) {
      setStepSlug(steps[0].slug);
    }
  }

  function syncBusiness() {
    mergeBusiness({
      journeyId: journey.id,
      journeySlug: journey.slug,
      stepSlug: currentStep?.slug ?? "",
    });
  }

  useEffect(syncInitialStep, [stepCount, stepSlug, steps, setStepSlug]);
  useEffect(syncBusiness, [journey.id, journey.slug, currentStep?.slug, mergeBusiness]);

  return {
    steps,
    stepCount,
    stepSlugToIndex,
    currentStep,
    currentStepIndex,
    sortedElements,
    navigationElements,
  };
}
