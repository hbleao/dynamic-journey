const fs = require("node:fs");
const path = require("node:path");
const { generateChangeNotes } = require("./generateChangeNotes.cjs");

function normalize(content) {
  return content.replace(/^- Gerado em:.*$/m, "- Gerado em: <dinamico>");
}

function main() {
  const output = path.resolve(process.cwd(), "CHANGE_NOTES.md");
  const result = generateChangeNotes({ output });
  const nextContent = `${result.content}\n`;
  const currentContent = fs.existsSync(output)
    ? fs.readFileSync(output, "utf8")
    : "";

  if (normalize(currentContent) === normalize(nextContent)) {
    process.stdout.write("CHANGE_NOTES.md está atualizado.\n");
    return;
  }

  fs.writeFileSync(output, nextContent, "utf8");
  process.stderr.write(
    "CHANGE_NOTES.md foi atualizado. Adicione o arquivo e faça um novo commit antes do push.\n",
  );
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Erro ao verificar change notes.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
