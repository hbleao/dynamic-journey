"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

export type FormValues = Record<string, unknown>;

type TextInputElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "TEXT_INPUT" }
>;

type TextInputElementProps = {
  element: TextInputElementType;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

export function TextInputElement({
  element,
  register,
  errors,
}: TextInputElementProps) {
  const name = element.config.name;
  const message =
    typeof errors[name]?.message === "string"
      ? errors[name]?.message
      : undefined;

  return (
    <div>
      <label>
        {element.config.label}
        <input
          placeholder={element.config.placeholder}
          {...register(name)}
          type="text"
        />
      </label>
      {message ? <div>{message}</div> : null}
    </div>
  );
}
