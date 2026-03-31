# Dynamic Journey — Arquitetura em baixo nível

Documento focado em **como** o sistema funciona internamente: ciclos de render, cadeia de efeitos, fluxo de dados entre funções e decisões de implementação.

---

## 1. URL como fonte de verdade do step atual

O step ativo **não** é armazenado no store. A URL do browser é a fonte de verdade.

```
window.location.pathname
        ↓
useCurrentPathname()   ← hook reativo
        ↓
useJourneySteps()      ← deriva stepSlug do pathname
        ↓
currentStep            ← objeto completo do step
```

### `useCurrentPathname`

```ts
useState(() => window.location.pathname)   // snapshot inicial

useEffect(() => {
  window.addEventListener("popstate", sync)       // botão voltar/avançar
  window.addEventListener("app:navigate", sync)   // pushState manual
})
```

O evento `"app:navigate"` é despachado por `dispatchNavigate()` **após cada `pushState`** em `redirectTo`. Sem ele, `pushState` não dispara nenhum evento nativo e o hook nunca saberia que a URL mudou.

### Derivação do slug em `useJourneySteps`

```ts
const pathname = useCurrentPathname()

const slugFromPath =
  pathname === "/"
    ? ""                                            // raiz → usa primeiro step
    : pathname.replace(/^\//, "").split("/")[0]    // "/cpf/extra" → "cpf"

const stepSlug =
  slugFromPath && stepSlugToIndex.has(slugFromPath)
    ? slugFromPath
    : steps[0]?.slug ?? ""   // fallback para step inicial se slug desconhecido
```

Nenhum `useEffect` sincroniza o step — ele é sempre derivado na renderização.

---

## 2. Composição de hooks e dependências

```
useJourneyController(journey)
  │
  ├─ useJourneySteps(journey)
  │    └─ useCurrentPathname()        ← lê window.location.pathname
  │    └─ useJourneyStore()           ← lê: mergeBusiness
  │    └─ useEffect(syncBusiness)     ← escreve business no store
  │
  ├─ useJourneyForm(journey, currentStep)
  │    └─ useJourneyStore()           ← lê: services / mergeFields
  │    └─ useForm(zodResolver)        ← inicializa com snapshot do store
  │    └─ useEffect(applyPrefill)     ← escreve campos via setValue + mergeFields
  │
  └─ useJourneyNavigation({ ...steps, ...form })
       └─ useJourneyStore()           ← lê: business, services / escreve: mergeFields, setError, mergeServices
       └─ useState(submitted)
```

`useJourneyController` não tem lógica própria — apenas compõe os três hooks e achata o resultado em um objeto plano para o `JourneyRunner`.

---

## 3. Inicialização do formulário

```ts
useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: useRef(journeyStore.getState().fields).current,
  mode: "onChange",
  reValidateMode: "onChange",
})
```

**`useRef(...).current`** garante que o snapshot do store é lido **uma única vez** na montagem do componente, sem criar dependência reativa. Se o usuário recarregar a página e o store for persistido, os campos são restaurados automaticamente.

O `schema` Zod passado ao `zodResolver` é reconstruído a cada render (sem memo), mas o `useForm` só usa o resolver no momento da validação — não reinicializa o formulário.

---

## 4. `canProceed`: validação síncrona em tempo real

```ts
const watchedValues = watch()   // subscreveu todos os campos no RHF

function canProceed(): boolean {
  if (!currentStep || currentStepFields.length === 0) return true

  const result = schema.safeParse(watchedValues)   // valida o form inteiro
  if (result.success) return true

  const errorFields = new Set(result.error.issues.map(i => i.path[0]))
  return !currentStepFields.some(field => errorFields.has(field))
  //      └── só bloqueia se algum campo DO step atual tiver erro
}
```

Ponto importante: `safeParse` roda **no render**, não em um efeito. Isso significa que `canProceed` é recalculado a cada keystroke (porque `watch()` causa re-render a cada mudança). É o mecanismo que habilita/desabilita o botão de navegação em tempo real.

