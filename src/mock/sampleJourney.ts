import { journeySchema } from "@/validation/schemaValidation/journey.schema";

export const sampleJourney = journeySchema.parse({
  id: "l7g66xfqb",
  name: "financiamento-de-veiculos",
  slug: "financiamento-de-veiculos",
  completion: {
    type: "FINAL_SUCCESS",
  },
  steps: [
    {
      id: "cqyxfwvxr",
      name: "Cpf",
      slug: "cpf",
      order: 0,
      elements: [
        {
          id: "shva8tqw2",
          type: "TITLE",
          order: 0,
          config: {
            text: "Qual é o seu CPF?",
            size: "lg",
          },
        },
        {
          id: "e8f9tectk",
          type: "PARAGRAPH",
          order: 1,
          config: {
            text: "Precisamos dele para confirmar se o financiamento está disponível para você.",
          },
        },
        {
          id: "m7oqd4ikg",
          type: "CPF_INPUT",
          order: 2,
          config: {
            label: "CPF",
            placeholder: "000.000.000-00",
            required: true,
            name: "field_cpf-input_m7oqd4",
          },
        },
        {
          id: "fsy3i10m6",
          type: "NAVIGATION",
          order: 3,
          config: {
            label: "Iniciar simulação",
            url: "placa",
          },
        },
        {
          id: "tdy4iv0m4",
          type: "SERVICE_CALL",
          order: 4,
          config: {
            label: "Submit",
            service: "eligibility",
            targetStepOnSuccess: "placa",
          },
        },
      ],
      backStepSlug: "/",
    },
    {
      id: "51iub4ixm",
      name: "Placa",
      slug: "placa",
      order: 1,
      elements: [
        {
          id: "r3q9r0ze3",
          type: "TITLE",
          order: 0,
          config: {
            text: "Qual veículo você quer financiar?",
            size: "lg",
          },
        },
        {
          id: "2jiecpga0",
          type: "PARAGRAPH",
          order: 1,
          config: {
            text: "Com a placa é mais rápido preencher os dados do seu veículo.",
          },
        },
        {
          id: "q45tjlxol",
          type: "TEXT_INPUT",
          order: 2,
          config: {
            label: "Placa do veículo",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_q45tjl",
            defaultValueFrom: {
              service: "eligibility",
              path: "data.input.fields.field_cpf-input_m7oqd4",
            },
          },
        },
        {
          id: "2g86ws74i",
          type: "NAVIGATION",
          order: 3,
          config: {
            label: "Não sei a placa",
            url: "no-sei-a-placa-2",
          },
        },
        {
          id: "56egdln61",
          type: "NAVIGATION",
          order: 4,
          config: {
            label: "Continuar",
            url: "simulacao",
          },
        },
      ],
      backStepSlug: "cpf",
    },
    {
      id: "f4b19zx4j",
      name: "Não sei a placa",
      slug: "nao-sei-a-placa",
      order: 2,
      elements: [
        {
          id: "uffe64tig",
          type: "TITLE",
          order: 0,
          config: {
            text: "Sobre o seu veículo",
            size: "lg",
          },
        },
        {
          id: "k4v3t00bm",
          type: "RADIO",
          order: 1,
          config: {
            label: "Já sabe qual modelo quer financiar?",
            required: false,
            options: [
              { label: "Sim", value: "sim" },
              { label: "Não", value: "nao" },
            ],
            name: "field_radio_k4v3t0",
          },
        },
        {
          id: "bss02fnc1",
          type: "NAVIGATION",
          order: 2,
          config: {
            label: "Continuar",
            url: "no-sei-a-placa-2",
          },
        },
        {
          id: "ozp5o6f21",
          type: "TITLE",
          order: 3,
          config: {
            text: "New Title",
            size: "lg",
          },
        },
        {
          id: "vdm3fyh33",
          type: "TITLE",
          order: 4,
          config: {
            text: "New Title",
            size: "lg",
          },
        },
        {
          id: "n66334auu",
          type: "TITLE",
          order: 5,
          config: {
            text: "New Title",
            size: "lg",
          },
        },
      ],
      backStepSlug: "placa",
    },
    {
      id: "akffsvtjk",
      name: "Não-sei-a-placa-2",
      slug: "no-sei-a-placa-2",
      order: 3,
      elements: [
        {
          id: "7wcdnqckr",
          type: "TITLE",
          order: 0,
          config: {
            text: "Sobre o seu veículo",
            size: "lg",
          },
        },
        {
          id: "cr474wsg2",
          type: "RADIO",
          order: 1,
          config: {
            label: "Já sabe qual modelo quer financiar?",
            required: false,
            options: [
              { label: "Sim", value: "sim" },
              { label: "Não", value: "nao" },
            ],
            name: "field_radio_cr474w",
          },
        },
        {
          id: "zlgwa99wv",
          type: "SELECT",
          order: 2,
          config: {
            label: "Ano de fabricação",
            required: false,
            options: [{ label: "2010", value: "2011" }],
            name: "field_select_zlgwa9",
          },
        },
        {
          id: "k6z6h2z2v",
          type: "CHECKBOX",
          order: 3,
          config: {
            label: "Veículo 0km",
            required: false,
            name: "field_checkbox_k6z6h2",
          },
        },
        {
          id: "cqx68zvym",
          type: "SELECT",
          order: 4,
          config: {
            label: "Marca",
            required: false,
            options: [{ label: "Fiat", value: "Audi" }],
            name: "field_select_cqx68z",
          },
        },
        {
          id: "ua0kpj547",
          type: "TEXT_INPUT",
          order: 5,
          config: {
            label: "Modelo",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_ua0kpj",
          },
        },
        {
          id: "5p5ecz8ly",
          type: "NAVIGATION",
          order: 6,
          config: {
            label: "Continuar",
            url: "simulacao",
          },
        },
      ],
      backStepSlug: "placa",
    },
    {
      id: "72lehx3bk",
      name: "Não-sei-a-placa-3",
      slug: "no-sei-a-placa-3",
      order: 4,
      elements: [
        {
          id: "w18dinlxj",
          type: "TITLE",
          order: 0,
          config: {
            text: "Sobre o seu veículo",
            size: "lg",
          },
        },
        {
          id: "tnhvsjnfc",
          type: "RADIO",
          order: 1,
          config: {
            label: "Já sabe qual modelo quer financiar?",
            required: false,
            options: [
              { label: "Sim", value: "sim" },
              { label: "Não", value: "nao" },
            ],
            name: "field_radio_tnhvsj",
          },
        },
        {
          id: "lsyeq3prk",
          type: "TEXT_INPUT",
          order: 2,
          config: {
            label: "Valor do veículo",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_lsyeq3",
          },
        },
        {
          id: "5igulcjxu",
          type: "NAVIGATION",
          order: 3,
          config: {
            label: "Continuar",
            url: "simulacao",
          },
        },
      ],
      backStepSlug: "placa",
    },
    {
      id: "gd6u6x4ng",
      name: "Simulacao",
      slug: "simulacao",
      order: 5,
      elements: [
        {
          id: "yqwh9wzha",
          type: "TITLE",
          order: 0,
          config: {
            text: "Vamos simular o financiamento",
            size: "lg",
          },
        },
        {
          id: "38e8vyat2",
          type: "NAVIGATION",
          order: 1,
          config: {
            label: "Continuar",
            url: "dados-pessoais",
          },
        },
      ],
      backStepSlug: "placa",
    },
    {
      id: "zmxolj9hu",
      name: "Dados pessoais",
      slug: "dados-pessoais",
      order: 6,
      elements: [
        {
          id: "7cddacyhu",
          type: "TITLE",
          order: 0,
          config: {
            text: "Agora, seus dados pessoais",
            size: "lg",
          },
        },
        {
          id: "2g9tedwuz",
          type: "TEXT_INPUT",
          order: 1,
          config: {
            label: "Nome completo",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_2g9ted",
          },
        },
        {
          id: "pz2dxgesj",
          type: "CHECKBOX",
          order: 2,
          config: {
            label: "Tenho nome social",
            required: false,
            name: "field_checkbox_pz2dxg",
          },
        },
        {
          id: "wvxkfxb4m",
          type: "TEXT_INPUT",
          order: 3,
          config: {
            label: "Nome da mãe",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_wvxkfx",
          },
        },
        {
          id: "nr5jrcipr",
          type: "TEXT_INPUT",
          order: 4,
          config: {
            label: "Data de nascimento",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_nr5jrc",
          },
        },
        {
          id: "r36prbsli",
          type: "TEXT_INPUT",
          order: 5,
          config: {
            label: "E-mail",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_r36prb",
          },
        },
        {
          id: "eqxgob3lm",
          type: "SELECT",
          order: 6,
          config: {
            label: "Ocupação",
            required: false,
            options: [{ label: "Eng. Software", value: "Eng. Eletrico" }],
            name: "field_select_eqxgob",
          },
        },
        {
          id: "4pzx7559p",
          type: "TEXT_INPUT",
          order: 7,
          config: {
            label: "Renda",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_4pzx75",
          },
        },
        {
          id: "u4pww1hbz",
          type: "NAVIGATION",
          order: 8,
          config: {
            label: "Continuar",
            url: "cep",
          },
        },
      ],
      backStepSlug: "simulacao",
    },
    {
      id: "astgoyat0",
      name: "Cep",
      slug: "cep",
      order: 7,
      elements: [
        {
          id: "cybddrgzb",
          type: "TITLE",
          order: 0,
          config: {
            text: "Qual é o seu endereço?",
            size: "lg",
          },
        },
        {
          id: "29t2s4p5j",
          type: "TEXT_INPUT",
          order: 1,
          config: {
            label: "CEP",
            placeholder: "Enter text...",
            required: false,
            name: "field_text-input_29t2s4",
          },
        },
        {
          id: "bnet3855j",
          type: "NAVIGATION",
          order: 2,
          config: {
            label: "Continuar",
            url: "resumo",
          },
        },
      ],
      backStepSlug: "dados-pessoais",
    },
    {
      id: "f8bbx97d4",
      name: "Resumo",
      slug: "resumo",
      order: 8,
      elements: [
        {
          id: "zcnw1jz6o",
          type: "TITLE",
          order: 0,
          config: {
            text: "Resumo da simulação",
            size: "lg",
          },
        },
        {
          id: "berkxkkj9",
          type: "NAVIGATION",
          order: 1,
          config: {
            label: "Continuar",
            url: "proposta",
          },
        },
      ],
      backStepSlug: "cep",
    },
    {
      id: "ewmmswykb",
      name: "proposta",
      slug: "proposta",
      order: 9,
      elements: [
        {
          id: "re1adqw54",
          type: "TITLE",
          order: 0,
          config: {
            text: "Proposta enviada",
            size: "lg",
          },
        },
      ],
      backStepSlug: "resumo",
    },
  ],
  createdAt: "2026-02-03T19:58:24.609Z",
  updatedAt: "2026-03-11T16:19:26.057Z",
});
