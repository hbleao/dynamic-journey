import { z } from "zod";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { cpfString } from "./cpfString";
import { optionalBoolean } from "./optionalBoolean";
import { optionalString } from "./optionalString";
import { requiredString } from "./requiredString";
import { requiredTrueBoolean } from "./requiredTrueBoolean";
import type { StepFields } from "./types";

export function buildJourneyFormSchema(journey: JourneyDefinition) {
  // O buildJourneyFormSchema é uma função que constrói o schema do formState
  const shape: Record<string, z.ZodTypeAny> = {}; // O shape é um objeto que define a estrutura do formState
  const stepFields: StepFields = {}; // O stepFields é um objeto que define os campos de cada step

  for (const step of journey.steps) {
    // Para cada step na journey
    const fields: string[] = []; // Os campos são os elementos do formState do step

    for (const element of step.elements) {
      if (element.type === "TEXT_INPUT") {
        const fieldName = element.config.name;
        fields.push(fieldName);
        shape[fieldName] = element.config.required
          ? requiredString()
          : optionalString();
      }

      if (element.type === "CPF_INPUT") {
        const fieldName = element.config.name;
        fields.push(fieldName);
        shape[fieldName] = cpfString(element.config.required);
      }

      if (element.type === "RADIO") {
        const fieldName = element.config.name;
        fields.push(fieldName);
        shape[fieldName] = element.config.required
          ? requiredString()
          : optionalString();
      }

      if (element.type === "SELECT") {
        const fieldName = element.config.name;
        fields.push(fieldName);
        shape[fieldName] = element.config.required
          ? requiredString()
          : optionalString();
      }

      if (element.type === "CHECKBOX") {
        const fieldName = element.config.name;
        fields.push(fieldName);
        shape[fieldName] = element.config.required
          ? requiredTrueBoolean()
          : optionalBoolean();
      }
    }

    stepFields[step.id] = fields;
  }

  const schema = z.object(shape);

  return { schema, stepFields };
}
