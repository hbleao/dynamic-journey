import { z } from "zod";
import { journeyStepSchema } from "./journeyStepSchema";

const completionSchema = z.object({
  type: z.string(),
});

export const journeySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  completion: completionSchema.optional(),
  steps: z.array(journeyStepSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type JourneyDefinition = z.infer<typeof journeySchema>;
