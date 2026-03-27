import { describe, expect, it } from "vitest";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { buildJourneyFormSchema } from "./buildJourneyFormSchema";

describe("buildJourneyFormSchema", () => {
  it("builds stepFields mapping and validates required fields", () => {
    const journey: JourneyDefinition = {
      id: "j1",
      name: "j1",
      slug: "j1",
      steps: [
        {
          id: "s1",
          name: "S1",
          slug: "s1",
          order: 0,
          backStepSlug: "",
          elements: [
            {
              id: "e1",
              type: "TEXT_INPUT",
              order: 0,
              config: { label: "Nome", required: true, name: "nome" },
            },
            {
              id: "e2",
              type: "CHECKBOX",
              order: 1,
              config: { label: "Aceito", required: true, name: "aceito" },
            },
            {
              id: "e3",
              type: "CPF_INPUT",
              order: 2,
              config: { label: "CPF", required: false, name: "cpf" },
            },
          ],
        },
      ],
    };

    const { schema, stepFields } = buildJourneyFormSchema(journey);
    expect(stepFields.s1).toEqual(["nome", "aceito", "cpf"]);

    const invalid = schema.safeParse({ aceito: false });
    expect(invalid.success).toBe(false);

    const ok = schema.safeParse({ nome: "João", aceito: true, cpf: "" });
    expect(ok.success).toBe(true);
  });
});
