# Como consumir valores vindos de endpoints (SERVICE_CALL)

Este guia descreve o ciclo completo: desde a chamada ao serviço até o uso dos dados retornados em campos de steps subsequentes.

---

## Visão geral do fluxo

```
Step N  →  SERVICE_CALL (botão)
              │
              ▼
        callService(name, payload)          ← serviceRegistry.ts
              │
              ▼
        result armazenado no store          ← services[serviceName]
              │
              ▼
Step N+1 →  defaultValueFrom               ← config do elemento
              │
              ▼
        getByPath(services[name], path)     ← utils/getByPath.ts
              │
              ▼
        setValue(fieldName, value)          ← React Hook Form
```

---

## 1. Declarar o SERVICE_CALL no step

O elemento `SERVICE_CALL` é um botão que dispara a chamada ao serviço. Ele bloqueia automaticamente enquanto os campos obrigatórios do step atual não forem válidos (`canProceed`).

```ts
{
  id: "btn-consulta",
  type: "SERVICE_CALL",
  order: 4,
  config: {
    label: "Consultar elegibilidade",   // texto do botão
    service: "eligibility",             // nome do serviço registrado
    targetStepOnSuccess: "resultado",   // slug do próximo step (em caso de sucesso)
  },
}
```

**Propriedades obrigatórias:**

| Campo                 | Tipo     | Descrição                                         |
|-----------------------|----------|---------------------------------------------------|
| `service`             | `string` | Chave do handler em `serviceRegistry.ts`          |
| `targetStepOnSuccess` | `string` | Slug do step para onde navegar em caso de sucesso |
| `label`               | `string` | Texto exibido no botão                            |

> Em caso de **falha**, o erro é armazenado em `store.error.service` e a navegação não acontece.

---

## 2. O que é enviado ao serviço

Quando o usuário clica no botão, o hook `useJourneyNavigation` chama:

```ts
// src/hooks/useJourneyNavigation.ts
const result = await callService(options.serviceName, {
  serviceName: options.serviceName,
  fields: getValues(),     // todos os campos do formulário naquele momento
  business: business,      // contexto da jornada (journeyId, stepSlug, base_url, etc.)
});
```

O **payload recebido pelo handler** tem esta estrutura:

```ts
{
  serviceName: "eligibility",
  fields: {
    "field_cpf-input_ident01": "123.456.789-00",
    "field_text-input_nome01": "João Silva",
    // ... todos os campos preenchidos até ali
  },
  business: {
    journeyId: "consulta-credito-001",
    journeySlug: "consulta-de-credito",
    stepSlug: "identificacao",
    // ...
  },
}
```

---

## 3. O que o serviço deve retornar

O tipo de retorno é `ServiceResult`:

```ts
// src/services/serviceRegistry.ts
type ServiceResult =
  | { success: true; data: unknown }
  | { success: false; error: string; data?: unknown }
```

**Sucesso:** navegação acontece para `targetStepOnSuccess`.  
**Falha:** `store.error.service` recebe a mensagem de erro, sem navegação.

Exemplo de handler:

```ts
const eligibility: ServiceHandler = async (input: unknown) => {
  return {
    success: true,
    data: {
      eligible: true,
      creditScore: 750,
      input,           // ecoa o payload de entrada completo
    },
  };
};
```

> A propriedade `input` dentro de `data` é o próprio payload enviado. Isso permite ler de volta qualquer campo do formulário via `defaultValueFrom`.

---

## 4. Onde o resultado fica armazenado

O resultado é salvo no Zustand store (persistido no `sessionStorage`):

```
store.services["eligibility"] = {
  success: true,
  data: {
    eligible: true,
    creditScore: 750,
    input: {
      serviceName: "eligibility",
      fields: { "field_cpf-input_ident01": "123.456.789-00", ... },
      business: { ... },
    },
  },
}
```

---

## 5. Consumir o valor em outro step com `defaultValueFrom`

Qualquer campo `TEXT_INPUT` ou `CPF_INPUT` pode declarar `defaultValueFrom` para ser preenchido automaticamente com um valor do resultado do serviço.

```ts
{
  id: "cpf-resultado",
  type: "TEXT_INPUT",
  order: 2,
  config: {
    label: "CPF verificado",
    required: false,
    name: "field_text-input_cpf-resultado",
    defaultValueFrom: {
      service: "eligibility",   // mesmo nome usado no SERVICE_CALL
      path: "data.input.fields.field_cpf-input_ident01",
    },
  },
}
```

