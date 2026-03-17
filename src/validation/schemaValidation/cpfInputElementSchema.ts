import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";

export const cpfInputElementSchema = baseElementSchema.extend({
  type: z.literal("CPF_INPUT"),
  config: z.object({
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    name: z.string(),
  }),
});
