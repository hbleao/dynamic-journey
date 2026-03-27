"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { callService } from "@/services/serviceRegistry";
import { useJourneyFormStore } from "@/store/journeyFormStore";
import { getByPath } from "@/utils/getByPath";
import { joinPaths } from "@/utils/joinPaths";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { buildJourneyFormSchema } from "@/validation/validations";
import type { NavigationElementType } from "../elementRegistry";
import type { FormValues } from "../elements/TextInputElement";

type JourneyStep = JourneyDefinition["steps"][number];
type JourneyElement = JourneyDefinition["steps"][number]["elements"][number];

type SubmittedPayload = {
  fieds: FormValues;
  error: Record<string, unknown>;
  bussines: Record<string, unknown>;
  services: Record<string, unknown>;
};

export function useJourneyRunnerController(journey: JourneyDefinition) {
  const steps = journey.steps; // Os steps são os steps da journey
  const stepCount = steps.length; // O stepCount é a quantidade de steps na journey

  const { schema, stepFields } = useMemo(
    // O schema é o schema do formState
    () => buildJourneyFormSchema(journey),
    [journey],
  );

  const {
    control,
    register,
    handleSubmit,
    trigger,
    getValues,
    getFieldState,
    setValue,
    formState,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: useRef(useJourneyFormStore.getState().fieds).current,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [submitted, setSubmitted] = useState<SubmittedPayload | null>(null);

  const stepSlug = useJourneyFormStore((s) => s.stepSlug);
  const setStepSlug = useJourneyFormStore((s) => s.setStepSlug);
  const setFieds = useJourneyFormStore((s) => s.setFieds);
  const mergeFieds = useJourneyFormStore((s) => s.mergeFieds);
  const setError = useJourneyFormStore((s) => s.setError);
  const mergeBussines = useJourneyFormStore((s) => s.mergeBussines);
  const mergeServices = useJourneyFormStore((s) => s.mergeServices);
  const bussines = useJourneyFormStore((s) => s.bussines);
  const storedError = useJourneyFormStore((s) => s.error);
  const services = useJourneyFormStore((s) => s.services);

  const stepSlugToIndex = useMemo(() => {
    // O stepSlugToIndex é um mapa de stepSlug para seu índice na journey.steps
    const map = new Map<string, number>();
    for (let i = 0; i < steps.length; i += 1) {
      map.set(steps[i].slug, i);
    }
    return map;
  }, [steps]);

  const currentStep: JourneyStep | null = useMemo(() => {
    // O currentStep é o step atual na journey
    if (!stepSlug) return null;
    if (stepCount === 0) return null;
    const resolved =
      stepSlug && stepSlugToIndex.has(stepSlug)
        ? steps[stepSlugToIndex.get(stepSlug) as number]
        : steps[0];
    return resolved ?? null;
  }, [stepCount, stepSlug, stepSlugToIndex, steps]);

  const currentStepIndex = useMemo(() => {
    // O currentStepIndex é o índice do step atual na journey.steps
    if (!currentStep) return 0;
    return stepSlugToIndex.get(currentStep.slug) ?? 0;
  }, [currentStep, stepSlugToIndex]);

  const sortedElements = useMemo<JourneyElement[]>(
    // O sortedElements são os elementos do step atual ordenados por índice
    () => (currentStep ? currentStep.elements : []),
    [currentStep],
  );

  const navigationElements = useMemo<NavigationElementType[]>(
    // O navigationElements são os elementos de navegação do step atual
    () =>
      sortedElements.filter(
        (e): e is NavigationElementType => e.type === "NAVIGATION",
      ),
    [sortedElements],
  );

  const currentStepFields = useMemo<string[]>(
    // O currentStepFields são os campos do step atual
    () => (currentStep ? (stepFields[currentStep.id] ?? []) : []),
    [currentStep, stepFields],
  );

  useEffect(() => {
    // O useEffect valida os campos do step atual
    if (!currentStep) return;
    if (currentStepFields.length === 0) return;
    void trigger(currentStepFields);
  }, [currentStep, currentStepFields, trigger]);

  const canProceed = useMemo(() => {
    // O canProceed é se o usuário pode avanar para o próximo step
    if (!currentStep) return true;
    if (currentStepFields.length === 0) return true;
    for (const field of currentStepFields) {
      if (getFieldState(field, formState).invalid) return false;
    }
    return true;
  }, [currentStep, currentStepFields, getFieldState, formState]);

  useEffect(() => {
    // O useEffect preenche os campos do step atual com valores padrão
    if (!currentStep) return;

    function coerceToString(value: unknown) {
      if (value == null) return undefined;
      if (typeof value === "string") return value;
      if (typeof value === "number") return String(value);
      if (typeof value === "boolean") return String(value);
      if (typeof value === "bigint") return String(value);
      try {
        return JSON.stringify(value);
      } catch {
        return undefined;
      }
    }

    const snapshot = useJourneyFormStore.getState(); // O snapshot é um estado do journeyFormStore

    function resolveDefaultValueFrom(spec: unknown) {
      // O resolve resolve o valor padrão a partir do serviço e caminho especificados
      if (!spec || typeof spec !== "object") return undefined;
      const path = (spec as Record<string, unknown>).path;
      const service = (spec as Record<string, unknown>).service;
      if (typeof path !== "string" || typeof service !== "string") {
        return undefined;
      }

      return getByPath(snapshot.services?.[service], path);
    }

    const values = getValues(); // O values são os valores atuais dos campos do step atual
    const next: Record<string, string> = {}; // O next são os valores a serem aplicados aos campos do step atual

    for (const element of currentStep.elements) {
      // O for percorre os elementos do step atual
      if (element.type !== "TEXT_INPUT" && element.type !== "CPF_INPUT")
        continue;
      const cfg = element.config as Record<string, unknown>; // O cfg é a configuração do elemento
      const name = cfg.name as string; // O name é o nome do campo
      if (typeof name !== "string" || name.length === 0) continue;
      const existing = values[name] as string | undefined; // O existing é o valor atual do campo
      if (typeof existing === "string" && existing.length > 0) continue;
      if (existing != null && existing !== "") continue;

      const direct = cfg.defaultValue as string | undefined; // O direct é o valor padrão direto do elemento
      const from = cfg.defaultValueFrom as Record<string, unknown> | undefined; // O from é a especificação de valor padrão a partir do serviço e caminho

      const resolved = // O resolved é o valor resolvido do campo
        typeof direct === "string"
          ? direct
          : coerceToString(resolveDefaultValueFrom(from));

      if (typeof resolved !== "string" || resolved.length === 0) continue; // Se o resolved não for uma string válida, continue
      next[name] = resolved; // Adiciona o resolved ao next
    }

    const entries = Object.entries(next);
    if (entries.length === 0) return; // Se não houver entradas no next, retorna

    for (const [key, value] of entries) {
      setValue(key as never, value as never, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      }); // Define o valor do campo no formState
    }
    mergeFieds(next); // Mescla os campos do next com o formState
  }, [currentStep, getValues, mergeFieds, setValue]);

  function goToStepSlug(stepSlug: string) {
    // O goToStepSlug vai para step com o slug especificado
    if (!stepSlugToIndex.has(stepSlug)) return;
    setStepSlug(stepSlug); // Define o stepSlug no estado do journeyFormStore
  }

  function redirectTo(urlOrSlug: string) {
    // O redirectTo redireciona para a URL ou slug especificado
    const baseUrl =
      typeof bussines.base_url === "string" ? bussines.base_url.trim() : "";
    const fullUrl = baseUrl ? joinPaths(baseUrl, urlOrSlug) : urlOrSlug;

    if (!fullUrl) return;

    if (/^https?:\/\//i.test(fullUrl)) {
      try {
        const target = new URL(fullUrl);
        if (target.origin !== window.location.origin) {
          window.location.href = fullUrl;
          return;
        }
        window.history.pushState(null, "", target.pathname + target.search);
        return;
      } catch {
        return;
      }
    }

    const path = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`; // O path é a URL ou slug com prefixo se necessário
    window.history.pushState(null, "", path);
  }

  useEffect(() => {
    if (stepCount === 0) return;
    if (!stepSlug || !stepSlugToIndex.has(stepSlug)) {
      setStepSlug(steps[0].slug); // Define o stepSlug no estado do journeyFormStore
      return;
    }
  }, [stepCount, stepSlug, stepSlugToIndex, steps, setStepSlug]);

  useEffect(() => {
    mergeBussines({
      journeyId: journey.id,
      journeySlug: journey.slug,
      stepSlug: currentStep?.slug ?? "",
    });
  }, [journey.id, journey.slug, currentStep?.slug, mergeBussines]);

  async function navigateToStepSlug(stepSlug: string) {
    // O navigateToStepSlug navega para o step com o slug especificado
    if (!currentStep) return;
    if (!stepSlug) {
      await goNext();
      return;
    }

    const fields = stepFields[currentStep.id] ?? []; // O fields são os campos do step atual
    const ok = fields.length === 0 ? true : await trigger(fields); // O ok é true se todos os campos são válidos
    if (!ok) {
      const fieldErrors: Record<string, string> = {};
      for (const field of fields) {
        // O for percorre os campos do step atual
        const message = getFieldState(field).error?.message;
        if (typeof message === "string" && message.length > 0) {
          fieldErrors[field] = message;
        }
      }
      setError(fieldErrors);
      return;
    }

    setError({});
    setFieds(getValues());
    goToStepSlug(stepSlug);
    redirectTo(stepSlug);
  }

  /**
   * O callServiceAndNavigate chama um serviço e navega para o step especificado em caso de sucesso.
   * @param serviceName - O nome do serviço a ser chamado.
   * @param targetStepOnSuccess - O slug do step para navegar em caso de sucesso.
   */
  async function callServiceAndNavigate(
    serviceName: string,
    targetStepOnSuccess: string,
  ) {
    if (!currentStep) return;

    const fields = stepFields[currentStep.id] ?? []; // O fields são os campos do step atual
    const ok = fields.length === 0 ? true : await trigger(fields);
    if (!ok) {
      const fieldErrors: Record<string, string> = {};
      for (const field of fields) {
        const message = getFieldState(field).error?.message;
        if (typeof message === "string" && message.length > 0) {
          fieldErrors[field] = message;
        }
      }
      setError(fieldErrors);
      return;
    }

    const input = getValues(); // O input são os valores do formState
    setError({});
    setFieds(input);

    const result = await callService(serviceName, {
      // O result é o resultado do serviço
      serviceName,
      fields: input,
      bussines,
    });

    mergeServices({ [serviceName]: result }); // Mescla o resultado do serviço com o estado do journeyFormStore

    if (!result.success) {
      setError({ service: result.error });
      return;
    }

    goToStepSlug(targetStepOnSuccess);
    redirectTo(targetStepOnSuccess);
  }

  /**
   * O goNext navega para o próximo step se todos os campos do step atual forem válidos
   */
  async function goNext() {
    if (!currentStep) return;
    const fields = stepFields[currentStep.id] ?? []; // O fields são os campos do step atual
    const ok = fields.length === 0 ? true : await trigger(fields);
    if (!ok) {
      const fieldErrors: Record<string, string> = {};
      for (const field of fields) {
        const message = getFieldState(field).error?.message;
        if (typeof message === "string" && message.length > 0) {
          fieldErrors[field] = message;
        }
      }
      setError(fieldErrors);
      return;
    }

    setError({});
    setFieds(getValues());

    const nextStep = steps[currentStepIndex + 1]; // O nextStep é o próximo step se houver
    if (nextStep) {
      setStepSlug(nextStep.slug);
      redirectTo(nextStep.slug);
      return;
    }

    handleSubmit((values) => {
      setFieds(values);
      setError({});
      setSubmitted({ fieds: values, error: {}, bussines, services });
    })();
  }

  /**
   * O goPrev navega para o step anterior se houver
   */
  function goPrev() {
    if (!currentStep) return;
    const backStepSlug = currentStep.backStepSlug?.trim() ?? "";
    if (!backStepSlug) return;
    setFieds(getValues());
    if (backStepSlug === "/") {
      setStepSlug(steps[0].slug ?? "");
      redirectTo("/");
      return;
    }
    goToStepSlug(backStepSlug);
    redirectTo(backStepSlug);
  }

  const storedErrorEntries = Object.entries(storedError).filter(
    // O storedErrorEntries são os campos com erros armazenados
    ([, v]) => typeof v === "string" && v.length > 0,
  ) as Array<[string, string]>;

  return {
    steps,
    stepCount,
    currentStep,
    currentStepIndex,
    sortedElements,
    navigationElements,
    register,
    control,
    formState,
    getValues,
    bussines,
    services,
    storedError,
    storedErrorEntries,
    canProceed,
    submitted,
    setSubmitted,
    navigateToStepSlug,
    callServiceAndNavigate,
    goNext,
    goPrev,
  };
}
