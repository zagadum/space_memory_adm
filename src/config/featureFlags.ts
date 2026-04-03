import { APP_ENV } from './env'

// Temporary bypass: when enabled, all authenticated users get full app access.
export const AUTHZ_BYPASS = APP_ENV.authzBypass;
