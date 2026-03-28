import { AxiosError } from "axios";

/**
 * Парсит ошибку от API (Axios или стандартную) и возвращает user-friendly сообщение.
 * Избавляет от необходимости использовать `catch (error: any)`.
 *
 * @param e - Оригинальная ошибка
 * @param fallback - Запасное сообщение
 * @returns Строка с понятным описанием ошибки
 */
export function parseApiError(e: unknown, fallback = "Произошла ошибка связи с сервером"): string {
  if (e && typeof e === "object") {
    // 1. Проверяем на Timeout / Network Error (ECONNABORTED)
    const err = e as { code?: string; message?: string; response?: any };
    if (err.code === "ECONNABORTED" || err.message?.toLowerCase().includes("timeout")) {
      return "Большая нагрузка на сервер. Пожалуйста, повторите попытку через несколько секунд.";
    }

    // 2. Проверяем структуру Laravel Axios Response (422, 500, 400 и т.д.)
    if ("isAxiosError" in e && e.isAxiosError) {
      const axiosError = e as AxiosError<any>;
      const responseData = axiosError.response?.data;
      
      // Ищем стандартное Laravel-сообщение об ошибке
      if (responseData && typeof responseData === "object") {
        if ("message" in responseData && typeof responseData.message === "string" && responseData.message) {
          // Если это 422 и есть детальные ошибки валидации, можно их склеить (опционально)
          // if (responseData.errors && typeof responseData.errors === 'object') { ... }
          return responseData.message;
        }
      }
      if (axiosError.message) {
        return axiosError.message;
      }
    } else if ("response" in err && err.response?.data?.message) {
      // Фоллбек на случай, если AxiosError.isAxiosError === false (legacy)
      return err.response.data.message;
    }
  }

  // 3. Стандартная Javascript Ошибка
  if (e instanceof Error && e.message) {
    return e.message;
  }

  // 4. Текстовая ошибка (throw "String")
  if (typeof e === "string") {
    return e;
  }

  return fallback;
}
