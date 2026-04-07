import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../stores/notification.store'
import { APP_ENV } from '../config/env'
import type { RecruitmentBackend } from '../api/http'

/**
 * Composable для функции «Войти как ученик».
 *
 * Генерирует blob-страницу с auto-submit POST-формой,
 * которая отправляет nickname + суперпароль на `/father/login`
 * целевой платформы (Space Memory или Indigo).
 *
 * Blob-подход обходит ограничения CORS:
 *   - Обычный fetch POST был бы заблокирован CORS-политикой.
 *   - Form POST — это навигация, не AJAX, поэтому CORS не применяется.
 *   - CSRF: endpoint `/father/login` на API уровне (Laravel `api` middleware)
 *     не требует CSRF-токена. Если Blade-форма требует `_token`,
 *     form submission вернёт 419, и пользователь увидит ошибку.
 *     В этом случае нужно добавить маршрут в исключения CSRF на бэкенде.
 */
export function useLoginAsStudent() {
  const { t } = useI18n()
  const notif = useNotificationStore()

  /**
   * Определяет base URL платформы по backend-типу.
   */
  function getPlatformBaseUrl(backend: RecruitmentBackend): string {
    return backend === 'indigo'
      ? APP_ENV.platformLoginUrlIndigo
      : APP_ENV.platformLoginUrlSpace
  }

  /**
   * Определяет label платформы для тостов.
   */
  function getPlatformLabel(backend: RecruitmentBackend): string {
    return backend === 'indigo' ? 'Indigo' : 'Space Memory'
  }

  /**
   * Открывает аккаунт ученика на клиентской платформе в новой вкладке.
   *
   * @param nickname - Никнейм (или email) ученика
   * @param studentName - Имя ученика (для уведомлений)
   * @param backend - 'default' (Space Memory) или 'indigo'
   */
  function loginAsStudent(
    nickname: string,
    studentName: string,
    backend: RecruitmentBackend = 'default',
  ): void {
    const superPassword = APP_ENV.superPassword

    if (!superPassword) {
      notif.addToast(t('newStudents.panel.loginAsNoPassword'), 'error')
      return
    }

    if (!nickname) {
      notif.addToast(t('newStudents.panel.loginAsNoNickname'), 'error')
      return
    }

    const baseUrl = getPlatformBaseUrl(backend).replace(/\/+$/, '')
    const loginUrl = `${baseUrl}/father/login`
    const platformLabel = getPlatformLabel(backend)

    // Генерируем HTML-страницу с auto-submit формой
    const html = buildAutoLoginHtml(loginUrl, nickname, superPassword, platformLabel)
    const blob = new Blob([html], { type: 'text/html' })
    const blobUrl = URL.createObjectURL(blob)

    const newWindow = window.open(blobUrl, '_blank')

    // Очищаем blob URL после небольшой задержки
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000)

    if (newWindow) {
      notif.addToast(
        `🔓 ${t('newStudents.panel.loginAsOpening', { name: studentName, platform: platformLabel })}`,
        'info',
      )
    } else {
      notif.addToast(t('newStudents.panel.loginAsPopupBlocked'), 'warning')
    }
  }

  return { loginAsStudent, getPlatformLabel }
}

/**
 * Генерирует HTML-страницу, которая автоматически submit-ит
 * POST-форму с credentials на целевой login URL.
 */
function buildAutoLoginHtml(
  loginUrl: string,
  nickname: string,
  password: string,
  platformLabel: string,
): string {
  // Экранируем значения для безопасной вставки в HTML
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Login As Student — ${esc(platformLabel)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
      background: #0a0a1a;
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      color: #e2e8f0;
    }
    .card {
      text-align: center;
      padding: 40px 32px;
      background: rgba(15, 15, 35, 0.95);
      border: 1px solid rgba(79, 110, 247, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    .spinner {
      width: 40px; height: 40px; margin: 0 auto 20px;
      border: 3px solid rgba(79, 110, 247, 0.2);
      border-top-color: #4f6ef7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 13px; color: #8892b0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Вход на ${esc(platformLabel)}...</h2>
    <p>Авторизация как <strong>${esc(nickname)}</strong></p>
  </div>

  <form id="loginForm" method="POST" action="${esc(loginUrl)}" style="display:none">
    <input type="hidden" name="nickname" value="${esc(nickname)}">
    <input type="hidden" name="password" value="${esc(password)}">
  </form>

  <script>
    // Auto-submit после короткой задержки для отрисовки спиннера
    setTimeout(function() {
      document.getElementById('loginForm').submit();
    }, 300);
  </script>
</body>
</html>`
}
