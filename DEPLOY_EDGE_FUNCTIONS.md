# Deploy Supabase Edge Functions - Instruções

## Pré-requisitos

1. Instalar Supabase CLI (se não tiver):
   ```bash
   brew install supabase/tap/supabase
   ```

2. Fazer login no Supabase:
   ```bash
   npx supabase login
   ```
   Você será redirecionado para o browser para gerar um access token.

## Deploy das Edge Functions

### 1. Deploy get-breaking-markets

```bash
npx supabase functions deploy get-breaking-markets --project-ref fnfuzshbbvwwdhexwjlv
```

Esta função calcula:
- `price_change_percent`: Variação de preço em 24h
- `volume_change_percent`: Variação de volume em 24h
- `price_high_24h`: Maior preço em 24h
- `price_low_24h`: Menor preço em 24h
- `volatility_index`: Índice de volatilidade (desvio padrão)
- `movement_score`: Score composto (50% preço + 30% volume + 20% volatilidade)
- `trend`: Direção da tendência ('up', 'down', 'neutral')
- `price_history_24h`: Array com até 24 pontos de histórico

### 2. Deploy sync-price-history

```bash
npx supabase functions deploy sync-price-history --project-ref fnfuzshbbvwwdhexwjlv
```

Esta função sincroniza o histórico de preços da API Gamma para o Supabase.

### 3. Deploy get-polymarket-tweets (opcional)

```bash
npx supabase functions deploy get-polymarket-tweets --project-ref fnfuzshbbvwwdhexwjlv
```

### 4. Deploy send-breaking-daily (opcional)

```bash
npx supabase functions deploy send-breaking-daily --project-ref fnfuzshbbvwwdhexwjlv
```

### 5. Deploy subscribe-newsletter (opcional)

```bash
npx supabase functions deploy subscribe-newsletter --project-ref fnfuzshbbvwwdhexwjlv
```

## Verificar Deploy

Após fazer o deploy, verifique se as funções estão ativas:

```bash
npx supabase functions list --project-ref fnfuzshbbvwwdhexwjlv
```

## Testar as Funções

### Testar get-breaking-markets

```bash
curl -X POST https://fnfuzshbbvwwdhexwjlv.supabase.co/functions/v1/get-breaking-markets \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

### Testar sync-price-history

```bash
curl -X POST https://fnfuzshbbvwwdhexwjlv.supabase.co/functions/v1/sync-price-history \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Troubleshooting

### Erro: "Access token not provided"
```bash
npx supabase login
# Siga as instruções no browser
```

### Erro: "Function not found"
Verifique se o nome da função está correto e se o deploy foi bem-sucedido.

### Erro: "JWT verification failed"
As funções exigem JWT por padrão. Para testes sem JWT, use:
```bash
npx supabase functions deploy get-breaking-markets --no-verify-jwt --project-ref fnfuzshbbvwwdhexwjlv
```

## Logs das Funções

Para ver os logs em tempo real:
```bash
npx supabase functions logs get-breaking-markets --project-ref fnfuzshbbvwwdhexwjlv
```
