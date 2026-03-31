"use client";

import { useState } from "react";
import type {
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormTrigger,
} from "react-hook-form";
import type { FormValues } from "@/components/elements/TextInputElement";
import { dispatchNavigate } from "@/hooks/useCurrentPathname";
import { callService } from "@/services/serviceRegistry";
import { useJourneyStore } from "@/store/useJourneyStore";
import { joinPaths } from "@/utils/joinPaths";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type JourneyStep = JourneyDefinition["steps"][number];

export type GoNextOptions =
  | { type: "navigation"; targetSlug: string }
  | { type: "service"; serviceName: string; targetSlug: string }
  | { type: "next" };

type SubmittedPayload = {
  fields: FormValues;
  error: Record<string, unknown>;
  business: Record<string, unknown>;
  services: Record<string, unknown>;
};

type UseJourneyNavigationParams = {
  steps: JourneyDefinition["steps"];
  currentStep: JourneyStep | null;
  currentStepIndex: number;
  currentStepFields: string[];
  getValues: UseFormGetValues<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  trigger: UseFormTrigger<FormValues>;
  getFieldState: UseFormGetFieldState<FormValues>;
};

export function useJourneyNavigation({
  steps,
  currentStep,
  currentStepIndex,
  currentStepFields,
  getValues,
  handleSubmit,
  trigger,
  getFieldState,
}: UseJourneyNavigationParams) {
  const { mergeFields, setError, mergeServices, business, services } =
    useJourneyStore();

  const [submitted, setSubmitted] = useState<SubmittedPayload | null>(null);

  function redirectTo(urlOrSlug: string) {
    const baseUrl = (business.base_url as string) ?? "";
    const fullUrl = baseUrl ? joinPaths(baseUrl, urlOrSlug) : urlOrSlug;

    if (/^https?:\/\//i.test(fullUrl)) {
      try {
        const target = new URL(fullUrl);
        if (target.origin !== window.location.origin) {
          window.location.href = fullUrl;
          return;
        }
        window.history.pushState(null, "", target.pathname + target.search);
      } catch {}
      return;
    }

    const path = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
    window.history.pushState(null, "", path);
    dispatchNavigate();
  }

  async function validateCurrentStep(): Promise<boolean> {
    if (!currentStep || currentStepFields.length === 0) return true;

    const ok = await trigger(currentStepFields);
    if (!ok) {
      const fieldErrors: Record<string, string> = {};
      for (const field of currentStepFields) {
        const message = getFieldState(field).error?.message;
        if (message) fieldErrors[field] = message;
      }
      setError(fieldErrors);
      return false;
    }

    setError({});
    mergeFields(getValues());
    return true;
  }

  async function goNext(options: GoNextOptions = { type: "next" }) {
    if (!currentStep) return;

    const valid = await validateCurrentStep();
    if (!valid) return;

    if (options.type === "service") {
      const input = getValues();
      const result = await callService(options.serviceName, {
        serviceName: options.serviceName,
        fields: input,
        business,
      });
      mergeServices({ [options.serviceName]: result });
      if (!result.success) {
        setError({ service: result.error });
        return;
      }

      redirectTo(options.targetSlug);
      return;
    }

    if (options.type === "navigation") {
      redirectTo(options.targetSlug);
      return;
    }

    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      redirectTo(nextStep.slug);
      return;
    }

    handleSubmit((values) => {
      mergeFields(values);
      setError({});
      setSubmitted({ fields: values, error: {}, business, services });
    })();
  }

  function goPrev() {
    if (!currentStep?.backStepSlug) return;
    const backStepSlug = currentStep.backStepSlug;

    mergeFields(getValues());

    if (backStepSlug === "/") {
      redirectTo("/");
      return;
    }
    redirectTo(backStepSlug);
  }

  return { goNext, goPrev, submitted, setSubmitted };
}
