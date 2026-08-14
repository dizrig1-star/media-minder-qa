# Architecture

Media Minder is a static ES-module application designed for GitHub Pages.

## Layers

- `main.js` — application composition and event binding
- `app/router.js` — one route registry
- `app/state.js` — one runtime state manager with local persistence
- `services/` — business logic
- `components/` — reusable presentation units
- `pages/` — page-level composition only
- `data/` — content/profile seed data
- `styles/` — shared design tokens and component styling

Pages do not own business logic. Components do not own application state.
