"use client";

import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type ServiceCallElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "SERVICE_CALL" }
>;

type ServiceCallElementProps = {
  element: ServiceCallElementType;
  onCall: (service: string, targetStepOnSuccess: string) => void;
};

export function ServiceCallElement({
  element,
  onCall,
}: ServiceCallElementProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onCall(element.config.service, element.config.targetStepOnSuccess)
      }
    >
      {element.config.label}
    </button>
  );
}
