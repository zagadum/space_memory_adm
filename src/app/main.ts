import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import { i18n } from "./i18n";
import { setupCriticalRoutePreload } from "./preloadRoutes";
import App from "./App.vue";
import "../styles/base.css";
import "../styles/layout.css";
import { clearAllCaches } from "../utils/clearCache";

createApp(App).use(createPinia()).use(router).use(i18n).mount("#app");

setupCriticalRoutePreload(router);

// Делаем функцию очистки кеша доступной в DevTools console
if (import.meta.env.DEV) {
  (window as any).__clearAllCaches = clearAllCaches;
}

