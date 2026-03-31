"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { FormValues } from "@/components/elements/TextInputElement";
import { journeyStore } from "@/store/journeyStore";
import { useJourneyStore } from "@/store/useJourneyStore";
import { getByPath } from "@/utils/getByPath";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { buildJourneyFormSchema } from "@/validation/validations";

type JourneyStep = JourneyDefinition["steps"][number];
type JourneyElement = JourneyStep["elements"][number];

function isFieldFilled(value: unknown): boolean {
  return value != null && value !== "";
}

function resolveDefaultValue(
  cfg: Record<string, unknown>,
  services: Record<string, unknown>,
): string | undefined {
  if (cfg.defaultValue) return String(cfg.defaultValue);

  const from = cfg.defaultValueFrom as { service?: string; path?: string } | undefined;
  if (!from?.service || !from?.path) return undefined;

  const value = getByPath(services[from.service], from.path);
  return value != null ? String(value) : undefined;
}

function computePrefillValues(
  elements: JourneyElement[],
  currentValues: FormValues,
  services: Record<string, unknown>,
): Record<string, string> {
  const prefill: Record<string, string> = {};

  for (const element of elements) {
    if (element.type !== "TEXT_INPUT" && element.type !== "CPF_INPUT") continue;

    const cfg = element.config as Record<string, unknown>;
    const name = cfg.name as string;
    if (!name || isFieldFilled(currentValues[name])) continue;

    const defaultValue = resolveDefaultValue(cfg, services);
    if (defaultValue) prefill[name] = defaultValue;
  }

  return prefill;
}

export function useJourneyForm(
  journey: JourneyDefinition,
  currentStep: JourneyStep | null,
) {
  const { mergeFields, services } = useJourneyStore();

  const { schema, stepFields } = buildJourneyFormSchema(journey);

  const {
    control,
    register,
    handleSubmit,
    trigger,
    getValues,
    getFieldState,
    setValue,
    formState,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: useRef(journeyStore.getState().fields).current,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const currentStepFields: string[] = currentStep
    ? (stepFields[currentStep.id] ?? [])
    : [];

  const watchedValues = watch();

  function canProceed(): boolean {
    if (!currentStep || currentStepFields.length === 0) return true;
    const result = schema.safeParse(watchedValues);
    if (result.success) return true;
    const errorFields = new Set(
      result.error.issues
        .map((issue) => issue.path[0])
        .filter((key): key is string => typeof key === "string"),
    );
    return !currentStepFields.some((field) => errorFields.has(field));
  }

  function applyPrefill() {
    if (!currentStep) return;

    const prefill = computePrefillValues(
      currentStep.elements,
      getValues(),
      services,
    );
    if (Object.keys(prefill).length === 0) return;

    for (const [key, value] of Object.entries(prefill)) {
      setValue(key as never, value as never, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });
    }
    mergeFields(prefill);
  }

  useEffect(applyPrefill, [currentStep, getValues, mergeFields, services, setValue]);

  return {
    schema,
    stepFields,
    control,
    register,
    handleSubmit,
    trigger,
    getValues,
    getFieldState,
    setValue,
    formState,
    currentStepFields,
    canProceed: canProceed(),
  };
}
