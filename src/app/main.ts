import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./router";
import { i18n } from "./i18n";
import { setupCriticalRoutePreload } from "./preloadRoutes";
import App from "./App.vue";
import "../styles/base.css";
import "../styles/layout.css";

createApp(App).use(createPinia()).use(router).use(i18n).mount("#app");

setupCriticalRoutePreload(router);

