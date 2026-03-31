# Dynamic Journey — Arquitetura e funcionamento completo

## Visão geral

O Dynamic Journey é um **runner de fluxos declarativos**. Uma jornada (journey) é descrita em JSON e o runner interpreta esse JSON para renderizar steps, coletar dados via formulário, validar campos e chamar serviços externos — tudo sem código novo para cada fluxo.

Fluxo de dados em alto nível:

```
JSON da jornada
      ↓
journeySchema.parse()        ← valida a estrutura do JSON
      ↓
JourneyRunner                ← componente de entrada
      ↓
useJourneyRunnerController   ← compõe todos os hooks
      ├── useJourneySteps    ← qual step está ativo
      ├── useJourneyForm     ← schema RHF, validação, prefill
      └── useJourneyNavigation ← goNext, goPrev, SERVICE_CALL
      ↓
renderJourneyElement         ← despacha element.type → componente
      ↓
ElementosTSX + Store Zustand
```

---

## 1. Entrada da aplicação

### `src/app/page.tsx`
Ponto de entrada Next.js. Importa `sampleJourney` (já parseada pelo Zod) e passa para `<JourneyRunner journey={sampleJourney} />`.

### `src/mock/sampleJourney.ts`
JSON de exemplo de uma jornada real de financiamento de veículos com 10 steps: CPF, Placa, Não sei a placa (x2), Simulação, Dados pessoais, CEP, Resumo e Proposta. É parseada via `journeySchema.parse({...})` na hora do import, então erros de estrutura explodem em build time.

---

## 2. Componente de orquestração

### `src/components/JourneyRunner.tsx`

Único componente "inteligente" da UI. Recebe `journey: JourneyDefinition` e delega toda a lógica para `useJourneyRunnerController`.

Responsabilidades de renderização:
- Exibe "Jornada sem steps" se não há step ativo
- Mostra contador de steps (`Step X de Y`) e barra de progresso (dots)
- Exibe caixa de erros de alto nível (`storedErrorEntries`) quando há falhas de serviço ou validação
- Itera `sortedElements` do step atual e chama `renderJourneyElement(element, ctx)` para cada um

O `ctx` (ElementRenderContext) passado para cada elemento contém: `register`, `control`, `errors`, `goNext`, `business`, `canProceed`.

---

## 3. Hooks

### `src/hooks/useJourneyRunnerController.ts`

Ponto de entrada dos hooks. Compõe `useJourneySteps`, `useJourneyForm` e `useJourneyNavigation` e retorna tudo que o `JourneyRunner` precisa num objeto plano.

Também calcula `storedErrorEntries`: filtra as entradas do `storedError` do store que tenham valor truthy, retornando `Array<[string, string]>` para renderizar a lista de erros na UI.

---

### `src/hooks/useJourneySteps.ts`

Gerencia qual step está ativo e expõe dados derivados da lista de steps.

**O que faz:**

| Variável | Descrição |
|---|---|
| `stepSlugToIndex` | `Map<slug, index>` construída a partir de `journey.steps` |
| `currentStep` | Step cujo slug bate com `stepSlug` do store; fallback para `steps[0]` |
| `currentStepIndex` | Índice numérico do step atual |
| `sortedElements` | `currentStep.elements` ou `[]` |
| `navigationElements` | Filtra `sortedElements` pelo type `NAVIGATION` |

**Efeitos:**

- `syncInitialStep()` — chamado quando `stepCount` ou `stepSlug` muda. Se o slug do store não existe no mapa, inicializa com `steps[0].slug`.
- `syncBusiness()` — chamado quando `journey.id`, `journey.slug` ou `currentStep.slug` mudam. Persiste `journeyId`, `journeySlug` e `stepSlug` atual no slice `business` do store.

---

### `src/hooks/useJourneyForm.ts`

Gerencia o formulário React Hook Form, a validação por step e o prefill de campos.

**Schema (`buildJourneyFormSchema`):**
Chamado diretamente (sem memo) a cada render, retorna `{ schema, stepFields }`:
- `schema`: Zod object flat com todos os campos de todos os steps da jornada
- `stepFields`: `Record<stepId, string[]>` — quais campos pertencem a cada step

**`currentStepFields`:**
Lista de campos do step atual, usada para saber quais campos validar no `goNext`.

