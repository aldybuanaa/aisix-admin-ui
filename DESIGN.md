# AISIX-9R Operations Console — Design System

## Product Identity & Character
AISIX is a high-throughput AI traffic gateway and intelligent model routing control plane.
The interface is a precision operations console designed for infrastructure engineers and AI platform operators.

- **Design Philosophy:** Pragmatic, calm, high information density, clear operational hierarchy, zero gratuitous decoration.
- **Color Identity:** Slate neutrals (`#0f172a` slate-900 / `#f8fafc` slate-50 base) anchored by a single high-visibility traffic routing accent: **Amber / Orange** (`#d97706` amber-600 / `#f59e0b` amber-500). Generic AI indigo/purple gradients and blue-purple glows are strictly forbidden.
- **Theme:** Light-first default with a fully functional, persisted Dark mode toggle (`light` / `dark` / `system`). High contrast across both modes (WCAG AA 4.5:1 text, 3:1 non-text boundaries).
- **Liveliness Dials:**
  - **ENERGY: 1** — Minimalist, crisp, functional operations console. Data and status take priority over ornamental flair.
  - **RHYTHM: 2** — Structured layout with distinct hierarchy between navigation shell, metric summaries, data tables, and configuration flows.
  - **MOTION: 1** — Hover states, modal transitions, and subtle status changes only. No endless pulse loops or decorative floating animations.

## Typography
- **Primary Interface:** System Sans (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`)
- **Data & Telemetry / IDs:** Monospace (`ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`)
- **Scale:** High-density 12px (caption/badge), 13px/14px (body/table/form), 16px/18px (subheadings), 20px/24px (page headings).

## Layout & Responsive Reflow
- **Shell:** Responsive collapsible sidebar navigation with clear active states, top bar with environment indicator, real-time health indicator, and theme switcher.
- **Mobile First / Reflow:** Navigation reflows into a mobile drawer / header, touch targets strictly ≥ 44px, no squeezed desktop tables (responsive card/scroll wrapping), zero horizontal scroll leak.
- **Modals & Dialogs:** Focus trap, Escape to close, backdrop click dismiss, keyboard accessible.
