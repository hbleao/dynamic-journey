"use client";

import { Button } from "@/components/elements/Button";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type ServiceCallElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "SERVICE_CALL" }
>;

type ServiceCallElementProps = {
  element: ServiceCallElementType;
  canProceed: boolean;
  onCall: (service: string, targetStepOnSuccess: string) => void;
};

export function ServiceCallElement({
  element,
  canProceed,
  onCall,
}: ServiceCallElementProps) {
  const ui = element.config.ui;
  const hardDisabled = ui?.disabled === true;
  const blocked = !canProceed;
  const variant = blocked ? "disabled" : ui?.variant;
  const disabled = hardDisabled || blocked;
  return (
    <Button
      type="button"
      variant={variant}
      styles={ui?.styles}
      size={ui?.size}
      width={ui?.width}
      disabled={disabled}
      className={ui?.className ?? ""}
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onCall(element.config.service, element.config.targetStepOnSuccess);
      }}
    >
      {element.config.label}
    </Button>
  );
}
