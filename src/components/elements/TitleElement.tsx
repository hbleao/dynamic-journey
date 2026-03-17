"use client";

import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type TitleElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "TITLE" }
>;

type TitleElementProps = {
  element: TitleElementType;
};

export function TitleElement({ element }: TitleElementProps) {
  return <h1>{element.config.text}</h1>;
}
