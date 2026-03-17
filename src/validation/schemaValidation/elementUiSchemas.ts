import { z } from "zod";

export const buttonUiSchema = z
  .object({
    size: z.enum(["small", "large"]).optional(),
    styles: z.enum(["primary", "secondary", "ghost"]).optional(),
    width: z.enum(["contain", "fluid"]).optional(),
    variant: z
      .enum(["insurance", "banking", "health", "negative", "disabled"])
      .optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  })
  .optional();

export const linkUiSchema = z
  .object({
    size: z.enum(["large", "small"]).optional(),
    styles: z.enum(["primary", "secondary", "ghost"]).optional(),
    width: z.enum(["contain", "fluid"]).optional(),
    variant: z.enum(["insurance", "disabled"]).optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  })
  .optional();

export const inputUiSchema = z
  .object({
    variant: z.enum(["outlined", "default"]).optional(),
    width: z.enum(["fluid", "contain"]).optional(),
    disabled: z.boolean().optional(),
    autoFocus: z.boolean().optional(),
    helperText: z.string().optional(),
    className: z.string().optional(),
  })
  .optional();

export const typographyUiSchema = z
  .object({
    as: z
      .enum(["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "label"])
      .optional(),
    variant: z
      .enum([
        "title1",
        "title2",
        "title3",
        "title4",
        "title5",
        "title6",
        "body1",
        "body2",
        "caption",
        "label",
        "overline",
        "button",
      ])
      .optional(),
    color: z.string().optional(),
    weight: z
      .enum(["light", "regular", "medium", "semibold", "bold"])
      .optional(),
    fontStyle: z.enum(["italic", "normal"]).optional(),
    className: z.string().optional(),
  })
  .optional();
