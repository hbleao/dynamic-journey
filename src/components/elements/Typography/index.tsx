import "./styles.scss";

import { clsx } from "@/utils/clsx";

import type { TypographyProps } from "./types";

/**
 * `Typography` — Componente tipográfico reutilizável para estilização semântica de texto.
 *
 * Centraliza o controle de variantes de título, peso, cor e estilo da fonte, mantendo consistência visual
 * e semântica no projeto. Pode ser usado com diferentes elementos HTML como `h1`, `p`, `span`, etc.
 *
 * @component
 *
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} [props.children="Typography"] - Conteúdo textual ou elementos filhos
 * @param {'title1' | 'title2' | 'title3' | 'title4' | 'body1' | 'body2' | 'caption'} [props.variant='title1'] - Estilo visual da tipografia
 * @param {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'label' | 'div'} [props.as='h1'] - Elemento HTML a ser renderizado
 * @param {string} [props.color='neutral-900'] - Cor da fonte (geralmente vinculada a tokens CSS ou utilitários de tema)
 * @param {'light' | 'regular' | 'medium' | 'bold'} [props.weight='regular'] - Peso da fonte
 * @param {'normal' | 'italic'} [props.fontStyle='normal'] - Estilo da fonte (normal ou itálico)
 * @param {string} [props.className=''] - Classe CSS adicional para estilização externa
 * @param {React.HTMLAttributes<HTMLElement>} props.restProps - Outros atributos HTML válidos para o elemento tipográfico
 *
 * @example
 * // Título principal
 * <Typography variant="title1" as="h1" color="neutral-900" weight="bold">
 *   Bem-vindo ao portal
 * </Typography>
 *
 * @example
 * // Texto de apoio com cor personalizada
 * <Typography variant="body2" color="neutral-500">
 *   Preencha os campos obrigatórios
 * </Typography>
 *
 * @example
 * // Componente com estilo itálico
 * <Typography variant="body1" fontStyle="italic" as="span">
 *   Este é um texto em itálico.
 * </Typography>
 *
 * @returns {JSX.Element} Elemento tipográfico renderizado com estilos aplicados
 */

export const Typography = ({
  children = "Typography",
  variant = "title1",
  as = "h1",
  color = "neutral-900",
  weight = "regular",
  fontStyle = "normal",
  className = "",
  ...restProps
}: TypographyProps) => {
  const Component = as;

  const classes = clsx(
    "typography",
    `--${variant}`,
    `--color-${color}`,
    `--font-weight-${weight}`,
    `--font-style-${fontStyle}`,
    className,
  );

  return (
    <Component className={classes} {...restProps}>
      {children}
    </Component>
  );
};
