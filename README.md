# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## AI Mockup Generation (Gemini-ready)

The designer now supports an async AI mockup generation path from the download button.

Set these environment variables in a `.env` file:

```bash
VITE_ENABLE_AI_MOCKUP=true
VITE_AI_MOCKUP_API_URL=http://localhost:8787/api
```

Notes:

- Keep the Gemini API key on your backend only. Do not expose it in the Vite frontend.
- Frontend flow: create job -> poll status -> download first generated image.
- If AI generation fails, the app falls back to the existing static `exportMockup` path.
- Expected backend endpoints:
  - `POST /mockups/jobs`
  - `GET /mockups/jobs/:jobId`

### Backend Setup (Node.js)

The repository now includes a backend service in `backend/` that handles async AI job processing.

1. Add backend env values (in root `.env` for local dev):

```bash
GEMINI_API_KEY=your-gemini-key
BASE_URL=http://localhost:8787
CORS_ORIGIN=http://localhost:5173
```

2. Install and run backend:

```bash
cd backend
npm install
npm run start
```

3. Run frontend in another terminal:

```bash
npm run dev
```
