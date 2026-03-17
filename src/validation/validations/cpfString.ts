import { z } from "zod";

export const cpfString = (required: boolean) => {
  if (required) {
    return z
      .preprocess(
        (value: unknown) =>
          typeof value === "string" ? value.replace(/\D/g, "") : value,
        z.string(),
      )
      .refine((value: string) => value.length === 11, "CPF inválido");
  }

  return z
    .preprocess((value: unknown) => {
      if (typeof value !== "string") return value;
      const digits = value.replace(/\D/g, "");
      return digits.length === 0 ? undefined : digits;
    }, z.string().optional())
    .refine(
      (value: string | undefined) => value === undefined || value.length === 11,
      "CPF inválido",
    );
};