**Propriedades de `defaultValueFrom`:**

| Campo     | Tipo     | Descrição                                              |
|-----------|----------|--------------------------------------------------------|
| `service` | `string` | Nome do serviço cujo resultado será lido               |
| `path`    | `string` | Caminho dot-notation dentro de `store.services[name]`  |

> O preenchimento só acontece se o campo **ainda não tiver valor** (o usuário não preencheu manualmente). Isso evita sobrescrever edições do usuário.

---

## 6. Sintaxe do `path` (dot-notation)

O utilitário `getByPath` navega objeto a objeto separado por `.`:

```
store.services["eligibility"]
│
├── success → path: "success"
│
└── data
    ├── eligible → path: "data.eligible"
    ├── creditScore → path: "data.creditScore"
    └── input
        ├── serviceName → path: "data.input.serviceName"
        ├── fields
        │   ├── "field_cpf-input_ident01" → path: "data.input.fields.field_cpf-input_ident01"
        │   └── "field_text-input_nome01" → path: "data.input.fields.field_text-input_nome01"
        └── business
            └── journeyId → path: "data.input.business.journeyId"
```

**Exemplos práticos:**

| O que ler                        | `path`                                              |
|----------------------------------|-----------------------------------------------------|
| Campo CPF digitado pelo usuário  | `data.input.fields.field_cpf-input_ident01`         |
| Campo nome digitado pelo usuário | `data.input.fields.field_text-input_nome01`         |
| Score retornado pelo serviço     | `data.creditScore`                                  |
| Se é elegível                    | `data.eligible`                                     |
| ID da jornada (business context) | `data.input.business.journeyId`                     |

> **Dica:** o `path` é relativo ao objeto `store.services["nomeDosServico"]`, não ao `data` diretamente. Por isso sempre começa com `data.`.

---

## 7. Adicionar um novo serviço

Edite `src/services/serviceRegistry.ts`:

```ts
// 1. Implemente o handler
const meuServico: ServiceHandler = async (input: unknown) => {
  const payload = input as { fields: Record<string, unknown> };

  // Chame a API real ou retorne um mock
  const response = await fetch("/api/meu-servico", {
    method: "POST",
    body: JSON.stringify(payload.fields),
  });

  if (!response.ok) {
    return { success: false, error: "Falha na consulta" };
  }

  const data = await response.json();
  return { success: true, data: { ...data, input } };
};

// 2. Registre com uma chave
const handlers: Record<string, ServiceHandler> = {
  eligibility,
  meuServico,   // ← adicione aqui
};
```

No JSON da journey, use `service: "meuServico"` no `SERVICE_CALL`.

---

## 8. Limitações e comportamentos importantes

| Ponto                              | Detalhe                                                                 |
|------------------------------------|-------------------------------------------------------------------------|
| Tipos suportados por `defaultValueFrom` | Apenas `TEXT_INPUT` e `CPF_INPUT`                                  |
| Quando o prefill é aplicado        | Na montagem do step, via `useEffect` em `useJourneyForm.ts`             |
| Prioridade                         | `defaultValue` (valor fixo) tem prioridade sobre `defaultValueFrom`     |
| Campo já preenchido                | `defaultValueFrom` é ignorado se o campo já tiver valor no store        |
| Resultado persistido               | `store.services` é salvo no `sessionStorage` — sobrevive a refresh      |
| Falha silenciosa de path           | Se o path não existir no objeto, o campo simplesmente fica vazio        |
| Tipagem do valor                   | O valor é sempre convertido para `String()` antes de ser aplicado       |

---

## 9. Exemplo completo de journey

```
Step 1: identificacao
  ├── CPF_INPUT   (name: "field_cpf-input_ident01", required: true)
  ├── TEXT_INPUT  (name: "field_text-input_nome01", required: true)
  └── SERVICE_CALL
        service: "eligibility"
        targetStepOnSuccess: "resultado-consulta"

Step 2: resultado-consulta
  ├── TEXT_INPUT  (defaultValueFrom: "data.input.fields.field_cpf-input_ident01")
  ├── TEXT_INPUT  (defaultValueFrom: "data.input.fields.field_text-input_nome01")
  ├── TEXT_INPUT  (defaultValueFrom: "data.creditScore")
  └── NAVIGATION  → "confirmacao"

Step 3: confirmacao
  └── NAVIGATION  → "finalizado"
```

Arquivo de referência: `src/mock/consultaCreditoJourney.ts`
