# AISIX Operations Console

Vue 3 administration interface for the AISIX AI gateway. Manage provider keys, AI models,
smart routing, and observe gateway health and metrics — all through the Admin API.

## Features

- **Metrics dashboard** — real gateway health (`GET /admin/v1/health`),
  model statuses (`GET /admin/v1/models/status`), and metrics summary
  (`GET /admin/v1/metrics/summary`) with loading/error/empty states
- **Provider setup wizard** — connect an upstream provider, test connection,
  discover models (OpenAI-compatible, Anthropic, Ollama), and import them
  as gateway model resources with checkboxes
- **Smart routing** — create/edit virtual models with weighted round-robin,
  priority failover, or least-latency strategies; ordered targets with
  weights and priorities, validated before saving
- **Resource management** — CRUD for models, provider keys, API keys,
  guardrails, cache policies, MCP servers, A2A agents, passthrough routes,
  and observability exporters (now writable)
- **Secure secret handling** — API keys entered only for discovery calls;
  never stored in `localStorage`, logs, or errors; cleared after use
- **Responsive shell** — collapsible sidebar, mobile drawer nav,
  light/dark/system theme persisted locally
- **Clean Architecture** — domain / data / presentation / DI layers with
  `BaseViewModel` + RxJS `Result` observables

## Requirements

- Node.js 22 or later
- AISIX Admin API reachable from the browser (via same-origin dev proxy)

## Development

```bash
npm install
npm run dev
```

## Configuration (.env)

Copy the placeholder and fill in values for your local environment:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PROXY_TARGET` | `http://127.0.0.1:3001` | Backend for `/admin`, `/livez`, `/readyz` proxy routes |
| `VITE_ADMIN_API_KEY` | *(empty)* | Dev-only header forwarded as `x-admin-key` + `Authorization`; never commit a value |

The dev server keeps requests same-origin: `/admin/*` goes through Vite's proxy
to `VITE_PROXY_TARGET`, avoiding CORS issues in local development.

## Verification

```bash
npx vue-tsc --noEmit -p tsconfig.app.json  # typecheck
npx vitest run                             # unit + viewmodel tests (97 passing)
npm run build                              # production build
```

## Design

See `DESIGN.md` for the operations-console design direction:
slate neutrals + one amber/orange routing accent, light-first with a
working dark mode, high-density but calm information display.
No `indigo`/`purple` gradients — the UI communicates through real data.

## Project structure

```
src/
  core/            # DI container, router, theme, HttpClient, BaseViewModel
  feature/
    admin/         # resource CRUD, discovery, providers
    wizard/        # provider setup wizard
    routing/       # smart routing (domain entities + viewmodel + pages)
    metrics/       # health/status/metrics dashboard
test/unit_test/    # vitest specs per feature
```

## Endpoint contracts (subject to backend reconciliation)

| Source | Endpoint |
|---|---|
| Gateway health | `GET /admin/v1/health` |
| Model statuses | `GET /admin/v1/models/status` |
| Metrics summary | `GET /admin/v1/metrics/summary` |

The metrics data layer is written against these typed candidates with
fixture-backed tests; the parent will reconcile exact path/shape.
