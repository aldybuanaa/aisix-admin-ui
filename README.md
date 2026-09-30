# AISIX Admin UI

Vue 3 administration interface for the [AISIX](https://github.com/api7/aisix) gateway.

## Features

- Management UI for models, provider keys, API keys, guardrails, cache policies, MCP servers, A2A agents, passthrough routes, and observability exporters
- Model discovery for OpenAI-compatible, Anthropic, and Ollama endpoints
- Clean Architecture layers: data source, repository, use case, ViewModel, and presentation
- Responsive resource tables and forms
- Secret-safe API key handling

## Requirements

- Node.js 22 or later
- AISIX Admin API reachable from the browser

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Configuration

The development server proxies `/admin` requests to `http://127.0.0.1:8080` by default. Configure the proxy target in `vite.config.ts` when AISIX runs elsewhere.
