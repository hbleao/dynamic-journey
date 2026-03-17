import { z } from "zod";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { cpfString } from "./cpfString";
import { optionalBoolean } from "./optionalBoolean";
import { optionalString } from "./optionalString";
import { requiredString } from "./requiredString";
import { requiredTrueBoolean } from "./requiredTrueBoolean";
import type { StepFields } from "./types";

export function buildJourneyFormSchema(journey: JourneyDefinition) {
  const shape: Record<string, z.ZodTypeAny> = {};
  const stepFields: StepFields = {};

  for (const step of journey.steps) {
    const fields: string[] = [];

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
