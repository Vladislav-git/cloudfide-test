/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL, e.g. http://localhost:5001 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
