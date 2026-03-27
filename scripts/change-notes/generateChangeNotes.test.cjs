const { describe, expect, it } = require("vitest");
const {
  buildChangeNotes,
  parseConventionalCommit,
} = require("./generateChangeNotes.cjs");

describe("parseConventionalCommit", () => {
  it("parseia commit simples", () => {
    expect(parseConventionalCommit("feat: adiciona change notes")).toEqual({
      type: "feat",
      scope: undefined,
      description: "adiciona change notes",
      breaking: false,
    });
  });

  it("parseia scope e breaking change", () => {
    expect(
      parseConventionalCommit(
        "refactor(runner)!: extrai hook",
        "BREAKING CHANGE: muda contrato do runner",
      ),
    ).toEqual({
      type: "refactor",
      scope: "runner",
      description: "extrai hook",
      breaking: true,
    });
  });

  it("ignora commit fora do padrão", () => {
    expect(parseConventionalCommit("ajuste qualquer")).toBeNull();
  });
});

describe("buildChangeNotes", () => {
  it("agrupa commits por tipo e separa ignorados", () => {
    const content = buildChangeNotes(
      [
        {
          hash: "abcdef123456",
          subject: "feat(ui): adiciona botão",
          body: "",
        },
        {
          hash: "fedcba654321",
          subject: "fix: corrige navegação",
          body: "",
        },
        {
          hash: "123456abcdef",
          subject: "mensagem sem padrão",
          body: "",
        },
      ],
      { range: "origin/release..HEAD" },
    );

    expect(content).toContain("# Change Notes");
    expect(content).toContain("- Gerado em:");
    expect(content).toContain("## Features");
    expect(content).toContain("**ui**: adiciona botão");
    expect(content).toContain("## Correções");
    expect(content).toContain("corrige navegação");
    expect(content).toContain("## Ignorados");
    expect(content).toContain("mensagem sem padrão");
  });
});
