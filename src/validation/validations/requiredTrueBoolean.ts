import { z } from "zod";

export const requiredTrueBoolean = () =>
  z.boolean().refine((value) => value === true, "Obrigatório");
