import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";
import { linkUiSchema } from "./elementUiSchemas";

export const navigationElementSchema = baseElementSchema.extend({
  type: z.literal("NAVIGATION"),
  config: z.object({
    label: z.string(),
    url: z.string().optional().default(""),
    ui: linkUiSchema,
  }),
});
