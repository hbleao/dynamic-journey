import { z } from "zod";

export const requiredString = () => z.string().min(1, "Obrigatório");
