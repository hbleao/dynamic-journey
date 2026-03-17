import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";

export const checkboxElementSchema = baseElementSchema.extend({
  type: z.literal("CHECKBOX"),
  config: z.object({
    label: z.string(),
    required: z.boolean().default(false),
    name: z.string(),
  }),
});
