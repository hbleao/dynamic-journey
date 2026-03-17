"use client";

import { Typography } from "@/components/elements/Typography";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type ParagraphElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "PARAGRAPH" }
>;

type ParagraphElementProps = {
  element: ParagraphElementType;
};

export function ParagraphElement({ element }: ParagraphElementProps) {
  const ui = element.config.ui;
  return (
    <Typography
      as={ui?.as ?? "p"}
      variant={ui?.variant ?? "body2"}
      color={ui?.color}
      weight={ui?.weight}
      fontStyle={ui?.fontStyle}
      className={ui?.className}
    >
      {element.config.text}
    </Typography>
  );
}
