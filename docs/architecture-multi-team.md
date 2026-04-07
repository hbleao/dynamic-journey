# Dynamic Journey — Arquitetura Multi-time (Plugin Registry + Monorepo)

## O Problema

O `elementRegistry.tsx` hoje é um mapa **estático**. Para adicionar qualquer novo tipo de campo — seja uma placa de carro, um campo de RENAVAM, uma busca de cidades — alguém precisa editar esse arquivo, importar o novo componente e registrá-lo no objeto `renderers`.

Isso cria um problema sério quando múltiplos times precisam adicionar seus próprios campos:

```
time de auto    → quer adicionar PLACA_INPUT, RENAVAM_INPUT
time de viagem  → quer adicionar CIDADE_SEARCH, PAIS_SEARCH
time de reside  → quer adicionar VALOR_IMOVEL
time de petlove → quer adicionar TIPO_PET_SELECT
```

Se todos editam o mesmo `elementRegistry.tsx` no mesmo projeto:
- Conflitos de merge frequentes
- Um deploy bloqueado de um time bloqueia todos os outros
- Um bug de um time derruba a jornada de outro time
- Testes de cada time dependem do código de todos os outros

A solução tem dois pilares que se complementam.

---

## Pillar 1 — Registry Dinâmico (Plugin System)

### O que muda no elementRegistry

O objeto `renderers` estático vira um `Map` dinâmico com uma API pública de registro:

```ts
// packages/core/src/elementRegistry.ts (ANTES)
const renderers = {
  TITLE: (element) => <TitleElement element={element} />,
  CPF_INPUT: (element, ctx) => <CpfInputElement ... />,
  // ... todos os tipos hardcoded aqui
};
```

```ts
// packages/core/src/elementRegistry.ts (DEPOIS)
const renderers = new Map<string, ElementRenderer>();

// API pública — cada time usa isso para registrar seus componentes
export function registerElement(type: string, renderer: ElementRenderer): void {
  renderers.set(type, renderer);
}

// Lookup continua igual por fora
export function renderJourneyElement(element, ctx) {
  const renderer = renderers.get(element.type);
  if (!renderer) {
    console.warn(`[DynamicJourney] Tipo de elemento desconhecido: "${element.type}"`);
    return null;
  }
  return renderer(element, ctx);
}
```

### Como cada time usa isso

Cada package de elementos tem um `index.ts` que faz o auto-registro na importação:

```ts
// packages/elements-auto/src/index.ts
import { registerElement } from '@dj/core';
import { PlacaInputElement } from './PlacaInputElement';
import { RenavanInputElement } from './RenavanInputElement';

registerElement('PLACA_INPUT', (element, ctx) => (
  <PlacaInputElement element={element} control={ctx.control} />
));

registerElement('RENAVAM_INPUT', (element, ctx) => (
  <RenavanInputElement element={element} control={ctx.control} />
));
```

```ts
// packages/elements-viagem/src/index.ts
import { registerElement } from '@dj/core';
import { CidadeSearchElement } from './CidadeSearchElement';
import { PaisSearchElement } from './PaisSearchElement';

registerElement('CIDADE_SEARCH', (element, ctx) => (
  <CidadeSearchElement element={element} control={ctx.control} />
));

registerElement('PAIS_SEARCH', (element, ctx) => (
  <PaisSearchElement element={element} control={ctx.control} />
));
```

### Como o app orquestra tudo

O app importa os packages de elementos. A importação em si já dispara o registro:

```ts
// apps/journey/src/plugins.ts
// Importar = registrar. Ordem não importa.
import '@dj/elements-common';   // TEXT_INPUT, CPF_INPUT, RADIO, SELECT, CHECKBOX...
import '@dj/elements-auto';     // PLACA_INPUT, RENAVAM_INPUT
import '@dj/elements-viagem';   // CIDADE_SEARCH, PAIS_SEARCH
import '@dj/elements-reside';   // VALOR_IMOVEL
import '@dj/elements-petlove';  // TIPO_PET_SELECT
```

