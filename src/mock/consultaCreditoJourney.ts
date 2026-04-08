import { journeySchema } from "@/validation/schemaValidation/journey.schema";

export const consultaCreditoJourney = journeySchema.parse({
  id: "consulta-credito-001",
  name: "consulta-de-credito",
  slug: "consulta-de-credito",
  completion: {
    type: "FINAL_SUCCESS",
  },
  steps: [
    {
      id: "step-identificacao",
      name: "Identificação",
      slug: "identificacao",
      order: 0,
      backStepSlug: "/",
      elements: [
        {
          id: "title-identificacao",
          type: "TITLE",
          order: 0,
          config: {
            text: "Consulta de crédito",
            size: "lg",
          },
        },
        {
          id: "paragraph-identificacao",
          type: "PARAGRAPH",
          order: 1,
          config: {
            text: "Preencha seus dados para verificarmos sua elegibilidade.",
          },
        },
        {
          id: "cpf-identificacao",
          type: "CPF_INPUT",
          order: 2,
          config: {
            label: "CPF",
            placeholder: "000.000.000-00",
            required: true,
            name: "field_cpf-input_ident01",
          },
        },
        {
          id: "nome-identificacao",
          type: "TEXT_INPUT",
          order: 3,
          config: {
            label: "Nome completo",
            placeholder: "Digite seu nome...",
            required: true,
            name: "field_text-input_nome01",
          },
        },
        {
          id: "service-call-eligibility",
          type: "SERVICE_CALL",
          order: 4,
          config: {
            label: "Consultar elegibilidade",
            service: "eligibility",
            targetStepOnSuccess: "resultado-consulta",
          },
        },
      ],
    },
    {
      id: "step-resultado",
      name: "Resultado da Consulta",
      slug: "resultado-consulta",
      order: 1,
      backStepSlug: "identificacao",
      elements: [
        {
          id: "title-resultado",
          type: "TITLE",
          order: 0,
          config: {
            text: "Consulta realizada com sucesso!",
            size: "lg",
          },
        },
        {
          id: "paragraph-resultado",
          type: "PARAGRAPH",
          order: 1,
          config: {
            text: "Confirme os dados verificados pela consulta de elegibilidade.",
          },
        },
        {
          id: "cpf-resultado",
          type: "TEXT_INPUT",
          order: 2,
          config: {
            label: "CPF verificado",
            placeholder: "",
            required: false,
            name: "field_text-input_cpf-resultado",
            defaultValueFrom: {
              service: "eligibility",
              path: "data.input.fields.field_cpf-input_ident01",
            },
          },
        },
        {
          id: "nome-resultado",
          type: "TEXT_INPUT",
          order: 3,
          config: {
            label: "Nome verificado",
            placeholder: "",
            required: false,
            name: "field_text-input_nome-resultado",
            defaultValueFrom: {
              service: "eligibility",
              path: "data.input.fields.field_text-input_nome01",
            },
          },
        },
        {
          id: "score-resultado",
          type: "TEXT_INPUT",
          order: 4,
          config: {
            label: "Score de crédito",
            placeholder: "",
            required: false,
            name: "field_text-input_score-resultado",
            defaultValueFrom: {
              service: "eligibility",
              path: "data.creditScore",
            },
          },
        },
        {
          id: "nav-confirmacao",
          type: "NAVIGATION",
          order: 5,
          config: {
            label: "Continuar",
            url: "confirmacao",
          },
        },
      ],
    },
    {
      id: "step-confirmacao",
      name: "Confirmação",
      slug: "confirmacao",
      order: 2,
      backStepSlug: "resultado-consulta",
      elements: [
        {
          id: "title-confirmacao",
          type: "TITLE",
          order: 0,
          config: {
            text: "Tudo certo!",
            size: "lg",
          },
        },
        {
          id: "paragraph-confirmacao",
          type: "PARAGRAPH",
          order: 1,
          config: {
            text: "Seus dados foram confirmados e você está elegível para crédito.",
          },
        },
        {
          id: "radio-confirmacao",
          type: "RADIO",
          order: 2,
          config: {
            label: "Deseja prosseguir com a proposta?",
            required: false,
            name: "field_radio_confirma01",
            options: [
              { label: "Sim, quero prosseguir", value: "sim" },
              { label: "Não por enquanto", value: "nao" },
            ],
          },
        },
        {
          id: "nav-final",
          type: "NAVIGATION",
          order: 3,
          config: {
            label: "Finalizar",
            url: "finalizado",
          },
        },
      ],
    },
    {
      id: "step-finalizado",
      name: "Finalizado",
      slug: "finalizado",
      order: 3,
      backStepSlug: "confirmacao",
      elements: [
        {
          id: "title-finalizado",
          type: "TITLE",
          order: 0,
          config: {
            text: "Proposta enviada com sucesso!",
            size: "lg",
          },
        },
        {
          id: "paragraph-finalizado",
          type: "PARAGRAPH",
          order: 1,
          config: {
            text: "Em breve você receberá uma resposta sobre sua proposta de crédito.",
          },
        },
      ],
    },
  ],
  createdAt: "2026-04-08T00:00:00.000Z",
  updatedAt: "2026-04-08T00:00:00.000Z",
});
