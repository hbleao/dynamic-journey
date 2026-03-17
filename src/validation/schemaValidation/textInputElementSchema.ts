import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";
import { inputUiSchema } from "./elementUiSchemas";

export const textInputElementSchema = baseElementSchema.extend({
  type: z.literal("TEXT_INPUT"),
  config: z.object({
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    name: z.string(),
    ui: inputUiSchema,
  }),
});
