import { z } from "zod";
import { journeyElementSchema } from "./journeyElementSchema";

export const journeyStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  order: z.number().optional(),
  elements: z.array(journeyElementSchema),
  backStepSlug: z.string().optional().default(""),
});
