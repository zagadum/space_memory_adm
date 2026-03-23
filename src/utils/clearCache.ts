/**
 * Утилита для полной очистки всех видов кеша (браузерного и приложения)
 * Используйте это в DevTools console при необходимости полной очистки
 */

export function clearAllCaches() {
  console.log('🧹 Начинаю полную очистку кешей...');

  // 1. Очистка localStorage
  try {
    localStorage.clear();
    console.log('✅ localStorage очищен');
  } catch (e) {
    console.warn('⚠️ Не удалось очистить localStorage:', e);
  }

  // 2. Очистка sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage очищен');
  } catch (e) {
    console.warn('⚠️ Не удалось очистить sessionStorage:', e);
  }

  // 3. Очистка cookies (удалить все)
  try {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    console.log('✅ Cookies очищены');
  } catch (e) {
    console.warn('⚠️ Не удалось очистить cookies:', e);
  }

  // 4. Очистка Service Worker кеша (если есть)
  if ('caches' in window) {
    try {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
      console.log('✅ Service Worker кеш очищен');
    } catch (e) {
      console.warn('⚠️ Не удалось очистить Service Worker кеш:', e);
    }
  }

  // 5. Очистка IndexedDB
  if ('indexedDB' in window) {
    try {
      const dbNames = [];
      const request = indexedDB.databases?.();
      if (request) {
        request.then((dbs) => {
          dbs.forEach((db) => {
            indexedDB.deleteDatabase(db.name);
          });
        });
      }
      console.log('✅ IndexedDB очищен');
    } catch (e) {
      console.warn('⚠️ Не удалось очистить IndexedDB:', e);
    }
  }

  console.log('✨ Полная очистка кешей завершена!');
  console.log('💡 Совет: Перезагрузите страницу (Ctrl+F5 или Cmd+Shift+R) для применения изменений');
}

// Экспортируем в глобальный scope для использования в DevTools console
if (typeof window !== 'undefined') {
  (window as any).__clearAllCaches = clearAllCaches;
}

export default clearAllCaches;