Campos de steps futuros que estejam inválidos **não bloqueiam** o step atual.

---

## 5. Ciclo de re-render numa mudança de step

Sequência exata após `redirectTo("placa")`:

```
1. window.history.pushState(null, "", "/placa")
2. dispatchNavigate()
        ↓
3. useCurrentPathname ouve "app:navigate"
   → setPathname("/placa")                       ← dispara re-render
        ↓
4. useJourneySteps re-executa
   → slugFromPath = "placa"
   → currentStep = steps[stepSlugToIndex.get("placa")]  ← novo objeto
        ↓
5. useJourneyForm re-executa com novo currentStep
   → currentStepFields = stepFields[currentStep.id]
   → canProceed() reavaliado para os campos do novo step
        ↓
6. useEffect(applyPrefill) é agendado
   → dependência [currentStep] mudou
   → executa na próxima microtask após o commit
        ↓
7. applyPrefill() executa
   → computePrefillValues(currentStep.elements, getValues(), services)
   → para cada campo com defaultValueFrom:
       setValue(campo, valor, { shouldValidate: true })  ← atualiza RHF
       mergeFields({ campo: valor })                      ← persiste no store
        ↓
8. setValue dispara re-render do RHF
   → watch() retorna valores atualizados
   → canProceed() é recalculado novamente
```

---

## 6. `validateCurrentStep`: validação imperativa no `goNext`

```ts
async function validateCurrentStep(): Promise<boolean> {
  // sem step ou sem campos = step de apresentação, sempre pode avançar
  if (!currentStep || currentStepFields.length === 0) return true

  const ok = await trigger(currentStepFields)   // força validação RHF nos campos do step
  if (!ok) {
    const fieldErrors: Record<string, string> = {}
    for (const field of currentStepFields) {
      const message = getFieldState(field).error?.message
      if (message) fieldErrors[field] = message
    }
    setError(fieldErrors)   // persiste no store → exibe na UI
    return false
  }

  setError({})
  mergeFields(getValues())   // snapshot dos valores antes de navegar
  return true
}
```

`trigger` é **async** porque dispara validação assíncrona do Zod (que pode envolver `refine` com promises). O `await` é necessário mesmo que o schema atual seja síncrono.

Duas camadas de validação de campos coexistem:
- `canProceed()` — síncrona, contínua, usada para UI (habilitar/desabilitar botão)
- `validateCurrentStep()` — imperativa, disparada só no clique, usada para bloquear navegação e exibir mensagens de erro

---

## 7. Store: o que entra, o que sai

```
                    ┌─────────────────────────────────┐
                    │         journeyStore             │
                    │                                  │
  mergeFields() ──▶ │  fields: Record<string, unknown> │──▶ useJourneyForm (defaultValues)
                    │                                  │
    setError()  ──▶ │  error:  Record<string, unknown> │──▶ useJourneyController (storedErrorEntries)
                    │                                  │
 mergeBusiness() ──▶│  business: Record<...>           │──▶ useJourneyNavigation (base_url)
                    │                                  │    ElementRenderContext (business)
 mergeServices() ──▶│  services: Record<...>           │──▶ useJourneyForm (prefill)
                    │                                  │    useJourneyNavigation (submitted payload)
                    └─────────────────────────────────┘
```

**`fields`** é o único slice com dupla via de escrita:
- `useJourneyNavigation.validateCurrentStep` → `mergeFields(getValues())` — snapshot antes de avançar
- `useJourneyNavigation.goPrev` → `mergeFields(getValues())` — snapshot antes de voltar
- `useJourneyNavigation.goNext` (submit final) → `mergeFields(values)` — snapshot no submit
- `useJourneyForm.applyPrefill` → `mergeFields(prefill)` — valores preenchidos automaticamente

**`services`** é somente append: `mergeServices({ [serviceName]: result })`. Cada chamada de serviço acumula seu resultado por nome, nunca sobrescreve outros serviços.

