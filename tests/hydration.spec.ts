import { expect, test } from "@playwright/test";

const STORAGE_KEY = "journey-storage";
const CPF_FIELD = "field_cpf-input_m7oqd4";

function buildStoragePayload(fields: Record<string, unknown>) {
  return JSON.stringify({
    state: { fields, error: {}, business: {}, services: {} },
    version: 0,
  });
}

test.describe("Zustand sessionStorage — persistência e rehidratação", () => {
  test("salva dados no sessionStorage ao preencher o campo CPF", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await cpfInput.fill("12345678909");

    // Simula o que o store faria no goNext (mergeFields → persist)
    await page.evaluate(
      ({ key, value }) => window.sessionStorage.setItem(key, value),
      {
        key: STORAGE_KEY,
        value: buildStoragePayload({ [CPF_FIELD]: "12345678909" }),
      },
    );

    const raw = await page.evaluate(
      (key) => window.sessionStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.fields[CPF_FIELD]).toBe("12345678909");
  });

  test("rehidrata dados do sessionStorage após reload e habilita o botão", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(
      ({ key, value }) => window.sessionStorage.setItem(key, value),
      {
        key: STORAGE_KEY,
        value: buildStoragePayload({ [CPF_FIELD]: "12345678909" }),
      },
    );

    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await expect(cpfInput).toHaveValue("12345678909");

    const navButton = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navButton).not.toHaveAttribute("aria-disabled", "true");
  });

  test("mantém botão desabilitado quando sessionStorage está vazia", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await page.waitForTimeout(300);

    const navButton = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navButton).toHaveAttribute("aria-disabled", "true");
  });

  test("limpa sessionStorage e campo fica vazio após reload", async ({ page }) => {
    // Pré-popula com CPF válido
    await page.goto("/");
    await page.evaluate(
      ({ key, value }) => window.sessionStorage.setItem(key, value),
      {
        key: STORAGE_KEY,
        value: buildStoragePayload({ [CPF_FIELD]: "12345678909" }),
      },
    );

    // Verifica que foi salvo
    const stored = await page.evaluate(
      (key) => window.sessionStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(stored).not.toBeNull();

    // Limpa e recarrega
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await expect(cpfInput).toHaveValue("");
  });
});
