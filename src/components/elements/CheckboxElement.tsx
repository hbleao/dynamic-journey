"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import type { FormValues } from "./TextInputElement";

type CheckboxElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "CHECKBOX" }
>;

type CheckboxElementProps = {
  element: CheckboxElementType;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

export function CheckboxElement({
  element,
  register,
  errors,
}: CheckboxElementProps) {
  const name = element.config.name;
  const message =
    typeof errors[name]?.message === "string"
      ? errors[name]?.message
      : undefined;

  return (
    <div>
      <label>
        <input {...register(name)} type="checkbox" />
        {element.config.label}
      </label>
      {message ? <div>{message}</div> : null}
    </div>
  );
}