---

## 8. Fluxo completo: SERVICE_CALL com sucesso

```
[clique em "Enviar"]
        ↓
ServiceCallElement.onClick
  → onCall("eligibility", "placa")
  → goNext({ type: "service", serviceName: "eligibility", targetSlug: "placa" })
        ↓
validateCurrentStep()
  → trigger(["field_cpf"])          ← RHF valida só os campos do step atual
  → ok = true
  → setError({})
  → mergeFields({ field_cpf: "123.456.789-09" })
        ↓
callService("eligibility", { serviceName, fields, business })
  → handlers["eligibility"](input)  ← executa handler registrado
  → retorna { success: true, data: { ... } }
        ↓
mergeServices({ eligibility: { success: true, data: { ... } } })
        ↓
redirectTo("placa")
  → joinPaths(base_url, "placa")    ← monta URL com base_url se existir
  → pushState(null, "", "/placa")
  → dispatchNavigate()              ← notifica useCurrentPathname
        ↓
[re-render — ver seção 5]
```

---

## 9. `redirectTo`: lógica de roteamento

```ts
function redirectTo(urlOrSlug: string) {
  const baseUrl = (business.base_url as string) ?? ""
  const fullUrl = baseUrl ? joinPaths(baseUrl, urlOrSlug) : urlOrSlug

  if (/^https?:\/\//i.test(fullUrl)) {
    const target = new URL(fullUrl)
    if (target.origin !== window.location.origin) {
      window.location.href = fullUrl    // saída do app (domínio externo)
      return
    }
    // mesmo domínio com protocolo explícito
    window.history.pushState(null, "", target.pathname + target.search)
    // ⚠ dispatchNavigate() NÃO é chamado aqui — bug latente
    return
  }

  const path = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`
  window.history.pushState(null, "", path)
  dispatchNavigate()   // notifica useCurrentPathname
}
```

> **Nota:** quando a URL é absoluta (`https://...`) mas do mesmo domínio, `dispatchNavigate()` não é chamado. É um caso raro na prática (o `base_url` normalmente é um path relativo), mas `useCurrentPathname` não seria notificado nesses casos.

---

## 10. `goPrev`: navegação para trás

```ts
function goPrev() {
  if (!currentStep?.backStepSlug) return   // step sem volta configurada = sem-op

  mergeFields(getValues())   // salva estado atual antes de sair

  if (backStepSlug === "/") {
    redirectTo("/")   // "/" → useJourneySteps faz fallback para steps[0]
    return
  }
  redirectTo(backStepSlug)
}
```

`backStepSlug === "/"` é a convenção para "volta para o início sem step explícito". `useJourneySteps` trata `"/"` como fallback para `steps[0]`, então funciona sem precisar conhecer o slug do primeiro step.

---

## 11. `syncBusiness`: efeito de metadados

Em `useJourneySteps`, a cada mudança de step um efeito persiste metadados no slice `business` do store:

```ts
function syncBusiness() {
  mergeBusiness({
    journeyId: journey.id,
    journeySlug: journey.slug,
    stepSlug: currentStep?.slug ?? "",
  })
}

useEffect(syncBusiness, [journey.id, journey.slug, currentStep?.slug, mergeBusiness])
```

Isso garante que `business` sempre reflita o step atual. O `stepSlug` em `business` é lido por `goNext` ao montar o payload enviado para serviços — portanto os handlers recebem o step correto mesmo sem acesso direto ao `currentStep`.

---

## 12. `buildJourneyFormSchema`: construção do schema de validação

Chamada a cada render de `useJourneyForm`. Percorre todos os steps e elementos e constrói dois artefatos:

