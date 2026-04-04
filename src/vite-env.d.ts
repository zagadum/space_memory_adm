/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string

  readonly VITE_API_URL?: string
  readonly VITE_API_URL_SPACE?: string
  readonly VITE_API_URL_INDIGO?: string
  readonly VITE_API_URL_SPACE_UA?: string

  readonly VITE_RECRUITMENT_API_URL?: string
  readonly VITE_RECRUITMENT_INDIGO_API_URL?: string

  readonly VITE_DEFAULT_PROJECT?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_MOCK_ONLY?: string
  readonly VITE_REAL_ONLY?: string
  readonly VITE_AUTHZ_BYPASS?: string

  readonly VITE_PROJECT_LABEL_SPACE?: string
  readonly VITE_PROJECT_SHORT_LABEL_SPACE?: string
  readonly VITE_PROJECT_PUBLIC_URL_PL?: string

  readonly VITE_PROJECT_LABEL_SPACE_UA?: string
  readonly VITE_PROJECT_SHORT_LABEL_SPACE_UA?: string
  readonly VITE_PROJECT_PUBLIC_URL_UA?: string

  readonly VITE_PROJECT_LABEL_INDIGO?: string
  readonly VITE_PROJECT_SHORT_LABEL_INDIGO?: string
  readonly VITE_PROJECT_PUBLIC_URL_INDIGO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

