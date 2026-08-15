# Media Minder

**Version 1.0.8**

Media Minder is an editorial entertainment companion built around curated recommendations across streaming platforms and television.

## Run locally

From the repository root:

```bash
python -m http.server 4173
```

Then open:

`http://localhost:4173/src/`

The application is a static ES-module application and requires an HTTP server for JSON loading.

## Product guardrails

- Recommendations first.
- Editorial over algorithm.
- No Discover page.
- One page, one purpose.
- One component, one responsibility.
- No clutter.
- Entertainment remains the star.
- New ideas belong in `docs/ProjectionRoom.md`.

## Architecture

- `src/app/` — router and application state
- `src/components/` — reusable UI components
- `src/pages/` — page composition
- `src/services/` — business logic
- `src/data/` — seed content and user profile
- `src/styles/` — shared design system
- `assets/` — brand and icon assets
- `docs/` — product and developer documentation
