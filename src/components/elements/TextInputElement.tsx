"use client";

import { type Control, Controller } from "react-hook-form";
import { Input } from "@/components/elements/Input";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

export type FormValues = Record<string, unknown>;

type TextInputElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "TEXT_INPUT" }
>;

type TextInputElementProps = {
  element: TextInputElementType;
  control: Control<FormValues>;
};

export function TextInputElement({ element, control }: TextInputElementProps) {
  const ui = element.config.ui;
  return (
    <Controller
      control={control}
      name={element.config.name}
      defaultValue=""
      render={({ field, fieldState }) => (
        <Input
          className={ui?.className}
          name={field.name}
          label={element.config.label}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={field.onChange}
          variant={ui?.variant}
          width={ui?.width}
          disabled={ui?.disabled}
          autoFocus={ui?.autoFocus}
          helperText={ui?.helperText}
          errorMessage={fieldState.error?.message ?? ""}
        />
      )}
    />
  );
}
