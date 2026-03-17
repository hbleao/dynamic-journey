"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import type { FormValues } from "./TextInputElement";

type RadioElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "RADIO" }
>;

type RadioElementProps = {
  element: RadioElementType;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

export function RadioElement({ element, register, errors }: RadioElementProps) {
  const name = element.config.name;
  const message =
    typeof errors[name]?.message === "string"
      ? errors[name]?.message
      : undefined;

  return (
    <fieldset>
      <legend>{element.config.label}</legend>
      {element.config.options.map((option) => (
        <label key={option.value}>
          <input {...register(name)} type="radio" value={option.value} />
          {option.label}
        </label>
      ))}
      {message ? <div>{message}</div> : null}
    </fieldset>
  );
}
