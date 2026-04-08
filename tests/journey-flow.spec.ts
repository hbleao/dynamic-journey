import { expect, test } from "@playwright/test";

const STORAGE_KEY = "journey-storage";
const CPF_FIELD = "field_cpf-input_m7oqd4";

function buildStoragePayload(fields: Record<string, unknown>) {
  return JSON.stringify({
    state: { fields, error: {}, business: {}, services: {} },
    version: 0,
  });
}

test.describe("Fluxo completo da jornada", () => {
  test("percorre todo o fluxo principal até a página de proposta", async ({
    page,
  }) => {
    // --- Step 1: CPF ---
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await page.waitForTimeout(300);

    // Preenche CPF válido
    await cpfInput.fill("12345678909");
    await page.waitForTimeout(200);

    // Usa navegação para ir ao próximo step
    const iniciarBtn = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(iniciarBtn).not.toHaveAttribute("aria-disabled", "true");
    await iniciarBtn.click();

    // --- Step 2: Placa ---
    await expect(
      page.locator("h2", { hasText: "Qual veículo você quer financiar?" }),
    ).toBeAttached();

    // Preenche placa (opcional)
    const placaInput = page.locator("#field_text-input_q45tjl");
    await placaInput.waitFor({ state: "attached" });
    await placaInput.fill("ABC1D23");

    // Vai para simulação
    const continuar1 = page.locator("a", { hasText: "Continuar" });
    await continuar1.waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await continuar1.click();

    // --- Step 5: Simulação ---
    await expect(
      page.locator("h2", { hasText: "Vamos simular o financiamento" }),
    ).toBeAttached();

    const continuar2 = page.locator("a", { hasText: "Continuar" });
    await continuar2.waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await continuar2.click();

    // --- Step 6: Dados Pessoais ---
    await expect(
      page.locator("h2", { hasText: "Agora, seus dados pessoais" }),
    ).toBeAttached();

    const nomeInput = page.locator("#field_text-input_2g9ted");
    await nomeInput.waitFor({ state: "attached" });
    await nomeInput.fill("Maria da Silva");

    const continuar3 = page.locator("a", { hasText: "Continuar" });
    await page.waitForTimeout(300);
    await continuar3.click();

    // --- Step 7: CEP ---
    await expect(
      page.locator("h2", { hasText: "Qual é o seu endereço?" }),
    ).toBeAttached();

    const cepInput = page.locator("#field_text-input_29t2s4");
    await cepInput.waitFor({ state: "attached" });
    await cepInput.fill("01001000");

    const continuar4 = page.locator("a", { hasText: "Continuar" });
    await page.waitForTimeout(300);
    await continuar4.click();

    // --- Step 8: Resumo ---
    await expect(
      page.locator("h2", { hasText: "Resumo da simulação" }),
    ).toBeAttached();

    const continuar5 = page.locator("a", { hasText: "Continuar" });
    await page.waitForTimeout(300);
    await continuar5.click();

    // --- Step 9: Proposta ---
    await expect(
      page.locator("h2", { hasText: "Proposta enviada" }),
    ).toBeAttached();
  });

  test("fluxo alternativo: CPF → Placa → 'Não sei a placa'", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await page.waitForTimeout(300);

    // Preenche CPF manualmente
    await cpfInput.fill("12345678909");
    await page.waitForTimeout(200);

    // Step CPF → Placa
    const iniciarBtn = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(iniciarBtn).not.toHaveAttribute("aria-disabled", "true");
    await iniciarBtn.click();

    // Step Placa
    await expect(
      page.locator("h2", { hasText: "Qual veículo você quer financiar?" }),
    ).toBeAttached();

    // Placa → "Não sei a placa"
    const naoSeiPlaca = page.locator("a", { hasText: "Não sei a placa" });
    await naoSeiPlaca.waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await naoSeiPlaca.click();

    // Step "Não-sei-a-placa-2" — verifica que navegou corretamente
    await expect(
      page.locator("h2", { hasText: "Sobre o seu veículo" }).first(),
    ).toBeAttached();

    // Verifica que os elementos do formulário estão presentes
    await expect(page.locator('select[name="field_select_zlgwa9"]')).toBeAttached();
    await expect(page.locator('input[name="field_checkbox_k6z6h2"]')).toBeAttached();
    await expect(page.locator("#field_text-input_ua0kpj")).toBeAttached();
  });

  test("dados preenchidos persistem durante a navegação entre steps", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();

    const cpfInput = page.locator(`#${CPF_FIELD}`);
    await cpfInput.waitFor({ state: "attached" });
    await page.waitForTimeout(300);

    await cpfInput.fill("12345678909");
    await page.waitForTimeout(200);

    // Navega para Placa
    const iniciarBtn = page.locator("a", { hasText: "Iniciar simulação" });
    await iniciarBtn.click();

    await expect(
      page.locator("h2", { hasText: "Qual veículo você quer financiar?" }),
    ).toBeAttached();

    // O sessionStorage deve ter os fields persistidos
    const raw = await page.evaluate(
      (key) => window.sessionStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.state.fields[CPF_FIELD]).toBe("12345678909");
  });
});
