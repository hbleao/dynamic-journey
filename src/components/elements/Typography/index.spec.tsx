import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Typography } from "./index";

describe("Typography", () => {
  it("deve renderizar corretamente com valores padrão", () => {
    render(<Typography data-testid="typography" />);

    const typography = screen.getByTestId("typography");
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveClass("typography");
    expect(typography).toHaveClass("--title1");
    expect(typography).toHaveClass("--color-neutral-900");
    expect(typography).toHaveClass("--font-weight-regular");
    expect(typography).toHaveClass("--font-style-normal");
    expect(typography.tagName.toLowerCase()).toBe("h1");
    expect(typography).toHaveTextContent("Typography");
  });

  it("deve renderizar com variante personalizada", () => {
    render(
      <Typography variant="title3" data-testid="typography">
        Título
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography).toHaveClass("--title3");
    expect(typography).toHaveTextContent("Título");
  });

  it("deve renderizar com tag HTML personalizada", () => {
    render(
      <Typography as="h2" data-testid="typography">
        Subtítulo
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography.tagName.toLowerCase()).toBe("h2");
  });

  it("deve renderizar com cor personalizada", () => {
    render(
      <Typography color="primary-500" data-testid="typography">
        Texto colorido
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography).toHaveClass("--color-primary-500");
  });

  it("deve renderizar com peso de fonte personalizado", () => {
    render(
      <Typography weight="bold" data-testid="typography">
        Texto em negrito
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography).toHaveClass("--font-weight-bold");
  });

  it("deve renderizar com estilo de fonte personalizado", () => {
    render(
      <Typography fontStyle="italic" data-testid="typography">
        Texto em itálico
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography).toHaveClass("--font-style-italic");
  });

  it("deve aplicar classes CSS adicionais", () => {
    render(
      <Typography className="custom-class" data-testid="typography">
        Texto com classe
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography).toHaveClass("custom-class");
    expect(typography).toHaveClass("typography");
  });

  it("deve passar atributos HTML adicionais para o elemento", () => {
    render(
      <Typography
        data-testid="typography"
        aria-label="Texto de exemplo"
        title="Título do texto"
        data-role="heading"
      >
        Texto com atributos
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography).toHaveAttribute("aria-label", "Texto de exemplo");
    expect(typography).toHaveAttribute("title", "Título do texto");
    expect(typography).toHaveAttribute("data-role", "heading");
  });

  it("deve renderizar como parágrafo", () => {
    render(
      <Typography as="p" variant="body1" data-testid="typography">
        Parágrafo de texto
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography.tagName.toLowerCase()).toBe("p");
    expect(typography).toHaveClass("--body1");
  });

  it("deve renderizar como span", () => {
    render(
      <Typography as="span" variant="caption" data-testid="typography">
        Texto pequeno
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography.tagName.toLowerCase()).toBe("span");
    expect(typography).toHaveClass("--caption");
  });

  it("deve renderizar como label", () => {
    render(
      <Typography as="label" variant="label" data-testid="typography">
        Rótulo
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography.tagName.toLowerCase()).toBe("label");
    expect(typography).toHaveClass("--label");
  });

  it("deve combinar múltiplas propriedades personalizadas", () => {
    render(
      <Typography
        as="h3"
        variant="title4"
        color="secondary-700"
        weight="semibold"
        fontStyle="italic"
        className="custom-class"
        data-testid="typography"
      >
        Texto personalizado
      </Typography>,
    );

    const typography = screen.getByTestId("typography");
    expect(typography.tagName.toLowerCase()).toBe("h3");
    expect(typography).toHaveClass("--title4");
    expect(typography).toHaveClass("--color-secondary-700");
    expect(typography).toHaveClass("--font-weight-semibold");
    expect(typography).toHaveClass("--font-style-italic");
    expect(typography).toHaveClass("custom-class");
    expect(typography).toHaveTextContent("Texto personalizado");
  });
});
