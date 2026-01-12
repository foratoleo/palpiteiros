# Proposal: Add Market Thumbnails to Cards

**Date:** 2026-01-12
**Status:** Proposed
**Priority:** Medium

## Overview

Adicionar pequenas imagens em miniatura (thumbnails) ao lado da descrição de cada market card em todas as visualizações (grid, list, breaking), seguindo o design pattern do Polymarket.

## Problem Statement

Atualmente os market cards não mostram nenhuma imagem visual além de placeholders gerados automaticamente. O Polymarket usa pequenas imagens quadradas ao lado do título do mercado para identificar visualmente o evento, melhorando a UX e o apelo visual.

## Research Findings

### Polymarket API Response

A API do Polymarket (Gamma) retorna:
- `imageUrl`: URL da imagem principal do mercado
- `icon`: URL do ícone do mercado (versão menor)
- `twitterCardImage`: URL para card do Twitter

**Exemplo de resposta:**
```json
{
  "question": "Will Bitcoin reach $100,000?",
  "image": "https://polymarket.com/images/market_btc.png",
  "icon": "https://polymarket.com/images/icon_btc.png"
}
```

### Current Code Analysis

1. **Type System:**
   - `Market` type já tem `image_url?: string | null`
   - `GammaMarket` type já tem `imageUrl?: string`
   - Mapeamento já existe mas precisa verificação

2. **Components:**
   - `MarketCard` já tem `showImage` prop (default: `false`)
   - Já tem lógica de placeholder (gradient SVG)
   - Layout atual: imagem acima do texto (quando habilitado)
   - **Precisa mudar:** imagem ao lado do texto, layout horizontal

3. **Image Handling:**
   - Usa `BlurUpLoader` para carregamento progressivo
   - Usa `SkeletonImage` para loading state
   - Já integrado com Next.js Image component

## Proposed Solution

### Design Approach

**Layout Horizontal:**
```
┌─────────────────────────────────────────────┐
│ Market Question Text...     [ 48x48 IMG ]  │
│ Description details...          ▲            │
│                                    small    │
│                                    square   │
└─────────────────────────────────────────────┘
```

**Especificações:**
- **Tamanho:** 48x48px (quadrado pequeno)
- **Border-radius:** 8px (suave)
- **Posição:** Direita do texto, alinhado ao topo
- **Spacing:** 12px gap entre texto e imagem
- **Fallback:** Gradiente SVG (já implementado)
- **Loading:** Skeleton com blur effect

### Responsive Behavior

- **Desktop (>768px):** Layout horizontal (texto + imagem lado a lado)
- **Mobile (<768px):** Layout horizontal compacto ou empilhado
- **Tablet:** Mesmo padrão de desktop

## Implementation Plan

### Task 1: Verify imageUrl Mapping (Backend)
**Agent:** `dr:nodejs-specialist`

**File:** `src/services/gamma.service.ts`

**Objective:** Garantir que `imageUrl` da API Gamma seja corretamente mapeado para `image_url` no tipo Market.

**Actions:**
- Verificar função de transformação de GammaMarket → Market
- Confirmar que imageUrl está sendo salvo como image_url
- Testar com dados reais da API

**Validation:**
- Log do market retornado deve mostrar image_url populada

---

### Task 2: Redesign MarketCard Layout
**Agent:** `dr:react-specialist`

**File:** `src/components/market/market-card.tsx`

**Objective:** Modificar layout do card para mostrar imagem thumbnail ao lado do texto.

**Changes:**
1. Mudar `showImage` default de `false` para `true`
2. Reposicionar conteúdo do card para layout horizontal:
   - Header: Título + Thumbnail (flex row)
   - Body: Descrição e metadados
   - Footer: Preço e ações
3. Ajustar dimensões da imagem para 48x48px
4. Aplicar estilos: `rounded-lg`, `object-cover`, `border`

**Code Changes:**
```tsx
// Header com thumbnail
<CardHeader className="flex-row gap-3 items-start">
  <div className="flex-1 min-w-0">
    <h3 className="font-semibold line-clamp-2">{market.question}</h3>
  </div>
  {showImage && (
    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border">
      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
    </div>
  )}
</CardHeader>
```

**Validation:**
- Imagem aparece ao lado do título
- Responsivo em mobile/tablet/desktop
- Fallback funciona quando image_url é null

---

### Task 3: Update MarketList Component
**Agent:** `dr:react-specialist`

**File:** `src/components/market/market-list.tsx`

**Objective:** Garantir que MarketCards mostrem imagem por padrão.

**Changes:**
- Remover `showImage={false}` se estiver explicitamente setado
- Deixar usar o default (true) do MarketCard

**Validation:**
- Lista de mercados mostra thumbnails
- Grid e list views funcionam corretamente

---

### Task 4: Apply to BreakingMarketCard
**Agent:** `dr:react-specialist`

