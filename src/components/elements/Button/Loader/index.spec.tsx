import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "./index";

describe("<Loader />", () => {
  it("deve renderizar corretamente com valores padrão", () => {
    const { container } = render(<Loader />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass("loader");
    expect(loader).toHaveClass("--border-neutral-0");
  });

  it("deve renderizar com cor personalizada", () => {
    const { container } = render(<Loader color="neutral-500" />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveClass("--border-neutral-500");
    expect(loader).not.toHaveClass("--border-neutral-0");
  });

  it("deve renderizar com tamanho personalizado", () => {
    const { container } = render(<Loader size={48} />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveAttribute("style");

    const styleString = loader.getAttribute("style") || "";
    expect(styleString).toContain("width: 48px");
    expect(styleString).toContain("height: 47px");
  });

  it("deve aplicar classes CSS adicionais", () => {
    const { container } = render(<Loader className="custom-class" />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveClass("custom-class");
    expect(loader).toHaveClass("loader");
  });

  it("deve combinar múltiplas propriedades personalizadas", () => {
    const { container } = render(
      <Loader color="neutral-700" size={36} className="custom-class" />,
    );
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveClass("--border-neutral-700");
    expect(loader).toHaveClass("custom-class");

    // Verificamos o estilo inline
    const styleString = loader.getAttribute("style") || "";
    expect(styleString).toContain("width: 36px");
    expect(styleString).toContain("height: 35px");
    expect(styleString).toContain("border-bottom-color: transparent");
  });

  it("deve renderizar como um elemento span", () => {
    const { container } = render(<Loader />);
    const loader = container.firstChild as HTMLElement;

    expect(loader.tagName.toLowerCase()).toBe("span");
  });

  it("deve renderizar com tamanhos extremos", () => {
    const { container: containerZero } = render(<Loader size={0} />);
    const loaderZero = containerZero.firstChild as HTMLElement;
    const styleZero = loaderZero.getAttribute("style") || "";
    expect(styleZero).toContain("width: 0px");

    const { container: containerNegative } = render(<Loader size={-10} />);
    const loaderNegative = containerNegative.firstChild as HTMLElement;
    const styleNegative = loaderNegative.getAttribute("style") || "";
    expect(styleNegative).toContain("border-bottom-color: transparent");

    const { container: containerLarge } = render(<Loader size={200} />);
    const loaderLarge = containerLarge.firstChild as HTMLElement;
    const styleLarge = loaderLarge.getAttribute("style") || "";
    expect(styleLarge).toContain("width: 200px");
  });

  it("deve aceitar e propagar atributos HTML adicionais", () => {
    const { container } = render(
      <Loader
        aria-label="Carregando conteúdo"
        id="main-loader"
        title="Carregando"
      />,
    );
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveAttribute("aria-label", "Carregando conteúdo");
    expect(loader).toHaveAttribute("id", "main-loader");
    expect(loader).toHaveAttribute("title", "Carregando");
  });

  it("deve renderizar com múltiplas classes adicionais", () => {
    const { container } = render(<Loader className="class1 class2 class3" />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveClass("class1");
    expect(loader).toHaveClass("class2");
    expect(loader).toHaveClass("class3");
    expect(loader).toHaveClass("loader");
  });
});