**`canProceed`:**
Função calculada inline no `return`. Roda `schema.safeParse(watchedValues)` e verifica se algum dos erros retornados pertence a um campo do step atual. Se não houver erros nos campos do step, permite avançar.

**`applyPrefill` (useEffect):**
Executado quando `currentStep` muda. Chama `computePrefillValues` que:
1. Itera os elementos do step atual buscando `TEXT_INPUT` e `CPF_INPUT`
2. Para cada campo ainda não preenchido, tenta resolver um valor padrão via `defaultValue` (string fixa) ou `defaultValueFrom` (busca no resultado de um serviço)
3. Aplica os valores encontrados via `setValue` no RHF e persiste no store via `mergeFields`

**Funções auxiliares (fora do hook):**

- `isFieldFilled(value)` — retorna `true` se o valor não é `null`, `undefined` ou `""`
- `resolveDefaultValue(cfg, services)` — tenta retornar `cfg.defaultValue` ou navega pelo objeto `services[from.service]` usando o path `from.path`
- `computePrefillValues(elements, currentValues, services)` — monta o objeto de prefill a partir dos elementos do step

---

### `src/hooks/useJourneyNavigation.ts`

Gerencia toda a lógica de navegação entre steps e chamadas de serviço.

**`goToStepSlug(slug)`:**
Verifica se o slug existe no `stepSlugToIndex` antes de chamar `setStepSlug`. Proteção silenciosa contra slugs inválidos.

**`redirectTo(urlOrSlug)`:**
Atualiza a URL do browser sem recarregar a página:
- Se há `business.base_url`, monta a URL completa via `joinPaths`
- Se a URL começa com `http(s)://`: usa `new URL()` para parsear; se for origem diferente faz `window.location.href` (redirect externo); se for mesma origem usa `pushState`
- Se não é URL absoluta: normaliza o path e usa `pushState`

**`validateCurrentStep()`:**
Dispara `trigger(currentStepFields)` do RHF para forçar validação dos campos do step atual. Se inválido, coleta as mensagens de erro e persiste no store via `setError`. Se válido, limpa os erros e salva os valores via `setFields`.

**`goNext(options)`:**
Ponto central de avanço no fluxo. Sempre valida o step atual primeiro. Três modos:

| `options.type` | Comportamento |
|---|---|
| `"service"` | Chama `callService(serviceName, {fields, business})`, persiste resultado em `services`. Se `result.success === false` persiste o erro. Se sucesso, navega para `targetSlug`. |
| `"navigation"` | Navega diretamente para `targetSlug` sem chamar serviço. |
| `"next"` | Avança para `steps[currentStepIndex + 1]`. Se não há próximo step, chama `handleSubmit` do RHF e marca o fluxo como `submitted`. |

**`goPrev()`:**
Lê `currentStep.backStepSlug`. Se for `"/"` vai para o primeiro step e redireciona para `/`. Caso contrário navega para o slug de volta.

---

## 4. Store

### `src/store/journeyStore.ts`

Store Zustand com estado global do runner. Exporta `journeyStore` (a instância, usável fora de componentes com `journeyStore.getState()`).

| Slice | Tipo | Descrição |
|---|---|---|
| `stepSlug` | `string` | Slug do step atualmente ativo |
| `fields` | `Record<string, unknown>` | Todos os valores do formulário |
| `error` | `Record<string, unknown>` | Erros de alto nível (serviço, validação) |
| `business` | `Record<string, unknown>` | Metadados da jornada (journeyId, base_url, etc.) |
| `services` | `Record<string, unknown>` | Resultados de cada SERVICE_CALL por nome |

**Actions:**

| Action | O que faz |
|---|---|
| `setStepSlug(slug)` | Substitui `stepSlug` |
| `setFields(fields)` | Substitui `fields` inteiro |
| `mergeFields(partial)` | Merge parcial em `fields` |
| `setError(error)` | Substitui `error` inteiro |
| `mergeBusiness(partial)` | Merge parcial em `business` |
| `mergeServices(partial)` | Merge parcial em `services` |
| `reset()` | Zera todo o estado |

### `src/store/useJourneyStore.ts`

Hook wrapper que subscreve cada slice individualmente no Zustand. Isso garante que o componente só re-renderiza quando o slice que ele usa muda, evitando re-renders desnecessários.

---

## 5. Registry de elementos

### `src/components/elementRegistry.tsx`

Mapeia `element.type` para o componente React correspondente, passando apenas as props que cada tipo precisa.