**File:** `src/components/breaking/breaking-market-card.tsx`

**Objective:** Aplicar mesmo padrão visual para consistência.

**Changes:**
1. Reorganizar layout para thumbnail ao lado do título
2. Manter funcionalidade existente (sparkline, badges, etc.)
3. Aplicar mesmas dimensões (48x48px)

**Validation:**
- Visual consistente com MarketCard
- Todos os elementos breaking mantidos

---

### Task 5: E2E Testing
**Agent:** `dr:playwright-specialist`

**File:** `e2e/market-thumbnails.spec.ts`

**Objective:** Criar testes E2E para validar implementação.

**Test Cases:**
1. **Renderização da imagem:**
   - Verifica que thumbnail aparece ao lado do título
   - Verifica dimensões (48x48px)
   - Verifica border-radius

2. **Fallback quando sem imagem:**
   - Verifica placeholder SVG quando image_url é null
   - Verifica que layout não quebra

3. **Responsividade:**
   - Desktop: layout horizontal
   - Mobile: layout adaptado
   - Tablet: spacing correto

**Code:**
```typescript
test('market card displays thumbnail image', async ({ page }) => {
  await page.goto('/markets')
  const thumbnail = page.locator('[data-testid="market-card-thumbnail"]').first()
  await expect(thumbnail).toBeVisible()
  await expect(thumbnail).toHaveCSS('width', '48px')
  await expect(thumbnail).toHaveCSS('height', '48px')
})
```

---

## Technical Specifications

### Type Definitions

Já existentes, sem modificações necessárias:
```typescript
// src/types/market.types.ts
export interface Market {
  image_url?: string | null  // ✓ Já existe
}

// src/types/gamma.types.ts
export interface GammaMarket {
  imageUrl?: string  // ✓ Já existe
}
```

### Component Props

MarketCard (modificado):
```typescript
export interface MarketCardProps {
  market: Market
  variant?: 'default' | 'compact' | 'detailed'
  showPrice?: boolean
  showVolume?: boolean
  showLiquidity?: boolean
  onClick?: (market: Market) => void
  className?: string
  showImage?: boolean  // ✓ Já existe, mudar default para true
  enableProgressiveImage?: boolean  // ✓ Já existe
  imageLoadingEffect?: 'blur-up' | 'fade-in'  // ✓ Já existe
}
```

### Performance Considerations

- **Next.js Image:** Usar `next/image` para otimização automática
- **Blur placeholder:** Já implementado, mantém performance
- **Lazy loading:** Carregar imagens apenas quando visíveis
- **CDN:** Imagens do Polymarket já estão em CDN

### Accessibility

- **Alt text:** Deixar vazio ou decorativo (`role="presentation"`)
- **Loading state:** Skeleton com aria-busy
- **Fallback:** Sempre manter layout mesmo sem imagem

## Success Criteria

1. ✅ Thumbnail 48x48px aparece ao lado do título
2. ✅ Fallback (gradiente) quando image_url é null
3. ✅ Layout responsivo (mobile, tablet, desktop)
4. ✅ Performance: não degradar tempo de carregamento
5. ✅ Consistência visual em MarketCard e BreakingMarketCard
6. ✅ Testes E2E passando
7. ✅ Design alinhado com Polymarket

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Imagem pode não carregar (URL quebrada) | Implementar onError com fallback |
| API pode não retornar imageUrl | Verificar mapeamento no serviço |
| Layout pode quebrar em mobile | Testar responsividade |
| Performance pode degradar | Usar Next.js Image com lazy loading |

## Alternatives Considered

1. **Usar icon em vez de image:**
   - ❌ Rejeitado: Icon menor, menos visual
   - ✅ Escolhido: Image thumbnail melhor

2. **Imagem maior (ex: 80x80):**
   - ❌ Rejeitado: Ocupa muito espaço
   - ✅ Escolhido: 48x48px compacto

3. **Imagem acima do texto:**
   - ❌ Rejeitado: Layout atual já faz isso
   - ✅ Escolhido: Ao lado do texto (solicitado pelo usuário)

## Timeline Estimate

- Task 1 (Backend): 15 min
- Task 2 (MarketCard): 45 min
- Task 3 (MarketList): 15 min
- Task 4 (BreakingCard): 30 min
- Task 5 (Tests): 30 min
- **Total:** ~2.5 horas

## Dependencies

- Sem bloqueios
- Todas as tasks podem ser feitas em paralelo, exceto:
  - Task 3 depende da Task 2
  - Task 4 depende da Task 2

## References

- Polymarket docs: https://docs.polymarket.com
- Context7 research: `/llmstxt/polymarket_llms_txt`
- Current MarketCard: `src/components/market/market-card.tsx`
- Gamma types: `src/types/gamma.types.ts`
