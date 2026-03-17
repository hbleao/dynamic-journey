"use client";

import { Button } from "@/components/elements/Button";
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
  const ui = element.config.ui;
  return (
    <Button
      type="button"
      variant={ui?.variant}
      styles={ui?.styles}
      size={ui?.size}
      width={ui?.width}
      disabled={ui?.disabled}
      className={ui?.className ?? ""}
      onClick={() =>
        onCall(element.config.service, element.config.targetStepOnSuccess)
      }
    >
      {element.config.label}
    </Button>
  );
}
