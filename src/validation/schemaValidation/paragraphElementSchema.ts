import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";
import { typographyUiSchema } from "./elementUiSchemas";

export const paragraphElementSchema = baseElementSchema.extend({
  type: z.literal("PARAGRAPH"),
  config: z.object({
    text: z.string(),
    ui: typographyUiSchema,
  }),
});