**`ElementRenderContext`** — objeto de contexto passado pelo `JourneyRunner` para todos os elementos:
```ts
{
  register,    // UseFormRegister — para inputs não-Controller
  control,     // Control — para inputs Controller
  errors,      // FieldErrors — erros do RHF
  goNext,      // função de navegação/serviço
  business,    // metadados da jornada
  canProceed,  // se o step atual está válido para avançar
}
```

**`renderers`** — Record tipado onde cada key é um `element.type` e cada value é uma função `(element, ctx) => ReactNode`. Cada renderer já recebe o tipo específico do seu elemento (discriminated union está resolvida dentro do record). A função `renderJourneyElement` faz o lookup e chama o renderer.

**Mapa de props por tipo:**

| Tipo | Props passadas |
|---|---|
| `TITLE`, `PARAGRAPH` | apenas `element` |
| `TEXT_INPUT`, `CPF_INPUT` | `element` + `ctx.control` |
| `RADIO`, `SELECT`, `CHECKBOX` | `element` + `ctx.register` + `ctx.errors` |
| `SERVICE_CALL` | `element` + `ctx.canProceed` + `onCall` (derivado de `ctx.goNext`) |
| `NAVIGATION` | `element` + `onNavigate` (derivado de `ctx.goNext`) + `ctx.business` + `ctx.canProceed` |

---

## 6. Elementos da jornada

Cada elemento é um adapter entre o schema JSON e o componente de UI base.

### `TextInputElement` / `CpfInputElement`
Usa `<Controller>` do RHF para integrar com o `control`. Lê `element.config.ui` para repassar props visuais ao `<Input>` base.

### `RadioElement` / `SelectElement` / `CheckboxElement`
Usa `register(name)` do RHF (sem Controller). Lê `errors[name]?.message` para exibir mensagem de erro.

### `NavigationElement`
Renderiza um `<Link>`. Calcula `href` via `joinPaths(baseUrl, url)`. Lógica de disable:
- `hardDisabled`: `ui.disabled === true` no JSON
- `blocked`: `!canProceed` (step atual com campos inválidos)
- O `variant` vira `"disabled"` automaticamente se `blocked`
- `onClick` chama `onNavigate(url)` que dispara `goNext({ type: "navigation", targetSlug: url })`

### `ServiceCallElement`
Renderiza um `<Button>`. Mesma lógica de disable do `NavigationElement`. `onClick` chama `onCall(service, targetStepOnSuccess)` que dispara `goNext({ type: "service", ... })`.

### `TitleElement` / `ParagraphElement`
Elementos puramente visuais. Renderizam componentes de tipografia a partir de `element.config`.

---

## 7. Validação

### Validação estrutural do JSON (`src/validation/schemaValidation/`)

Valida o shape do JSON antes de executar a jornada. Hierarquia:

```
journeySchema
  └── journeyStepSchema[]
        └── journeyElementSchema (discriminatedUnion por "type")
              ├── titleElementSchema
              ├── paragraphElementSchema
              ├── textInputElementSchema   ← usa defaultValueFromSchema + inputUiSchema
              ├── cpfInputElementSchema
              ├── radioElementSchema
              ├── selectElementSchema
              ├── checkboxElementSchema
              ├── serviceCallElementSchema ← usa buttonUiSchema
              └── navigationElementSchema  ← usa linkUiSchema
```

Todos os schemas de elemento estendem `baseElementSchema` (`id`, `type`, `order`).

**`defaultValueFromSchema`** — schema opcional `{ service: string, path: string }` usado por `TEXT_INPUT` e `CPF_INPUT` para prefill a partir de serviços.

**`elementUiSchemas`** — schemas de UI por tipo de componente base:
- `inputUiSchema`: `variant`, `width`, `disabled`, `autoFocus`, `helperText`, `className`
- `buttonUiSchema`: `size`, `styles`, `width`, `variant`, `disabled`, `className`
- `linkUiSchema`: igual ao button, com variantes diferentes
- `typographyUiSchema`: `as`, `variant`, `color`, `weight`, `fontStyle`, `className`

### Validação do formulário (`src/validation/validations/`)

**`buildJourneyFormSchema(journey)`** — percorre todos os steps e elementos da jornada e constrói dinamicamente um Zod object flat:

