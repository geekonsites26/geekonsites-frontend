# GeekOnSites Frontend

React and Vite frontend for GeekOnSites remote and on-site technology support.

## Frontend Standards

All GOS V2 work from Phase 2 onward must follow the mobile-first and
cross-platform acceptance criteria in
[`docs/GOS_V2_FRONTEND_STANDARDS.md`](docs/GOS_V2_FRONTEND_STANDARDS.md).

## Development

```bash
npm run dev
npm run build
npm run lint
```

## Vite Reference

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
