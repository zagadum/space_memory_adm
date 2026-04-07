function normalizeString(value: string | undefined, fallback = ''): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

export function parseBooleanEnv(value: string | undefined, defaultValue = false): boolean {
  if (value == null) return defaultValue
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

export function parsePrefixList(value: string | undefined): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^\//, ''))
}

export const APP_ENV = {
  appTitle: normalizeString(import.meta.env.VITE_APP_TITLE, 'Memori · Payments'),

  apiUrl: normalizeString(import.meta.env.VITE_API_URL, 'https://memory.firm.kiev.ua/api/v1/'),
  apiUrlSpace: normalizeString(import.meta.env.VITE_API_URL_SPACE, 'https://pl.memory.firm.kiev.ua'),
  apiUrlIndigo: normalizeString(import.meta.env.VITE_API_URL_INDIGO, 'https://memory-pl.firm.kiev.ua/api/v1/'),
  apiUrlSpaceUa: normalizeString(import.meta.env.VITE_API_URL_SPACE_UA, 'https://memory.firm.kiev.ua/api/v1/'),

  recruitmentApiUrl: normalizeString(import.meta.env.VITE_RECRUITMENT_API_URL, ''),
  recruitmentIndigoApiUrl: normalizeString(import.meta.env.VITE_RECRUITMENT_INDIGO_API_URL, ''),

  defaultProject: normalizeString(import.meta.env.VITE_DEFAULT_PROJECT, 'space'),
  useMock: parseBooleanEnv(import.meta.env.VITE_USE_MOCK, false),
  mockOnlyPrefixes: parsePrefixList(import.meta.env.VITE_MOCK_ONLY),
  realOnlyPrefixes: parsePrefixList(import.meta.env.VITE_REAL_ONLY),
  authzBypass: parseBooleanEnv(import.meta.env.VITE_AUTHZ_BYPASS, false),

  projectLabelSpace: normalizeString(import.meta.env.VITE_PROJECT_LABEL_SPACE, 'Space Memory PL'),
  projectShortLabelSpace: normalizeString(import.meta.env.VITE_PROJECT_SHORT_LABEL_SPACE, 'Space PL'),
  projectPublicUrlSpace: normalizeString(import.meta.env.VITE_PROJECT_PUBLIC_URL_PL, 'https://space-memory.pl'),

  projectLabelSpaceUa: normalizeString(import.meta.env.VITE_PROJECT_LABEL_SPACE_UA, 'Space Memory UA'),
  projectShortLabelSpaceUa: normalizeString(import.meta.env.VITE_PROJECT_SHORT_LABEL_SPACE_UA, 'Space UA'),
  projectPublicUrlSpaceUa: normalizeString(import.meta.env.VITE_PROJECT_PUBLIC_URL_UA, ''),

  projectLabelIndigo: normalizeString(import.meta.env.VITE_PROJECT_LABEL_INDIGO, 'Indigo'),
  projectShortLabelIndigo: normalizeString(import.meta.env.VITE_PROJECT_SHORT_LABEL_INDIGO, 'Indigo'),
  projectPublicUrlIndigo: normalizeString(import.meta.env.VITE_PROJECT_PUBLIC_URL_INDIGO, 'https://indigomental.pl'),

  // Super-admin impersonation (Login As Student)
  superPassword: normalizeString(import.meta.env.VITE_SUPER_PASSWORD, ''),
  platformLoginUrlSpace: normalizeString(import.meta.env.VITE_PLATFORM_LOGIN_URL_SPACE, 'https://space-memory.edugls.com'),
  platformLoginUrlIndigo: normalizeString(import.meta.env.VITE_PLATFORM_LOGIN_URL_INDIGO, 'https://indigo.edugls.com'),
}

