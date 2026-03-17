import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Input } from "./index";

describe("Input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar corretamente com valores padrão", () => {
    const { container } = render(<Input data-testid="input-root" />);

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toBeInTheDocument();
    expect(inputRoot).toHaveClass("--default");
    expect(inputRoot).toHaveClass("--contain");

    const inputField = screen.getByRole("textbox");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveClass("input__field");
    expect(inputField).toHaveAttribute("type", "text");

    const label = container.querySelector(".input__label");
    expect(label).not.toBeInTheDocument();

    const loader = container.querySelector(".input__loader");
    expect(loader).not.toBeInTheDocument();

    const helperText = container.querySelector(".input__helper-text");
    expect(helperText).not.toBeInTheDocument();

    const errorMessage = container.querySelector(".input__error-message");
    expect(errorMessage).not.toBeInTheDocument();
  });

  it("deve renderizar com label quando fornecido", () => {
    const { container } = render(<Input label="Nome" name="name" />);

    const label = container.querySelector(".input__label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Nome");
    expect(label).toHaveAttribute("for", "name");
  });

  it("deve renderizar com valor quando fornecido", () => {
    const { container } = render(<Input value="Texto de exemplo" />);

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveValue("Texto de exemplo");

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveClass("--filled");
  });

  it("deve renderizar como desabilitado quando disabled=true", () => {
    const { container } = render(<Input disabled />);

    const inputField = screen.getByRole("textbox");
    expect(inputField).toBeDisabled();

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveClass("--disabled");
  });

  it("deve renderizar com loader quando isLoading=true", () => {
    render(<Input isLoading />);

    const loader = document.querySelector(".input__loader");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass("loader");
  });

  it("deve renderizar com texto de ajuda quando fornecido", () => {
    const { container } = render(<Input helperText="Texto de ajuda" />);

    const helperText = container.querySelector(".input__helper-text");
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveTextContent("Texto de ajuda");
  });

  it("deve renderizar com mensagem de erro quando fornecida", () => {
    const { container } = render(<Input errorMessage="Mensagem de erro" />);

    const errorMessage = container.querySelector(".input__error-message");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent("Mensagem de erro");

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveClass("--error");
  });

  it("deve priorizar mensagem de erro sobre texto de ajuda", () => {
    const { container } = render(
      <Input helperText="Texto de ajuda" errorMessage="Mensagem de erro" />,
    );

    const errorMessage = container.querySelector(".input__error-message");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent("Mensagem de erro");

    const helperText = container.querySelector(".input__helper-text");
    expect(helperText).not.toBeInTheDocument();
  });

  it("deve aplicar classe --focused ao receber foco", () => {
    const { container } = render(<Input data-testid="input-root" />);

    const inputRoot = container.querySelector(".input__root");
    const inputField = screen.getByRole("textbox");

    expect(inputRoot).not.toHaveClass("--focused");

    fireEvent.focus(inputField);
    expect(inputRoot).toHaveClass("--focused");

    fireEvent.blur(inputField);
    expect(inputRoot).not.toHaveClass("--focused");
  });

  it("não deve aplicar classe --focused quando desabilitado", () => {
    const { container } = render(<Input disabled />);

    const inputRoot = container.querySelector(".input__root");
    const inputField = screen.getByRole("textbox");

    fireEvent.focus(inputField);
    expect(inputRoot).not.toHaveClass("--focused");
  });

  it("deve chamar onChange quando o valor é alterado", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const inputField = screen.getByRole("textbox");

    fireEvent.change(inputField, { target: { value: "Novo texto" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar com variante outlined", () => {
    const { container } = render(<Input variant="outlined" />);

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveClass("--outlined");
    expect(inputRoot).not.toHaveClass("--default");
  });

  it("deve renderizar com largura fluid", () => {
    const { container } = render(<Input width="fluid" />);

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveClass("--fluid");
    expect(inputRoot).not.toHaveClass("--contain");
  });

  it("deve aplicar classes CSS adicionais", () => {
    const { container } = render(<Input className="custom-class" />);

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveClass("custom-class");
    expect(inputRoot).toHaveClass("input__root");
  });

  it("deve passar atributos HTML adicionais para o elemento raiz", () => {
    const { container } = render(
      <Input aria-label="Campo de texto" title="Insira seu texto aqui" />,
    );

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toHaveAttribute("aria-label", "Campo de texto");
    expect(inputRoot).toHaveAttribute("title", "Insira seu texto aqui");
  });

  it("deve renderizar com nome e id corretos", () => {
    render(<Input name="username" />);

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveAttribute("name", "username");
    expect(inputField).toHaveAttribute("id", "username");
  });

  it("deve aplicar a classe --focused ao receber foco no campo de entrada", () => {
    const { container } = render(<Input />);

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot).toBeInTheDocument();

    const inputField = screen.getByRole("textbox");

    expect(inputRoot?.className).not.toContain("--focused");

    fireEvent.focus(inputField);

    expect(inputRoot?.className).toContain("--focused");
  });

  it("deve lidar corretamente com valores não string", () => {
    const { container } = render(<Input value={"123"} />);

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveValue("123");

    const inputRoot = container.querySelector(".input__root");
    expect(inputRoot?.className).toContain("--filled");
  });
});
