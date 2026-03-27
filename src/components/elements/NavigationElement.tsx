"use client";

import { Link } from "@/components/elements/Link";
import { joinPaths } from "@/utils/joinPaths";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type JourneyElement = JourneyDefinition["steps"][number]["elements"][number];
type NavigationElementType = Extract<JourneyElement, { type: "NAVIGATION" }>;

type NavigationElementProps = {
  element: NavigationElementType;
  onNavigate: (stepSlug: string) => void;
  bussines: Record<string, unknown>;
  canProceed: boolean;
};

export function NavigationElement({
  element,
  onNavigate,
  bussines,
  canProceed,
}: NavigationElementProps) {
  const url = element.config.url?.trim() ?? "";
  const baseUrl =
    typeof bussines.base_url === "string" ? bussines.base_url : "";
  const href = joinPaths(baseUrl, url);
  const ui = element.config.ui;
  const hardDisabled = ui?.disabled === true;
  const blocked = !canProceed;
  const variant = blocked ? "disabled" : ui?.variant;
  const disabled = hardDisabled || blocked;

  return (
    <Link
      href={href}
      variant={variant}
      styles={ui?.styles}
      size={ui?.size}
      width={ui?.width}
      disabled={disabled}
      className={ui?.className}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      onClick={(event: { preventDefault: () => void }) => {
        event.preventDefault();
        if (disabled) return;
        onNavigate(url);
      }}
    >
      {element.config.label}
    </Link>
  );
}
