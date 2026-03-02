import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import pl from "../locales/pl.json";
import uk from "../locales/uk.json";

const SUPPORTED = ["uk", "pl", "en"] as const;
export type Locale = (typeof SUPPORTED)[number];

function detectLocale(): Locale {
  const saved = localStorage.getItem("locale") as Locale | null;
  if (saved && (SUPPORTED as readonly string[]).includes(saved)) return saved;
  const nav = (navigator.language || "en").slice(0, 2) as Locale;
  if ((SUPPORTED as readonly string[]).includes(nav)) return nav;
  return "en";
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: "en",
  messages: { en, pl, uk },
});

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale;
  localStorage.setItem("locale", locale);
}
