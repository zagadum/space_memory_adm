function parseBooleanEnv(value: string | undefined, defaultValue = false): boolean {
  if (value == null) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

// Temporary bypass: when enabled, all authenticated users get full app access.
export const AUTHZ_BYPASS = parseBooleanEnv(import.meta.env.VITE_AUTHZ_BYPASS, true);
