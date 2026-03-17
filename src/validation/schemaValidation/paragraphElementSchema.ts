import { z } from "zod";
import { baseElementSchema } from "./baseElementSchema";

export const paragraphElementSchema = baseElementSchema.extend({
  type: z.literal("PARAGRAPH"),
  config: z.object({
    text: z.string(),
  }),
});
