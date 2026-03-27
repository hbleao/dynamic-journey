const { describe, expect, it } = require("vitest");
const {
  buildChangeNotes,
  isChangeNotesFile,
  isChangeNotesOnlyCommit,
  parseConventionalCommit,
  sanitizeFileSegment,
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
          files: ["src/app/page.tsx"],
        },
        {
          hash: "987654abcdef",
          subject: "docs(changenotes): atualiza arquivo",
          body: "",
          files: ["docs/change-notes-master-2026-03-26.md"],
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
    expect(content).not.toContain("atualiza arquivo");
  });
});

describe("isChangeNotesOnlyCommit", () => {
  it("retorna true quando o commit altera apenas CHANGE_NOTES.md", () => {
    expect(
      isChangeNotesOnlyCommit({
        files: ["docs/change-notes-master-2026-03-26.md"],
      }),
    ).toBe(true);
  });

  it("retorna false quando o commit altera outros arquivos", () => {
    expect(
      isChangeNotesOnlyCommit({
        files: ["docs/change-notes-master-2026-03-26.md", "README.md"],
      }),
    ).toBe(false);
  });
});

describe("helpers de arquivo", () => {
  it("identifica arquivos de change notes dentro de docs", () => {
    expect(isChangeNotesFile("docs/change-notes-master-2026-03-26.md")).toBe(
      true,
    );
  });

  it("sanitiza o nome da branch para nome de arquivo", () => {
    expect(sanitizeFileSegment("feature/HDV-1234")).toBe("feature-hdv-1234");
  });
});