| Tipo de elemento | Campo obrigatório | Campo opcional |
|---|---|---|
| `TEXT_INPUT`, `RADIO`, `SELECT` | `requiredString()` | `optionalString()` |
| `CPF_INPUT` | `cpfString(true)` | `cpfString(false)` |
| `CHECKBOX` | `requiredTrueBoolean()` | `optionalBoolean()` |

Retorna `{ schema, stepFields }` onde `stepFields` é `Record<stepId, string[]>`.

**Validadores individuais:**
- `requiredString()` — string não vazia com mensagem de erro em PT-BR
- `optionalString()` — string ou undefined, sem validação
- `cpfString(required)` — valida formato e dígitos verificadores do CPF
- `requiredTrueBoolean()` — boolean que deve ser `true` (aceite de termos, etc.)
- `optionalBoolean()` — boolean ou undefined

---

## 8. Serviços

### `src/services/serviceRegistry.ts`

Registry simples de handlers assíncronos. Cada handler recebe `input: unknown` e retorna `ServiceResult`:

```ts
type ServiceResult =
  | { success: true; data: unknown }
  | { success: false; error: string; data?: unknown }
```

**`callService(serviceName, input)`** — busca o handler no record `handlers`. Se não encontrar, retorna `{ success: false, error: "Serviço não registrado: ..." }`.

**Adicionando um novo serviço:**
```ts
const meuServico: ServiceHandler = async (input) => {
  // chamar API, processar, retornar
  return { success: true, data: { ... } };
};

const handlers = { eligibility, meuServico };
```

O `input` recebido pelo handler é `{ serviceName, fields, business }` (montado no `goNext` do `useJourneyNavigation`).

---

## 9. Utilitários

### `src/utils/joinPaths.ts`

`joinPaths(base, path)` — concatena dois segmentos de URL/path normalizando barras:
- Remove barras finais do `base` e barras iniciais do `path`
- Se `base` vazio: retorna `/${path}` ou `"/"`
- Se `path` vazio: retorna `base`
- Caso geral: `${base}/${path}`

### `src/utils/getByPath.ts`

`getByPath(value, path)` — acessa um valor aninhado num objeto usando notação de pontos (`"data.input.fields.cpf"`). Retorna `undefined` se qualquer nível for `null`/`undefined` ou não for objeto.

Usado pelo `resolveDefaultValue` no `useJourneyForm` para extrair valores de resultados de serviços.

---

## 10. Como adicionar um novo tipo de elemento

1. **Schema estrutural** — criar `src/validation/schemaValidation/*ElementSchema.ts` estendendo `baseElementSchema`, registrar no `discriminatedUnion` em `journeyElementSchema.ts`

2. **Schema de formulário** — se o elemento cria um field, adicionar o `if (element.type === "MEU_TIPO")` em `buildJourneyFormSchema.ts`

3. **Componente** — criar `src/components/elements/*Element.tsx` recebendo as props necessárias

4. **Registry** — adicionar uma entrada em `renderers` no `elementRegistry.tsx` passando apenas as props que o componente precisa do `ctx`

---

## 11. Fluxo completo de uma navegação com serviço

```
Usuário clica em "Enviar" (SERVICE_CALL)
  ↓
ServiceCallElement.onClick
  → onCall("eligibility", "placa")
    ↓
useJourneyNavigation.goNext({ type: "service", serviceName: "eligibility", targetSlug: "placa" })
  ↓
validateCurrentStep()
  → trigger(currentStepFields)          ← RHF valida os campos do step
  → se inválido: setError(fieldErrors)  ← persiste erros no store, return false
  → se válido: setFields(getValues())   ← persiste valores no store, return true
  ↓
callService("eligibility", { fields, business })
  → handlers["eligibility"](input)     ← executa o handler registrado
  → mergeServices({ eligibility: result })  ← persiste resultado no store
  ↓
se result.success === false:
  → setError({ service: result.error })  ← exibe erro na UI
se result.success === true:
  → setStepSlug("placa")               ← atualiza o step no store
  → redirectTo("placa")                ← atualiza a URL do browser
    ↓
useJourneySteps re-renderiza com o novo stepSlug
  → currentStep muda para "Placa"
    ↓
useJourneyForm.applyPrefill() executa
  → lê defaultValueFrom dos elementos do step "Placa"
  → busca services["eligibility"].data.input.fields.field_cpf-input_m7oqd4
  → setValue no campo "field_text-input_q45tjl"  ← preenche o campo automaticamente
```
