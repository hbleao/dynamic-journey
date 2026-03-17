"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { CheckboxElement } from "./elements/CheckboxElement";
import { CpfInputElement } from "./elements/CpfInputElement";
import { NavigationElement } from "./elements/NavigationElement";
import { ParagraphElement } from "./elements/ParagraphElement";
import { RadioElement } from "./elements/RadioElement";
import { SelectElement } from "./elements/SelectElement";
import { ServiceCallElement } from "./elements/ServiceCallElement";
import { type FormValues, TextInputElement } from "./elements/TextInputElement";
import { TitleElement } from "./elements/TitleElement";

export type JourneyElement =
  JourneyDefinition["steps"][number]["elements"][number];
export type NavigationElementType = Extract<
  JourneyElement,
  { type: "NAVIGATION" }
>;

export type ElementRenderContext = {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  navigateToStepSlug: (stepSlug: string) => void;
  callService: (service: string, targetStepOnSuccess: string) => void;
};

export function renderJourneyElement(
  element: JourneyElement,
  ctx: ElementRenderContext,
) {
  if (element.type === "TITLE") {
    return <TitleElement element={element} />;
  }

  if (element.type === "PARAGRAPH") {
    return <ParagraphElement element={element} />;
  }

  if (element.type === "TEXT_INPUT") {
    return (
      <TextInputElement
        element={element}
        register={ctx.register}
        errors={ctx.errors}
      />
    );
  }

  if (element.type === "CPF_INPUT") {
    return (
      <CpfInputElement
        element={element}
        register={ctx.register}
        errors={ctx.errors}
      />
    );
  }

  if (element.type === "RADIO") {
    return (
      <RadioElement
        element={element}
        register={ctx.register}
        errors={ctx.errors}
      />
    );
  }

  if (element.type === "SELECT") {
    return (
      <SelectElement
        element={element}
        register={ctx.register}
        errors={ctx.errors}
      />
    );
  }

  if (element.type === "CHECKBOX") {
    return (
      <CheckboxElement
        element={element}
        register={ctx.register}
        errors={ctx.errors}
      />
    );
  }

  if (element.type === "SERVICE_CALL") {
    return (
      <ServiceCallElement
        element={element}
        onCall={(service, targetStepOnSuccess) =>
          ctx.callService(service, targetStepOnSuccess)
        }
      />
    );
  }

  if (element.type === "NAVIGATION") {
    return (
      <NavigationElement
        element={element}
        onNavigate={ctx.navigateToStepSlug}
      />
    );
  }

  return null;
}
