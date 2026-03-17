"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { callService } from "@/services/serviceRegistry";
import { joinPaths } from "@/utils/joinPaths";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { buildJourneyFormSchema } from "@/validation/validations";
import { useJourneyFormStore } from "../store/journeyFormStore";
import {
  type NavigationElementType,
  renderJourneyElement,
} from "./elementRegistry";
import type { FormValues } from "./elements/TextInputElement";

type JourneyStep = JourneyDefinition["steps"][number];
type JourneyElement = JourneyDefinition["steps"][number]["elements"][number];

type JourneyRunnerProps = {
  journey: JourneyDefinition;
};

type SubmittedPayload = {
  fieds: FormValues;
  error: Record<string, unknown>;
  bussines: Record<string, unknown>;
  services: Record<string, unknown>;
};

export function JourneyRunner({ journey }: JourneyRunnerProps) {
  const steps = journey.steps;
  const { schema, stepFields } = useMemo(
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: useRef(useJourneyFormStore.getState().fieds).current,
    mode: "onSubmit",
  });
  const [submitted, setSubmitted] = useState<SubmittedPayload | null>(null);
  const stepCount = steps.length;
  const stepSlug = useJourneyFormStore((s) => s.stepSlug);
  const setStepSlug = useJourneyFormStore((s) => s.setStepSlug);
  const setFieds = useJourneyFormStore((s) => s.setFieds);
  const setError = useJourneyFormStore((s) => s.setError);
  const mergeBussines = useJourneyFormStore((s) => s.mergeBussines);
  const mergeServices = useJourneyFormStore((s) => s.mergeServices);
  const bussines = useJourneyFormStore((s) => s.bussines);
  const storedError = useJourneyFormStore((s) => s.error);
  const services = useJourneyFormStore((s) => s.services);

  const stepSlugToIndex = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < steps.length; i += 1) {
      map.set(steps[i].slug, i);
    }
    return map;
  }, [steps]);

  const currentStep: JourneyStep | null = useMemo(() => {
    if (stepCount === 0) return null;
    const resolved =
      stepSlug && stepSlugToIndex.has(stepSlug)
        ? steps[stepSlugToIndex.get(stepSlug) as number]
        : steps[0];
    return resolved ?? null;
  }, [stepCount, stepSlug, stepSlugToIndex, steps]);

  const currentStepIndex = useMemo(() => {
    if (!currentStep) return 0;
    return stepSlugToIndex.get(currentStep.slug) ?? 0;
  }, [currentStep, stepSlugToIndex]);

  const sortedElements = useMemo<JourneyElement[]>(
    () => (currentStep ? currentStep.elements : []),
    [currentStep],
  );

  const navigationElements = useMemo<NavigationElementType[]>(
    () =>
      sortedElements.filter(
        (e): e is NavigationElementType => e.type === "NAVIGATION",
      ),
    [sortedElements],
  );

  function goToStepSlug(stepSlug: string) {
    if (!stepSlugToIndex.has(stepSlug)) return;
    setStepSlug(stepSlug);
  }

  function redirectTo(urlOrSlug: string) {
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

    const path = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
    window.history.pushState(null, "", path);
  }

  useEffect(() => {
    if (stepCount === 0) return;
    if (!stepSlug || !stepSlugToIndex.has(stepSlug)) {
      setStepSlug(steps[0].slug);
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
    if (!currentStep) return;
    if (!stepSlug) {
      await goNext();
      return;
    }

    const fields = stepFields[currentStep.id] ?? [];
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
    goToStepSlug(stepSlug);
    redirectTo(stepSlug);
  }

  async function callServiceAndNavigate(
    serviceName: string,
    targetStepOnSuccess: string,
  ) {
    if (!currentStep) return;

    const fields = stepFields[currentStep.id] ?? [];
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

    const input = getValues();
    setError({});
    setFieds(input);

    const result = await callService(serviceName, {
      fieds: input,
      bussines,
    });

    mergeServices({ [serviceName]: result });

    if (!result.success) {
      setError({ service: result.error });
      return;
    }

    goToStepSlug(targetStepOnSuccess);
    redirectTo(targetStepOnSuccess);
  }

  async function goNext() {
    if (!currentStep) return;
    const fields = stepFields[currentStep.id] ?? [];
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

    const nextStep = steps[currentStepIndex + 1];
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

  if (!currentStep) {
    return <div>Jornada sem steps.</div>;
  }

  if (submitted) {
    return (
      <div>
        <h2>Resultado</h2>
        <pre>{JSON.stringify(submitted, null, 2)}</pre>
        <button type="button" onClick={() => setSubmitted(null)}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goNext();
        }}
      >
        {sortedElements.map((element) => (
          <div key={element.id}>
            {renderJourneyElement(element, {
              register,
              control,
              errors,
              navigateToStepSlug,
              callService: callServiceAndNavigate,
              bussines,
            })}
          </div>
        ))}
        {navigationElements.length === 0 ? (
          <div>
            <button
              type="button"
              onClick={goPrev}
              disabled={!currentStep.backStepSlug}
            >
              Anterior
            </button>
            <button type="button" onClick={goNext}>
              {currentStepIndex === stepCount - 1 ? "Enviar" : "Próximo"}
            </button>
          </div>
        ) : null}
      </form>

      <details>
        <summary>Debug (valores atuais)</summary>
        <pre>
          {JSON.stringify(
            { fieds: getValues(), error: storedError, bussines, services },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
