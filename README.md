# React + Vite

## Local and Render deployment

Create a local `.env` file from `.env.example` and set `MONGODB_URI` before running `npm start`.

For Render, connect the GitHub repository and use the included `render.yaml` Blueprint, or set:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`

Required Render environment variables:

- `MONGODB_URI`
- `RRA_OFFICER_ID` (for example `RRA-ADMIN-001`)
- `RRA_OFFICER_PASSWORD`

The production frontend uses the same Render origin for API requests, so the deployed app can run at `https://dhara-main.onrender.com` without a separate frontend service.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
