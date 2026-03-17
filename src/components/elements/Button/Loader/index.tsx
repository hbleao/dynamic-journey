import type { HTMLAttributes, JSX } from "react";

import { clsx } from "@/utils/clsx";
import "./styles.scss";

type LoaderProps = HTMLAttributes<HTMLSpanElement> & {
  color?: string;
  size?: number;
  className?: string;
};

/**
 * Componente Loader que exibe um indicador de carregamento animado.
 *
 * @component
 * @param {Object} props - As propriedades do componente Loader
 * @param {string} [props.color="neutral-900"] - Cor do loader, usando tokens de cor do sistema
 * @param {number} [props.size=24] - Tamanho do loader em pixels
 * @param {string} [props.className] - Classes CSS adicionais para o loader
 *
 * @example
 * // Loader padrão
 * <Loader />
 *
 * @example
 * // Loader com cor e tamanho personalizados
 * <Loader color="brand-insurance-900" size={32} />
 *
 * @example
 * // Loader com classe CSS adicional
 * <Loader className="my-custom-loader" />
 *
 * @returns {JSX.Element} Componente Loader renderizado
 */

export const Loader = ({
  color = "neutral-0",
  size = 24,
  className,
  ...restProps
}: LoaderProps): JSX.Element => {
  const classes = clsx("loader", `--border-${color}`, className);

  return (
    <span
      className={classes}
      style={{
        width: size,
        height: size - 1,
        borderBottomColor: "transparent",
      }}
      {...restProps}
    />
  );
};
