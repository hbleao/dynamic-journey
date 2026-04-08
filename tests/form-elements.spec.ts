import { expect, test } from "@playwright/test";

test.describe("Step Dados Pessoais — todos os tipos de elementos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dados-pessoais");
    await page.locator("h2", { hasText: "Agora, seus dados pessoais" }).waitFor({ state: "attached" });
  });

  test("renderiza campos TEXT_INPUT", async ({ page }) => {
    // Nome completo
    await expect(page.locator("#field_text-input_2g9ted")).toBeAttached();
    await expect(page.locator('label[for="field_text-input_2g9ted"]')).toContainText("Nome completo");

    // Nome da mãe
    await expect(page.locator("#field_text-input_wvxkfx")).toBeAttached();
    await expect(page.locator('label[for="field_text-input_wvxkfx"]')).toContainText("Nome da mãe");

    // Data de nascimento
    await expect(page.locator("#field_text-input_nr5jrc")).toBeAttached();

    // E-mail
    await expect(page.locator("#field_text-input_r36prb")).toBeAttached();

    // Renda
    await expect(page.locator("#field_text-input_4pzx75")).toBeAttached();
  });

  test("renderiza CHECKBOX 'Tenho nome social'", async ({ page }) => {
    const checkbox = page.locator('input[name="field_checkbox_pz2dxg"]');
    await expect(checkbox).toBeAttached();
    await expect(checkbox).toHaveAttribute("type", "checkbox");

    const label = page.locator("label", { hasText: "Tenho nome social" });
    await expect(label).toBeAttached();
  });

  test("renderiza SELECT 'Ocupação'", async ({ page }) => {
    const select = page.locator('select[name="field_select_eqxgob"]');
    await expect(select).toBeAttached();

    await expect(select.locator("option").first()).toHaveText("Selecione...");

    await expect(
      select.locator('option[value="Eng. Eletrico"]'),
    ).toHaveText("Eng. Software");
  });

  test("preenche TEXT_INPUT corretamente", async ({ page }) => {
    const nomeInput = page.locator("#field_text-input_2g9ted");
    await nomeInput.fill("Maria da Silva");
    await expect(nomeInput).toHaveValue("Maria da Silva");
  });

  test("marca e desmarca CHECKBOX", async ({ page }) => {
    const checkbox = page.locator('input[name="field_checkbox_pz2dxg"]');
    await expect(checkbox).not.toBeChecked();

    await checkbox.check();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test("seleciona opção no SELECT", async ({ page }) => {
    const select = page.locator('select[name="field_select_eqxgob"]');
    await select.selectOption("Eng. Eletrico");
    await expect(select).toHaveValue("Eng. Eletrico");
  });

  test("botão 'Continuar' está habilitado (campos opcionais)", async ({
    page,
  }) => {
    await page.waitForTimeout(300);
    const navLink = page.locator("a", { hasText: "Continuar" });
    await expect(navLink).not.toHaveAttribute("aria-disabled", "true");
  });
});

test.describe("Step Não-sei-a-placa-2 — RADIO + SELECT + CHECKBOX + TEXT_INPUT", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/no-sei-a-placa-2");
    await page.locator("h2", { hasText: "Sobre o seu veículo" }).first().waitFor({ state: "attached" });
  });

  test("renderiza RADIO 'Já sabe qual modelo quer financiar?'", async ({
    page,
  }) => {
    const fieldset = page.locator("fieldset", {
      hasText: "Já sabe qual modelo quer financiar?",
    });
    await expect(fieldset).toBeAttached();

    const sim = fieldset.locator('input[value="sim"]');
    const nao = fieldset.locator('input[value="nao"]');
    await expect(sim).toBeAttached();
    await expect(nao).toBeAttached();
  });

  test("seleciona opção no RADIO", async ({ page }) => {
    const sim = page.locator('input[name="field_radio_cr474w"][value="sim"]');
    const nao = page.locator('input[name="field_radio_cr474w"][value="nao"]');

    await sim.click();
    await expect(sim).toBeChecked();
    await expect(nao).not.toBeChecked();

    await nao.click();
    await expect(nao).toBeChecked();
    await expect(sim).not.toBeChecked();
  });

  test("renderiza SELECT 'Ano de fabricação'", async ({ page }) => {
    const label = page.locator("label", { hasText: "Ano de fabricação" });
    await expect(label).toBeAttached();

    const select = page.locator('select[name="field_select_zlgwa9"]');
    await expect(select).toBeAttached();
  });

  test("renderiza CHECKBOX 'Veículo 0km'", async ({ page }) => {
    const checkbox = page.locator('input[name="field_checkbox_k6z6h2"]');
    await expect(checkbox).toBeAttached();
    await expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  test("renderiza TEXT_INPUT 'Modelo'", async ({ page }) => {
    const input = page.locator("#field_text-input_ua0kpj");
    await expect(input).toBeAttached();
  });
});
