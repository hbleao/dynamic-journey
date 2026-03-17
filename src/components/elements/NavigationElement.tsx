"use client";

import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type JourneyElement = JourneyDefinition["steps"][number]["elements"][number];
type NavigationElementType = Extract<JourneyElement, { type: "NAVIGATION" }>;

type NavigationElementProps = {
  element: NavigationElementType;
  onNavigate: (stepSlug: string) => void;
};

export function NavigationElement({
  element,
  onNavigate,
}: NavigationElementProps) {
  const url = element.config.url?.trim() ?? "";

  return (
    <button type="button" onClick={() => onNavigate(url)}>
      {element.config.label}
    </button>
  );
}