```ts
// apps/journey/src/app/layout.tsx
import '@/plugins';   // ← importação única que ativa todos os elementos

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

A partir daí, quando o `JourneyRunner` renderiza um step e encontra um elemento do tipo `PLACA_INPUT`, o `renderJourneyElement` já encontra o renderer no Map porque ele foi registrado na inicialização do app.

---
JJ
## Pillar 2 — Monorepo com pnpm Workspaces + Turborepo

### Estrutura de pastas

```
dynamic-journey/                    ← raiz do monorepo
│
├── pnpm-workspace.yaml             ← declara os workspaces
├── turbo.json                      ← pipeline de build
├── package.json                    ← devDependencies globais (Biome, Lefthook, etc.)
│
├── packages/
│   ├── core/                       ← engine do journey
│   │   ├── src/
│   │   │   ├── components/         ← JourneyRunner, elementRegistry
│   │   │   ├── hooks/              ← useJourneyController e derivados
│   │   │   ├── store/              ← Zustand store
│   │   │   ├── services/           ← serviceRegistry
│   │   │   ├── validation/         ← schemas base + buildJourneyFormSchema
│   │   │   └── utils/              ← joinPaths, getByPath
│   │   └── package.json            ← name: "@dj/core"
│   │
│   ├── elements-common/            ← elementos genéricos (sem domínio)
│   │   ├── src/
│   │   │   ├── TextInputElement.tsx
│   │   │   ├── CpfInputElement.tsx
│   │   │   ├── RadioElement.tsx
│   │   │   ├── SelectElement.tsx
│   │   │   ├── CheckboxElement.tsx
│   │   │   ├── NavigationElement.tsx
│   │   │   ├── ServiceCallElement.tsx
│   │   │   ├── TitleElement.tsx
│   │   │   ├── ParagraphElement.tsx
│   │   │   └── index.ts            ← registra todos via registerElement()
│   │   └── package.json            ← name: "@dj/elements-common"
│   │
│   ├── elements-auto/              ← time de auto
│   │   ├── src/
│   │   │   ├── PlacaInputElement.tsx
│   │   │   ├── RenavanInputElement.tsx
│   │   │   └── index.ts
│   │   └── package.json            ← name: "@dj/elements-auto"
│   │
│   ├── elements-viagem/            ← time de viagem
│   │   ├── src/
│   │   │   ├── CidadeSearchElement.tsx
│   │   │   ├── PaisSearchElement.tsx
│   │   │   └── index.ts
│   │   └── package.json            ← name: "@dj/elements-viagem"
│   │
│   ├── elements-reside/            ← time de reside
│   │   ├── src/
│   │   │   ├── ValorImovelElement.tsx
│   │   │   └── index.ts
│   │   └── package.json            ← name: "@dj/elements-reside"
│   │
│   └── elements-petlove/           ← time de petlove
│       ├── src/
│       │   ├── TipoPetSelectElement.tsx
│       │   └── index.ts
│       └── package.json            ← name: "@dj/elements-petlove"
│
└── apps/
    └── journey/                    ← app Next.js (orquestrador)
        ├── src/
        │   ├── app/                ← App Router Next.js
        │   ├── plugins.ts          ← importa todos os packages de elementos
        │   └── mock/               ← jornadas de exemplo por domínio
        └── package.json            ← depende de @dj/core + todos os @dj/elements-*
```

### Arquivos de configuração do monorepo

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

O Turborepo entende que `apps/journey` depende dos packages e que os packages dependem do `core`. Ele executa os builds na ordem correta e em paralelo onde possível — e usa cache para não rebuildar o que não mudou.

---

## Como o fluxo de renderização funciona com múltiplos packages

Este é o ponto central: como o app consegue renderizar um elemento `PLACA_INPUT` definido num package separado.

```
BOOT DO APP
────────────────────────────────────────────────────────────────

1. Next.js carrega apps/journey/src/app/layout.tsx
        ↓
