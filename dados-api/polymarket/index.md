# Polymarket API Reference

> Fonte: https://docs.polymarket.com/index
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


> Fonte: https://docs.polymarket.com
> Baixado em: 2026-01-07

Documentação completa da API do Polymarket - plataforma de mercados de previsão descentralizada.

## Conteúdo

### Guias Rápidos
- [Developer Quickstart](./quickstart/overview.md) - Introdução ao desenvolvimento com Polymarket APIs
- [CLOB Quickstart](./developers/CLOB/introduction.md) - Inicialize o CLOB e faça seu primeiro pedido
- [Authentication](./developers/CLOB/authentication.md) - Entendendo autenticação L1 e L2

### APIs Principais

#### Gamma API
- [Gamma Structure Overview](./developers/gamma-markets-api/overview.md) - Visão geral da estrutura Gamma
- [Gamma Endpoints](./developers/gamma-markets-api/overview.md) - Endpoints de Markets, Events, Tags, Series

#### CLOB API (Central Limit Order Book)
- [Introduction](./developers/CLOB/introduction.md) - Visão geral do CLOB
- [Authentication](./developers/CLOB/authentication.md) - Autenticação L1 e L2
- [WebSocket Market Channel](./developers/CLOB/websocket/market-channel.md) - Canal de mercado WebSocket em tempo real

> **Nota**: Documentação REST API completa foi movida para `_archive_old/clob/rest-api.md`

### Outros Tópicos

#### Conditional Token Frameworks (CTF)
- [CTF Overview](./developers/CTF/overview.md) - Operações de split, merge e redeem de tokens

#### Builders Program
- [Builders Program](./developers/builders/builder-intro.md) - Programa para desenvolvedores com benefícios em camadas

## Links Rápidos

- **Site Oficial**: https://polymarket.com
- **Documentação Oficial**: https://docs.polymarket.com
- **Discord Community**: [Link na documentação](https://docs.polymarket.com) ↗️
- **GitHub**: Polymarket repositories

## Visão Geral das APIs

### Gamma API
**Market discovery & metadata** - Busque eventos, mercados, categorias e dados de resolução.

- Endpoint: `https://gamma-api.polymarket.com`
- Uso: Descobrir o que é negociável
- Autenticação: Não requerida (público)

### CLOB API
**Preços, orderbooks & trading** - Obtenha preços em tempo real, profundidade do orderbook e faça pedidos.

- Endpoint: `https://clob.polymarket.com`
- Uso: API principal de trading
- Autenticação: L1 (chave privada) e L2 (API key)

### Data API
**Positions, activity & history** - Consulte posições de usuários, histórico de trades e dados de portfólio.

- Endpoint: `https://data-api.polymarket.com`
- Uso: Dados históricos e analytics
- Autenticação: Requerida

### WebSocket
**Real-time updates** - Assine mudanças no orderbook, atualizações de preço e status de ordens.

- Endpoint: `wss://ws-subscriptions-clob.polymarket.com`
- Uso: Dados em tempo real
- Autenticação: Opcional (canais públicos e privados)

## SDKs & Bibliotecas

### TypeScript/JavaScript
```bash
npm install @polymarket/clob-client ethers
```

### Python
```bash
pip install py-clob-client
```

### Para Builders
- **Relayer Client**: Transações gasless
- **Signing SDK**: Headers de autenticação para builders

## Conceitos Principais

### Níveis de Autenticação

**L1 (Private Key)**
- Usa chave privada da carteira
- Assina mensagens EIP-712
- Cria/deriva credenciais de API

**L2 (API Key)**
- Usa credenciais de API (apiKey, secret, passphrase)
- Assina requisições com HMAC-SHA256
- Executa operações de trading

### Signature Types

| Tipo | Valor | Descrição |
|------|-------|-----------|
| EOA | 0 | Carteira Ethereum padrão (MetaMask) |
| POLY_PROXY | 1 | Proxy wallet customizada (Magic Link) |
| GNOSIS_SAFE | 2 | Gnosis Safe multisig proxy wallet |

## Estrutura de Mercados

### Tokens
Cada mercado tem tokens de resultado representando diferentes resultados possíveis.
- **Token ID**: Identificador único do token
- **Condition ID**: Identificador do mercado
- **Outcomes**: Resultados possíveis (ex: "Yes", "No")

### Preços
- Preços variam de 0 a 1 (ou 0 a 100 centavos)
- Representam probabilidade implícita
- Preço de 0.65 = 65% de probabilidade

### Order Book
- **Bids** (Compras): Ordens de compra a um preço
- **Asks** (Vendas): Ordens de venda a um preço
- **Spread**: Diferença entre melhor bid e melhor ask

## Próximos Passos

1. **Para buscar dados de mercado**: Comece com [Gamma Structure Overview](./developers/gamma-markets-api/overview.md)
2. **Para fazer trading**: Leia [CLOB Quickstart](./developers/CLOB/introduction.md)
3. **Para autenticação**: Estude [Authentication](./developers/CLOB/authentication.md)
4. **Para dados em tempo real**: Veja [WebSocket Market Channel](./developers/CLOB/websocket/market-channel.md)

## Recursos Adicionais

### Canais de Mercado (WebSocket)
- `book` - Snapshot do order book
- `price_change` - Mudanças de preço
- `last_trade_price` - Último preço executado
- `best_bid_ask` - Melhor bid/ask
- `new_market` - Novo mercado criado
- `market_resolved` - Mercado resolvido

### Endpoints Gamma Populares
- `GET /markets` - Lista mercados
- `GET /markets?id={id}` - Mercado por ID
- `GET /markets?slug={slug}` - Mercado por slug
- `GET /events` - Lista eventos
- `GET /tags` - Lista tags

### Operações de Trading
- Criar ordem (single ou batch)
- Cancelar ordens
- Buscar ordens ativas
- Consultar trades
- Verificar saldos e permissões

---

**Documentação mantida pela comunidade** - Última atualização: 2026-01-07
