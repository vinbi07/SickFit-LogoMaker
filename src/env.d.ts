/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_AI_MOCKUP?: string;
  readonly VITE_AI_MOCKUP_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
