import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "./index";

describe("Loader (re-export)", () => {
  it("renderiza o Loader com defaults", () => {
    const { container } = render(<Loader />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass("loader");
  });

  it("propaga atributos HTML adicionais", () => {
    const { container } = render(<Loader aria-label="Carregando" title="X" />);
    const loader = container.firstChild as HTMLElement;

    expect(loader).toHaveAttribute("aria-label", "Carregando");
    expect(loader).toHaveAttribute("title", "X");
  });
});
