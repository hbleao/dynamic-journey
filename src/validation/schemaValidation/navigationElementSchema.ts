import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";

export const navigationElementSchema = baseElementSchema.extend({
  type: z.literal("NAVIGATION"),
  config: z.object({
    label: z.string(),
    url: z.string().optional().default(""),
  }),
});
