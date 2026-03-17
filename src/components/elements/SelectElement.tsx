"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import type { FormValues } from "./TextInputElement";

type SelectElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "SELECT" }
>;

type SelectElementProps = {
  element: SelectElementType;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
};

export function SelectElement({
  element,
  register,
  errors,
}: SelectElementProps) {
  const name = element.config.name;
  const message =
    typeof errors[name]?.message === "string"
      ? errors[name]?.message
      : undefined;

  return (
    <div>
      <label>
        {element.config.label}
        <select {...register(name)}>
          <option value="">Selecione...</option>
          {element.config.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {message ? <div>{message}</div> : null}
    </div>
  );
}
