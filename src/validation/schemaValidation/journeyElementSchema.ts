import { z } from "zod";
import { checkboxElementSchema } from "./checkboxElementSchema";
import { cpfInputElementSchema } from "./cpfInputElementSchema";
import { navigationElementSchema } from "./navigationElementSchema";
import { paragraphElementSchema } from "./paragraphElementSchema";
import { radioElementSchema } from "./radioElementSchema";
import { selectElementSchema } from "./selectElementSchema";
import { serviceCallElementSchema } from "./serviceCallElementSchema";
import { textInputElementSchema } from "./textInputElementSchema";
import { titleElementSchema } from "./titleElementSchema";

export const journeyElementSchema = z.discriminatedUnion("type", [
  titleElementSchema,
  paragraphElementSchema,
  textInputElementSchema,
  cpfInputElementSchema,
  radioElementSchema,
  selectElementSchema,
  checkboxElementSchema,
  serviceCallElementSchema,
  navigationElementSchema,
]);
