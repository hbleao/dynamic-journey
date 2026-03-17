import { useEffect, useRef, useState } from "react";
import { clsx } from "@/utils/clsx";

import "./styles.scss";

import { Loader } from "../Loader";
import type { InputProps } from "./types";

/**
 * Componente Input que permite a entrada de texto com vários estados e feedbacks visuais.
 *
 * @component
 * @param {Object} props - As propriedades do componente Input
 * @param {string} [props.className=""] - Classes CSS adicionais para o input
 * @param {string} [props.name=""] - Nome do campo de entrada, usado para identificação em formulários
 * @param {"default" | string} [props.variant="default"] - Variante visual do input
 * @param {"contain" | "fluid"} [props.width="contain"] - Largura do input (contain: ajustado ao conteúdo, fluid: ocupa todo o espaço disponível)
 * @param {boolean} [props.disabled=false] - Indica se o input está desabilitado
 * @param {string | number} [props.value=""] - Valor atual do input
 * @param {boolean} [props.isLoading=false] - Indica se o input está em estado de carregamento
 * @param {string} [props.helperText=""] - Texto de ajuda exibido abaixo do input
 * @param {string} [props.errorMessage=""] - Mensagem de erro exibida quando há um erro de validação
 * @param {string} [props.label=""] - Rótulo do input
 * @param {React.ReactNode} [props.children] - Conteúdo adicional do input
 * @param {Function} [props.onChange] - Função chamada quando o valor do input muda
 *
 * @example
 * // Input básico com label
 * <Input label="Nome" name="nome" />
 *
 * @example
 * // Input com texto de ajuda
 * <Input
 *   label="Email"
 *   name="email"
 *   helperText="Digite seu email principal"
 * />
 *
 * @example
 * // Input com mensagem de erro
 * <Input
 *   label="Senha"
 *   name="senha"
 *   type="password"
 *   errorMessage="A senha deve ter pelo menos 8 caracteres"
 * />
 *
 * @example
 * // Input em estado de carregamento
 * <Input
 *   label="Buscar CEP"
 *   name="cep"
 *   isLoading={true}
 * />
 *
 * @returns {JSX.Element} Componente Input renderizado
 */

export const Input = ({
  className = "",
  name = "",
  variant = "default",
  width = "contain",
  disabled = false,
  value = "",
  isLoading = false,
  success = false,
  helperText = "",
  errorMessage = "",
  label = "",
  autoFocus = false,
  children,
  onChange,
  ...restProps
}: InputProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autoFocus) return;
    if (disabled) return;
    inputRef.current?.focus();
  }, [autoFocus, disabled]);

  const handleFocus = (isFocus: boolean) => {
    if (disabled) return;
    setFocused(isFocus);
  };
  const isError = errorMessage.length > 0;
  const isFilled = value?.toString().length > 0;
  const classes = clsx(
    "input__root",
    `--${variant}`,
    `--${width}`,
    { "--filled": !!isFilled },
    { "--focused": focused },
    { "--success": success },
    { "--disabled": disabled },
    { "--error": isError },
    className,
  );

  return (
    <div className={classes} {...restProps}>
      <div className="input__box">
        {label && (
          <label htmlFor={name} className="input__label">
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          type="text"
          className="input__field"
          ref={inputRef}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => handleFocus(true)}
          onBlur={() => handleFocus(false)}
        />
      </div>

      {isLoading && (
        <Loader className="input__loader" color="brand-insurance-900" />
      )}

      {!isError && helperText && (
        <p className="input__helper-text">{helperText}</p>
      )}
      {isError && <p className="input__error-message">{errorMessage}</p>}
    </div>
  );
};
