import { expect, test } from "@playwright/test";

test.describe("Step 1 — CPF: renderização dos elementos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();
    await page.locator("#field_cpf-input_m7oqd4").waitFor({ state: "attached" });
  });

  test("exibe título e parágrafo do step CPF", async ({ page }) => {
    await expect(page.locator("h2")).toContainText("Qual é o seu CPF?");
    await expect(
      page.locator("p", {
        hasText: "Precisamos dele para confirmar se o financiamento está disponível para você.",
      }),
    ).toBeAttached();
  });

  test("exibe input de CPF com label correto", async ({ page }) => {
    const label = page.locator('label[for="field_cpf-input_m7oqd4"]');
    await expect(label).toContainText("CPF");

    const input = page.locator("#field_cpf-input_m7oqd4");
    await expect(input).toHaveAttribute("type", "text");
  });

  test("exibe botão 'Iniciar simulação' (link de navegação)", async ({ page }) => {
    const navLink = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navLink).toBeAttached();
  });

  test("exibe botão 'Submit' (service call)", async ({ page }) => {
    const submitBtn = page.locator("button", { hasText: "Submit" });
    await expect(submitBtn).toBeAttached();
  });
});

test.describe("Step 1 — CPF: validação de campo required", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();
    await page.locator("#field_cpf-input_m7oqd4").waitFor({ state: "attached" });
    await page.waitForTimeout(300); // aguarda hidratação
  });

  test("botão desabilitado com CPF vazio", async ({ page }) => {
    const navLink = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navLink).toHaveAttribute("aria-disabled", "true");
  });

  test("botão desabilitado com CPF incompleto (menos de 11 dígitos)", async ({
    page,
  }) => {
    const cpfInput = page.locator("#field_cpf-input_m7oqd4");
    await cpfInput.fill("123456");

    await page.waitForTimeout(200);
    const navLink = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navLink).toHaveAttribute("aria-disabled", "true");
  });

  test("botão habilitado com CPF de 11 dígitos", async ({ page }) => {
    const cpfInput = page.locator("#field_cpf-input_m7oqd4");
    await cpfInput.fill("12345678909");

    await page.waitForTimeout(200);
    const navLink = page.locator("a", { hasText: "Iniciar simulação" });
    await expect(navLink).not.toHaveAttribute("aria-disabled", "true");
  });

  test("service call button também respeita canProceed", async ({ page }) => {
    const submitBtn = page.locator("button", { hasText: "Submit" });
    await expect(submitBtn).toHaveAttribute("aria-disabled", "true");
    await expect(submitBtn).toBeDisabled();

    // Preenche CPF válido
    const cpfInput = page.locator("#field_cpf-input_m7oqd4");
    await cpfInput.fill("12345678909");
    await page.waitForTimeout(200);

    await expect(submitBtn).not.toHaveAttribute("aria-disabled", "true");
    await expect(submitBtn).toBeEnabled();
  });
});
