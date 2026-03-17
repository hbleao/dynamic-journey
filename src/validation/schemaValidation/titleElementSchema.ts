import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";
import { typographyUiSchema } from "./elementUiSchemas";

export const titleElementSchema = baseElementSchema.extend({
  type: z.literal("TITLE"),
  config: z.object({
    text: z.string(),
    size: z.enum(["sm", "md", "lg"]).optional(),
    ui: typographyUiSchema,
  }),
});
