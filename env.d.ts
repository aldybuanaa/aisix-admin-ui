/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROXY_TARGET: string
  readonly VITE_ADMIN_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
