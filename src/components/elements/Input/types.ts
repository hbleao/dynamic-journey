import type { HTMLAttributes } from "react";

export type InputProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  label?: string;
  name?: string;
  value?: string;
  variant?: "outlined" | "default";
  width?: "fluid" | "contain";
  disabled?: boolean;
  isLoading?: boolean;
  autoFocus?: boolean;
  success?: boolean;
  helperText?: string;
  errorMessage?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
