import { expect, test } from "@playwright/test";

const STORAGE_KEY = "journey-storage";
const CPF_FIELD = "field_cpf-input_m7oqd4";

function buildStoragePayload(
  fields: Record<string, unknown>,
) {
  return JSON.stringify({
    state: {
      fields,
      error: {},
      business: {},
      services: {},
    },
    version: 0,
  });
}

test.describe("Navegação entre steps", () => {
  test("navega do step CPF para o step Placa ao clicar 'Iniciar simulação'", async ({
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

    const navLink = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navLink).not.toHaveAttribute("aria-disabled", "true");
    await navLink.click();

    await expect(
      page.locator("h2", { hasText: "Qual veículo você quer financiar?" }),
    ).toBeAttached();
  });

  test("step Placa exibe os elementos corretos", async ({ page }) => {
    await page.goto("/placa");

    await expect(
      page.locator("h2", { hasText: "Qual veículo você quer financiar?" }),
    ).toBeAttached();

    await expect(
      page.locator("p", {
        hasText: "Com a placa é mais rápido preencher os dados do seu veículo.",
      }),
    ).toBeAttached();

    const placaInput = page.locator("#field_text-input_q45tjl");
    await expect(placaInput).toBeAttached();

    await expect(page.locator("a", { hasText: "Não sei a placa" })).toBeAttached();
    await expect(page.locator("a", { hasText: "Continuar" })).toBeAttached();
  });

  test("step Placa → clica 'Não sei a placa' → navega para step correto", async ({
    page,
  }) => {
    await page.goto("/placa");

    await page.locator("a", { hasText: "Não sei a placa" }).waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await page.locator("a", { hasText: "Não sei a placa" }).click();

    await expect(
      page.locator("h2", { hasText: "Sobre o seu veículo" }).first(),
    ).toBeAttached();
  });

  test("step Placa → clica 'Continuar' → navega para simulação", async ({
    page,
  }) => {
    await page.goto("/placa");

    await page.locator("a", { hasText: "Continuar" }).waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await page.locator("a", { hasText: "Continuar" }).click();

    await expect(
      page.locator("h2", { hasText: "Vamos simular o financiamento" }),
    ).toBeAttached();
  });

  test("step Simulação → clica 'Continuar' → navega para dados pessoais", async ({
    page,
  }) => {
    await page.goto("/simulacao");

    await page.locator("a", { hasText: "Continuar" }).waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await page.locator("a", { hasText: "Continuar" }).click();

    await expect(
      page.locator("h2", { hasText: "Agora, seus dados pessoais" }),
    ).toBeAttached();
  });
});

test.describe("Navegação direta por URL (deep link)", () => {
  test("acessa step Simulação diretamente via URL", async ({ page }) => {
    await page.goto("/simulacao");

    await expect(
      page.locator("h2", { hasText: "Vamos simular o financiamento" }),
    ).toBeAttached();
  });

  test("acessa step Dados Pessoais diretamente via URL", async ({ page }) => {
    await page.goto("/dados-pessoais");

    await expect(
      page.locator("h2", { hasText: "Agora, seus dados pessoais" }),
    ).toBeAttached();
  });

  test("acessa step CEP diretamente via URL", async ({ page }) => {
    await page.goto("/cep");

    await expect(
      page.locator("h2", { hasText: "Qual é o seu endereço?" }),
    ).toBeAttached();
  });

  test("acessa step Resumo diretamente via URL", async ({ page }) => {
    await page.goto("/resumo");

    await expect(
      page.locator("h2", { hasText: "Resumo da simulação" }),
    ).toBeAttached();
  });

  test("acessa step Proposta diretamente via URL", async ({ page }) => {
    await page.goto("/proposta");

    await expect(
      page.locator("h2", { hasText: "Proposta enviada" }),
    ).toBeAttached();
  });
});