2. layout.tsx importa '@/plugins'
        ↓
3. plugins.ts importa '@dj/elements-common'
   → index.ts do elements-common executa
   → registerElement('TEXT_INPUT', renderer)
   → registerElement('CPF_INPUT', renderer)
   → registerElement('RADIO', renderer)
   → ... (todos os elementos comuns)
        ↓
4. plugins.ts importa '@dj/elements-auto'
   → index.ts do elements-auto executa
   → registerElement('PLACA_INPUT', renderer)   ← entra no Map
   → registerElement('RENAVAM_INPUT', renderer) ← entra no Map
        ↓
5. plugins.ts importa '@dj/elements-viagem'
   → registerElement('CIDADE_SEARCH', renderer)
   → registerElement('PAIS_SEARCH', renderer)
        ↓
6. Map do elementRegistry agora tem TODOS os tipos registrados


RENDER DE UM STEP
────────────────────────────────────────────────────────────────

7. Usuário acessa /placa na jornada de auto
        ↓
8. useJourneySteps deriva currentStep = step "placa"
   → sortedElements = [{ type: "PLACA_INPUT", id: "...", config: {...} }, ...]
        ↓
9. JourneyRunner itera sortedElements
   → para cada element: renderJourneyElement(element, ctx)
        ↓
10. renderJourneyElement("PLACA_INPUT", ctx)
    → renderers.get("PLACA_INPUT")    ← encontra o renderer do elements-auto
    → renderer(element, ctx)          ← executa, retorna <PlacaInputElement />
        ↓
11. React renderiza <PlacaInputElement /> na tela
    (o componente vive em packages/elements-auto, mas o Map já tem a referência)
```

O app não sabe que `PlacaInputElement` existe. Ele só chama `renderJourneyElement` com o tipo que veio do JSON. O Map — populado no boot pelos packages — faz o despacho correto.

---

## Validação de Schema por Domínio

Hoje o `buildJourneyFormSchema` conhece os tipos de campos hardcoded. Com múltiplos packages, cada um precisa registrar também seu schema de validação.

### API de registro de schema

```ts
// packages/core/src/validation/schemaRegistry.ts
type FieldSchemaBuilder = (element: unknown, required: boolean) => ZodTypeAny;

const schemaBuilders = new Map<string, FieldSchemaBuilder>();

export function registerFieldSchema(type: string, builder: FieldSchemaBuilder): void {
  schemaBuilders.set(type, builder);
}

export function getFieldSchema(type: string, element: unknown, required: boolean): ZodTypeAny | null {
  const builder = schemaBuilders.get(type);
  return builder ? builder(element, required) : null;
}
```

### Como cada package registra

```ts
// packages/elements-auto/src/index.ts
import { registerElement, registerFieldSchema } from '@dj/core';
import { z } from 'zod';

// registro do renderer (como antes)
registerElement('PLACA_INPUT', (element, ctx) => ( ... ));

