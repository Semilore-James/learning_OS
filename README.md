# DA // LEARNING OS

A Data Analyst learning environment built as a desktop-operating-system metaphor.
Neobrutalist window chrome over an atmospheric constellation canvas.

- **Product spec:** [`docs/DA_Learning_OS_PRD_v2.md`](docs/DA_Learning_OS_PRD_v2.md)
- **User flows:** [`docs/DA_Learning_OS_Userflow_v2.md`](docs/DA_Learning_OS_Userflow_v2.md)
- **Design spec:** [`docs/DA_Learning_OS_Design_Prompt_v2.md`](docs/DA_Learning_OS_Design_Prompt_v2.md)
- **Hi-fi mockup:** [`docs/DA Learning OS.dc.html`](docs/DA%20Learning%20OS.dc.html) (Claude Design canvas format, reference only, not runnable code)
- **Build plan:** [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) — the Council's blueprint and ordered step list

## Layout

```
learning_OS/
  app/            Next.js 16 app (App Router, TypeScript, no Tailwind)
    app/          routes + globals.css (design tokens)
    content/      curriculum.ts, toolkit.ts, textbook/, cases/, games/  (single sources of truth)
    lib/          store, adapters, graph, flags, ai/, analytics/, video/
  docs/           specs, mockup, build plan
  supabase/       schema migrations (added in Phase 0 step 4)
  .github/        CI (build + typecheck + lint on every PR)
```

## Develop

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000.

## Build model

Frozen foundation, then parallel features, continuously integrated. `main` builds
and deploys green after every merge; unfinished features hide behind flags in
`app/lib/flags.ts`. See `docs/BUILD_PLAN.md`.