```
buildJourneyFormSchema(journey)
  └─ para cada step
       └─ para cada element
            ├─ TEXT_INPUT / RADIO / SELECT → required ? requiredString() : optionalString()
            ├─ CPF_INPUT                   → cpfString(required)
            └─ CHECKBOX                    → required ? requiredTrueBoolean() : optionalBoolean()
            (TITLE, PARAGRAPH, NAVIGATION, SERVICE_CALL → ignorados, sem campo no schema)
  └─ retorna { schema: ZodObject, stepFields: Record<stepId, string[]> }
```

**`stepFields`** mapeia `stepId → [nomes dos campos do step]`. É usado em dois pontos críticos:

- `useJourneyForm` → `currentStepFields = stepFields[currentStep.id]` → passado para `trigger()` e `canProceed()`
- `validateCurrentStep()` → valida **apenas** os campos do step atual, não o formulário inteiro

**Validadores individuais:**

| Função | Comportamento |
|---|---|
| `requiredString()` | `z.string().min(1, "Obrigatório")` |
| `optionalString()` | preprocessa whitespace para `undefined`, permite ausência |
| `cpfString(true)` | remove não-dígitos, valida comprimento 11 |
| `cpfString(false)` | retorna `undefined` para string vazia, valida só se preenchido |
| `requiredTrueBoolean()` | `z.literal(true, { message: "Obrigatório" })` |
| `optionalBoolean()` | `z.boolean().optional()` |

---

## 13. Prefill: cadeia completa

O prefill preenche campos automaticamente quando o usuário entra em um step, usando valores de serviços já chamados ou valores fixos do JSON.

```
applyPrefill()  ← useEffect, executa quando currentStep muda
  ↓
computePrefillValues(elements, getValues(), services)
  │
  └─ para cada element do tipo TEXT_INPUT ou CPF_INPUT:
       │
       ├─ isFieldFilled(getValues()[name]) ?
       │     └─ sim → pula (não sobrescreve campo já preenchido pelo usuário)
       │
       └─ resolveDefaultValue(element.config, services)
             ├─ config.defaultValue ?  → retorna String(defaultValue)  (valor fixo do JSON)
             └─ config.defaultValueFrom ?
                  → getByPath(services[from.service], from.path)
                     └─ navega objeto com dot-notation: "data.input.fields.nome"
                     └─ retorna undefined silenciosamente se path não existe
  ↓
para cada campo no objeto de prefill:
  setValue(campo, valor, { shouldValidate: true, shouldDirty: false })  ← atualiza RHF
  mergeFields({ campo: valor })                                          ← persiste no store
```

**Regras de prioridade:**
1. Campo já preenchido → prefill é ignorado (`isFieldFilled` retorna `true` para qualquer valor não-`null`/`undefined`/`""`)
2. `defaultValue` (string fixa) tem precedência sobre `defaultValueFrom` (serviço)
3. Se `defaultValueFrom.service` ainda não foi chamado, `services[service]` é `undefined` e `getByPath` retorna `undefined` silenciosamente — o campo fica vazio sem erro

**Tipos que NÃO suportam prefill:** `RADIO`, `SELECT`, `CHECKBOX`, `TITLE`, `PARAGRAPH`, `NAVIGATION`, `SERVICE_CALL`. Apenas `TEXT_INPUT` e `CPF_INPUT` são processados em `computePrefillValues`.

---

## 14. `callService`: registro e execução de serviços

```ts
type ServiceResult =
  | { success: true; data: unknown }
  | { success: false; error: string; data?: unknown }

const handlers: Record<string, ServiceHandler> = { eligibility }

function callService(serviceName: string, input: unknown): Promise<ServiceResult> {
  const handler = handlers[serviceName]
  if (!handler) return { success: false, error: `Serviço não registrado: ${serviceName}` }
  return handler(input)
}
```

O input recebido por cada handler é sempre `{ serviceName, fields, business }` — montado em `goNext` antes de chamar `callService`. O resultado é armazenado em `services[serviceName]` e fica disponível para prefill em steps futuros via `defaultValueFrom`.

Para registrar um novo serviço basta adicionar o handler no objeto `handlers` — não há autoregistro nem injeção de dependência.
