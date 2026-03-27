const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const TYPE_TITLES = {
  feat: "Features",
  fix: "Correções",
  perf: "Performance",
  refactor: "Refatorações",
  docs: "Documentação",
  test: "Testes",
  build: "Build",
  ci: "CI",
  chore: "Chores",
  style: "Estilo",
  revert: "Reverts",
};

const TYPE_ORDER = [
  "feat",
  "fix",
  "perf",
  "refactor",
  "docs",
  "test",
  "build",
  "ci",
  "chore",
  "style",
  "revert",
];

function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function parseArgs(argv) {
  const args = {
    base: undefined,
    head: "HEAD",
    output: undefined,
    stdout: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--base") {
      args.base = argv[i + 1];
      i += 1;
      continue;
    }
    if (value === "--head") {
      args.head = argv[i + 1];
      i += 1;
      continue;
    }
    if (value === "--output") {
      args.output = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }
    if (value === "--stdout") {
      args.stdout = true;
    }
  }

  return args;
}

function getDefaultBaseRef() {
  try {
    return runGit([
      "rev-parse",
      "--abbrev-ref",
      "--symbolic-full-name",
      "@{upstream}",
    ]);
  } catch {
    try {
      const remoteHead = runGit(["symbolic-ref", "refs/remotes/origin/HEAD"]);
      return remoteHead.replace(/^refs\/remotes\//, "");
    } catch {
      return "origin/master";
    }
  }
}

function getCurrentBranchName() {
  try {
    return runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  } catch {
    return "head";
  }
}

function formatFileDate(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizeFileSegment(value) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "head"
  );
}

function resolveDefaultOutputPath(date = new Date()) {
  const branch = sanitizeFileSegment(getCurrentBranchName());
  const fileDate = formatFileDate(date);
  return path.resolve(
    process.cwd(),
    "docs",
    `change-notes-${branch}-${fileDate}.md`,
  );
}

function readCommits(range) {
  const raw = runGit([
    "log",
    "--reverse",
    "--format=%H%x1f%s%x1f%b%x1e",
    range,
  ]);

  if (!raw) return [];

  return raw
    .split("\x1e")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash = "", subject = "", body = ""] = entry.split("\x1f");
      return {
        hash,
        subject,
        body,
        files: readCommitFiles(hash),
      };
    });
}

function readCommitFiles(hash) {
  const raw = runGit(["show", "--format=", "--name-only", hash]);
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isChangeNotesFile(file) {
  return /^docs\/change-notes-.*\.md$/i.test(file);
}

function isChangeNotesOnlyCommit(commit) {
  return (
    Array.isArray(commit.files) &&
    commit.files.length > 0 &&
    commit.files.every((file) => isChangeNotesFile(file))
  );
}

function parseConventionalCommit(subject, body = "") {
  const match = subject.match(
    /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/i,
  );

  if (!match?.groups) return null;

  const type = match.groups.type.toLowerCase();
  const description = match.groups.description.trim();
  const scope = match.groups.scope?.trim();
  const breaking =
    Boolean(match.groups.breaking) || /BREAKING CHANGE:/i.test(body);

  return {
    type,
    scope,
    description,
    breaking,
  };
}

function buildChangeNotes(commits, context) {
  const grouped = new Map();
  const ignored = [];
  const breaking = [];

  const visibleCommits = commits.filter(
    (commit) => !isChangeNotesOnlyCommit(commit),
  );

  for (const commit of visibleCommits) {
    const parsed = parseConventionalCommit(commit.subject, commit.body);
    if (!parsed) {
      ignored.push(commit);
      continue;
    }

    if (!grouped.has(parsed.type)) {
      grouped.set(parsed.type, []);
    }

    grouped.get(parsed.type).push({
      ...parsed,
      hash: commit.hash,
      shortHash: commit.hash.slice(0, 7),
    });

    if (parsed.breaking) {
      breaking.push({
        ...parsed,
        hash: commit.hash,
        shortHash: commit.hash.slice(0, 7),
      });
    }
  }

  const lines = [];
  lines.push("# Change Notes");
  lines.push("");
  lines.push(`- Gerado em: ${context.generatedAt}`);
  lines.push(`- Faixa analisada: \`${context.range}\``);
  lines.push(`- Total de commits: ${visibleCommits.length}`);
  lines.push(
    `- Commits convencionais: ${visibleCommits.length - ignored.length}`,
  );
  lines.push(`- Commits ignorados: ${ignored.length}`);
  lines.push("");

  if (visibleCommits.length === 0) {
    lines.push("Nenhum commit encontrado na faixa informada.");
    lines.push("");
    return lines.join("\n");
  }

  if (breaking.length > 0) {
    lines.push("## Breaking Changes");
    lines.push("");
    for (const item of breaking) {
      const scope = item.scope ? `**${item.scope}**: ` : "";
      lines.push(`- ${scope}${item.description} (\`${item.shortHash}\`)`);
    }
    lines.push("");
  }

  for (const type of TYPE_ORDER) {
    const entries = grouped.get(type);
    if (!entries || entries.length === 0) continue;

    lines.push(`## ${TYPE_TITLES[type] ?? type}`);
    lines.push("");
    for (const item of entries) {
      const scope = item.scope ? `**${item.scope}**: ` : "";
      const suffix = item.breaking ? " **BREAKING**" : "";
      lines.push(
        `- ${scope}${item.description} (\`${item.shortHash}\`)${suffix}`,
      );
    }
    lines.push("");
  }

  if (ignored.length > 0) {
    lines.push("## Ignorados");
    lines.push("");
    for (const item of ignored) {
      lines.push(`- ${item.subject} (\`${item.hash.slice(0, 7)}\`)`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateChangeNotes(options = {}) {
  const base = options.base ?? getDefaultBaseRef();
  const head = options.head ?? "HEAD";
  const output = options.output ?? resolveDefaultOutputPath();
  const range = `${base}..${head}`;
  const commits = readCommits(range);
  const generatedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date());
  const content = buildChangeNotes(commits, { range, generatedAt });

  return {
    base,
    head,
    range,
    output,
    generatedAt,
    commits,
    content,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = generateChangeNotes(args);

  if (args.stdout) {
    process.stdout.write(`${result.content}\n`);
    return;
  }

  fs.mkdirSync(path.dirname(result.output), { recursive: true });
  fs.writeFileSync(result.output, `${result.content}\n`, "utf8");
  process.stdout.write(`Change notes gerado em ${result.output}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao gerar change notes.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  buildChangeNotes,
  formatFileDate,
  generateChangeNotes,
  getDefaultBaseRef,
  getCurrentBranchName,
  isChangeNotesOnlyCommit,
  isChangeNotesFile,
  parseConventionalCommit,
  parseArgs,
  readCommitFiles,
  readCommits,
  resolveDefaultOutputPath,
  sanitizeFileSegment,
};
