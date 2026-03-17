import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";

export const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const selectElementSchema = baseElementSchema.extend({
  type: z.literal("SELECT"),
  config: z.object({
    label: z.string(),
    required: z.boolean().default(false),
    options: z.array(selectOptionSchema),
    name: z.string(),
  }),
});
