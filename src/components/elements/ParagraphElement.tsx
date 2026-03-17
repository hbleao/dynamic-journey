"use client";

import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type ParagraphElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "PARAGRAPH" }
>;

type ParagraphElementProps = {
  element: ParagraphElementType;
};

export function ParagraphElement({ element }: ParagraphElementProps) {
  return <p>{element.config.text}</p>;
}
