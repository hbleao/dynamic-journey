"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import type { FormValues } from "./TextInputElement";

type CpfInputElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "CPF_INPUT" }
>;

type CpfInputElementProps = {
  element: CpfInputElementType;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

export function CpfInputElement({
  element,
  register,
  errors,
}: CpfInputElementProps) {
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
          inputMode="numeric"
          autoComplete="off"
        />
      </label>
      {message ? <div>{message}</div> : null}
    </div>
  );
}
