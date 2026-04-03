export type ProjectCode = 'space' | 'indigo' | 'space_ua'

export interface ProjectOption {
  code: ProjectCode
  label: string
  shortLabel: string
  dotClass: string
  publicUrl?: string
}

export const PROJECT_STORAGE_KEY = 'gls_active_project'
const DEFAULT_API_SUFFIX = '/api/v1/'
const VALID_PROJECTS: ProjectCode[] = ['space', 'indigo', 'space_ua']

function normalizeProjectApiUrl(value: string | undefined, fallback: string): string {
  const raw = String(value || fallback).trim()
  const source = raw || fallback

  try {
    const url = new URL(source)
    const path = url.pathname.replace(/\/+$/, '')

    if (!path || path === '/') {
      url.pathname = DEFAULT_API_SUFFIX
    } else {
      url.pathname = `${path}/`
    }

    return url.toString()
  } catch {
    const normalized = source.replace(/\/+$/, '')
    if (!normalized) return fallback
    if (/\/v1$/i.test(normalized)) return `${normalized}/`
    return `${normalized}${DEFAULT_API_SUFFIX}`
  }
}

export function isProjectCode(value: unknown): value is ProjectCode {
  return VALID_PROJECTS.includes(value as ProjectCode)
}

const env = (import.meta as any).env ?? {}

export const PROJECT_API_URLS: Record<ProjectCode, string> = {
  space: normalizeProjectApiUrl(env.VITE_API_URL_SPACE, 'https://pl.memory.firm.kiev.ua'),
  indigo: normalizeProjectApiUrl(env.VITE_API_URL_INDIGO, 'https://memory-pl.firm.kiev.ua/api/v1/'),
  space_ua: normalizeProjectApiUrl(env.VITE_API_URL_SPACE_UA || env.VITE_API_URL, 'https://memory.firm.kiev.ua/api/v1/'),
}

export const PROJECT_OPTIONS: ProjectOption[] = [
  {
    code: 'space',
    label: 'Space Memory PL',
    shortLabel: 'Space PL',
    dotClass: 'dot-space',
    publicUrl: 'https://space-memory.pl',
  },
  {
    code: 'space_ua',
    label: 'Space Memory UA',
    shortLabel: 'Space UA',
    dotClass: 'dot-space-ua',
  },
  {
    code: 'indigo',
    label: 'Indigo',
    shortLabel: 'Indigo',
    dotClass: 'dot-indigo',
    publicUrl: 'https://indigomental.pl',
  },
]

export function getProjectOption(project: ProjectCode): ProjectOption {
  return PROJECT_OPTIONS.find((item) => item.code === project) || PROJECT_OPTIONS[0]
}

export function getStoredProjectCode(): ProjectCode {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(PROJECT_STORAGE_KEY)
    if (isProjectCode(stored)) return stored
  }

  if (isProjectCode(env.VITE_DEFAULT_PROJECT)) {
    return env.VITE_DEFAULT_PROJECT
  }

  return 'space_ua'
}

export function getProjectApiUrl(project: ProjectCode): string {
  return PROJECT_API_URLS[project]
}

export function getActiveProjectApiUrl(): string {
  return getProjectApiUrl(getStoredProjectCode())
}
