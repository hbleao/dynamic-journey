import { z } from "zod";

export const defaultValueFromSchema = z
  .object({
    service: z.string(),
    path: z.string(),
  })
  .optional();
