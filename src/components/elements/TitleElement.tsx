"use client";

import { Typography } from "@/components/elements/Typography";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";

type TitleElementType = Extract<
  JourneyDefinition["steps"][number]["elements"][number],
  { type: "TITLE" }
>;

type TitleElementProps = {
  element: TitleElementType;
};

export function TitleElement({ element }: TitleElementProps) {
  const ui = element.config.ui;
  const variant =
    ui?.variant ??
    (element.config.size === "sm"
      ? "title4"
      : element.config.size === "md"
        ? "title3"
        : "title2");

  return (
    <Typography
      as={ui?.as ?? "h2"}
      variant={variant}
      color={ui?.color}
      weight={ui?.weight}
      fontStyle={ui?.fontStyle}
      className={ui?.className}
    >
      {element.config.text}
    </Typography>
  );
}
