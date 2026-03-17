import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";

export const radioOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const radioElementSchema = baseElementSchema.extend({
  type: z.literal("RADIO"),
  config: z.object({
    label: z.string(),
    required: z.boolean().default(false),
    options: z.array(radioOptionSchema),
    name: z.string(),
  }),
});
