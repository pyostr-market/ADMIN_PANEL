/**
 * Выполняет функцию с повторными попытками при ошибке
 * @param {Function} fn - Асинхронная функция для выполнения
 * @param {number} maxRetries - Максимальное количество попыток (по умолчанию 3)
 * @param {number} delay - Задержка между попытками в мс (по умолчанию 1000)
 * @returns {Promise<any>} Результат выполнения функции
 */
export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Не повторяем при 404 и 405 — эндпоинт не существует
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        throw error;
      }

      // Если это последняя попытка — выбрасываем ошибку
      if (attempt === maxRetries) {
        throw error;
      }

      // Ждем перед следующей попыткой
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
