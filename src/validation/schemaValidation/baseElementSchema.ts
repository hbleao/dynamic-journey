import { z } from "zod";

export const baseElementSchema = z.object({
  id: z.string(),
  order: z.number().optional(),
});