// registro do schema de validação
registerFieldSchema('PLACA_INPUT', (element, required) => {
  const base = z.string().regex(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/, 'Placa inválida');
  return required ? base : base.optional();
});
```

### `buildJourneyFormSchema` genérico

```ts
// packages/core/src/validation/buildJourneyFormSchema.ts
function buildJourneyFormSchema(journey) {
  const shape: Record<string, ZodTypeAny> = {};
  const stepFields: Record<string, string[]> = {};

  for (const step of journey.steps) {
    stepFields[step.id] = [];

    for (const element of step.elements) {
      // tenta o schema registry dinâmico primeiro
      const fieldSchema = getFieldSchema(
        element.type,
        element,
        element.config?.required ?? false
      );

      if (fieldSchema && element.config?.name) {
        shape[element.config.name] = fieldSchema;
        stepFields[step.id].push(element.config.name);
      }
    }
  }

  return { schema: z.object(shape), stepFields };
}
```

---

## Isolamento por time: o que cada um controla

| Package | Time responsável | O que contém | Impacta quem? |
|---|---|---|---|
| `@dj/core` | plataforma | engine, store, hooks, registry | todos (mudanças exigem coordenação) |
| `@dj/elements-common` | plataforma | TEXT_INPUT, CPF_INPUT, RADIO, etc. | todos |
| `@dj/elements-auto` | time de auto | PLACA_INPUT, RENAVAM_INPUT | só auto |
| `@dj/elements-viagem` | time de viagem | CIDADE_SEARCH, PAIS_SEARCH | só viagem |
| `@dj/elements-reside` | time de reside | VALOR_IMOVEL | só reside |
| `@dj/elements-petlove` | time de petlove | TIPO_PET_SELECT | só petlove |
| `apps/journey` | plataforma | orquestrador, routing, plugins.ts | todos (bootstrap) |

Um time pode:
- Criar, modificar e testar seus componentes sem tocar em nenhum outro package
- Fazer PR apenas no seu package
- Quebrar seus testes sem afetar os testes dos outros times

Um time **não pode** (sem coordenação):
- Mudar a interface `ElementRenderContext` no core (afeta todos os renderers)
- Mudar o schema base `JourneyDefinition` (afeta todos os JSONs de jornada)
- Alterar o `buildJourneyFormSchema` central

---

## Fases de implementação

### Fase 1 — Plugin Registry (no projeto atual)

Objetivo: eliminar o acoplamento do registry sem mudar a estrutura de pastas.

1. Criar `src/elementRegistry/registry.ts` com `registerElement` e `renderJourneyElement`
2. Mover o objeto `renderers` atual para `src/elementRegistry/commonElements.ts` que chama `registerElement` para cada tipo
3. Criar `src/plugins.ts` que importa `commonElements.ts` (e futuramente os outros domínios)
4. Importar `src/plugins.ts` no `layout.tsx`
5. Criar `src/elementRegistry/auto.ts` como prova de conceito com um tipo novo

**Resultado:** registry dinâmico funcionando, zero mudança na estrutura de pastas, zero mudança na UI.

---

### Fase 2 — Monorepo

Objetivo: dar a cada time seu próprio espaço isolado de build e teste.

1. Adicionar `pnpm-workspace.yaml` e `turbo.json` na raiz
2. Criar `packages/core/` e mover o código atual para lá
3. Criar `packages/elements-common/` com os elementos existentes
4. Criar `packages/elements-auto/`, `packages/elements-viagem/`, etc. (vazios com stubs)
5. Criar `apps/journey/` como wrapper que consome os packages
6. Ajustar imports para usar os nomes dos packages (`@dj/core`, etc.)
7. Configurar o Turborepo para build em paralelo

**Resultado:** cada time tem seu package, CI pode rodar testes por package, builds são incrementais.

---

### Fase 3 — CI/CD independente por time (opcional)

Objetivo: cada time faz release do seu package de forma autônoma.

1. Configurar um registry npm interno (Verdaccio ou GitHub Packages)
2. Cada package tem seu próprio pipeline de CI (GitHub Actions por path filter)
3. O `apps/journey` usa versões pinadas dos packages no `package.json`
4. Times fazem `@dj/elements-auto@2.1.0` → `apps/journey` atualiza a dependência

**Resultado:** time de auto pode shipar sem depender do time de viagem. O app controla quando absorve cada versão nova.

---

## Resumo: o que resolve cada problema

| Problema | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| Times editam o mesmo `elementRegistry.tsx` | ✅ Registry dinâmico, cada time registra no seu arquivo | | |
| Conflito de merge entre times | parcial (arquivos separados no mesmo repo) | ✅ Packages separados | |
| Bug de um time derruba outro | parcial | ✅ Testes isolados por package | |
| Um deploy bloqueia todos | não resolve | parcial (monorepo ainda tem um deploy) | ✅ Releases independentes |
| Schema Zod acoplado a todos os tipos | ✅ Schema registry dinâmico | | |
