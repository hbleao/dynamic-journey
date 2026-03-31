import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { journeyStore } from "@/store/journeyStore";
import type { JourneyDefinition } from "@/validation/schemaValidation/journey.schema";
import { JourneyRunner } from "./JourneyRunner";

function resetStore() {
  journeyStore.getState().reset();
  journeyStore.getState().mergeBusiness({ base_url: "" });
}

describe("JourneyRunner (integration)", () => {
  beforeEach(() => {
    window.history.pushState(null, "", "/");
    resetStore();
  });

  it("blocks navigation when required field is missing", async () => {
    const journey: JourneyDefinition = {
      id: "j1",
      name: "j1",
      slug: "j1",
      steps: [
        {
          id: "s1",
          name: "S1",
          slug: "cpf",
          order: 0,
          backStepSlug: "",
          elements: [
            {
              id: "t1",
              type: "TEXT_INPUT",
              order: 0,
              config: {
                label: "Nome",
                required: true,
                name: "nome",
              },
            },
            {
              id: "n1",
              type: "NAVIGATION",
              order: 1,
              config: { label: "Ir", url: "next" },
            },
          ],
        },
        {
          id: "s2",
          name: "S2",
          slug: "next",
          order: 1,
          backStepSlug: "cpf",
          elements: [
            {
              id: "p1",
              type: "PARAGRAPH",
              order: 0,
              config: { text: "Ok" },
            },
          ],
        },
      ],
    };

    const user = userEvent.setup();
    render(<JourneyRunner journey={journey} />);

    // link desabilitado desde o início: campo obrigatório vazio
    const link = screen.getByRole("link", { name: "Ir" });
    expect(link).toHaveAttribute("aria-disabled", "true");

    await user.click(link);

    expect(journeyStore.getState().stepSlug).toBe("cpf");
    expect(window.location.pathname).toBe("/");
  });

  it("calls SERVICE_CALL, stores result in services and navigates on success", async () => {
    const journey: JourneyDefinition = {
      id: "j2",
      name: "j2",
      slug: "j2",
      steps: [
        {
          id: "s1",
          name: "S1",
          slug: "cpf",
          order: 0,
          backStepSlug: "",
          elements: [
            {
              id: "t1",
              type: "TEXT_INPUT",
              order: 0,
              config: {
                label: "Nome",
                required: false,
                name: "nome",
              },
            },
            {
              id: "sc1",
              type: "SERVICE_CALL",
              order: 1,
              config: {
                label: "Submit",
                service: "eligibility",
                targetStepOnSuccess: "next",
              },
            },
          ],
        },
        {
          id: "s2",
          name: "S2",
          slug: "next",
          order: 1,
          backStepSlug: "cpf",
          elements: [
            {
              id: "p1",
              type: "PARAGRAPH",
              order: 0,
              config: { text: "Ok" },
            },
          ],
        },
      ],
    };

    const user = userEvent.setup();
    render(<JourneyRunner journey={journey} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(journeyStore.getState().services).toHaveProperty("eligibility");
    expect(journeyStore.getState().stepSlug).toBe("next");
    expect(window.location.pathname).toBe("/next");
  });

  it("prefills input from services using defaultValueFrom", async () => {
    const journey: JourneyDefinition = {
      id: "j3",
      name: "j3",
      slug: "j3",
      steps: [
        {
          id: "s1",
          name: "S1",
          slug: "cpf",
          order: 0,
          backStepSlug: "",
          elements: [
            {
              id: "t1",
              type: "TEXT_INPUT",
              order: 0,
              config: {
                label: "Nome",
                required: false,
                name: "nome",
              },
            },
            {
              id: "sc1",
              type: "SERVICE_CALL",
              order: 1,
              config: {
                label: "Submit",
                service: "eligibility",
                targetStepOnSuccess: "next",
              },
            },
          ],
        },
        {
          id: "s2",
          name: "S2",
          slug: "next",
          order: 1,
          backStepSlug: "cpf",
          elements: [
            {
              id: "t2",
              type: "TEXT_INPUT",
              order: 0,
              config: {
                label: "Nome prefilled",
                required: false,
                name: "prefilled_nome",
                defaultValueFrom: {
                  service: "eligibility",
                  path: "data.input.fields.nome",
                },
              },
            },
          ],
        },
      ],
    };

    const user = userEvent.setup();
    render(<JourneyRunner journey={journey} />);

    const firstStepInput = screen.getByRole("textbox");
    await user.type(firstStepInput, "João");

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await screen.findByText("Nome prefilled");
    const prefilledInput = screen.getByRole("textbox");
    await waitFor(() => expect(prefilledInput).toHaveValue("João"));
  });
});
