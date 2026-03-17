import { z } from "zod";

export const optionalString = () =>
  z.preprocess(
    (value: unknown) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().optional(),
  );
