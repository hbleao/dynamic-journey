import { Loader } from "./Loader";
import "./styles.scss";

import type { ButtonProps } from "./types";

/**
 * Componente Button que permite aos usuários interagir com a interface.
 *
 * @component
 * @param {Object} props - As propriedades do componente Button
 * @param {"insurance" | "banking" | "health" | "negative" | "disabled"} [props.variant="insurance"] - Variante do botão que define o tema visual
 * @param {"primary" | "secondary" | "ghost"} [props.styles="primary"] - Estilo visual do botão
 * @param {"small" | "large"} [props.size="large"] - Tamanho do botão
 * @param {"contain" | "fluid"} [props.width="contain"] - Largura do botão (contain: ajustado ao conteúdo, fluid: ocupa todo o espaço disponível)
 * @param {boolean} [props.isLoading=false] - Indica se o botão está em estado de carregamento
 * @param {boolean} [props.disabled=false] - Indica se o botão está desabilitado
 * @param {string} [props.className=""] - Classes CSS adicionais para o botão
 * @param {React.ReactNode} props.children - Conteúdo do botão
 *
 * @example
 * // Botão primário padrão
 * <Button>Clique aqui</Button>
 *
 * @example
 * // Botão secundário bancário
 * <Button variant="banking" styles="secondary" size="small">Enviar</Button>
 *
 * @example
 * // Botão em estado de carregamento
 * <Button isLoading>Processando</Button>
 *
 * @returns {JSX.Element} Componente Button renderizado
 */

export const Button = ({
  variant = "insurance",
  styles = "primary",
  size = "large",
  width = "contain",
  disabled = false,
  className = "",
  isLoading = false,
  children,
  ...restProps
}: ButtonProps) => {
  const variantClass = disabled
    ? `--disabled-${styles}`
    : `--${variant}-${styles}`;
  const sizeClass = `--${size}`;
  const widthClass = `--${width}`;

  const composedClassName =
    `btn ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();

  return (
    <button className={composedClassName} disabled={disabled} {...restProps}>
      {isLoading ? <Loader data-testid="loaderButton" /> : children}
    </button>
  );
};
