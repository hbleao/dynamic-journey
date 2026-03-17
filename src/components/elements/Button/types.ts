import type { HTMLAttributes } from "react";

type Size = "small" | "large";
type Styles = "primary" | "secondary" | "ghost";
type Variant = "insurance" | "banking" | "health" | "negative" | "disabled";

export type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  styles?: Styles;
  width?: "contain" | "fluid";
  variant?: Variant;
  disabled?: boolean;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
};
