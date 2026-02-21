export function getApiErrorMessage(error) {
  const apiMessage = error?.response?.data?.error?.message;

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage.trim();
  }

  const status = error?.response?.status;
  const method = error?.config?.method?.toUpperCase();
  const url = error?.config?.url;

  if (status === 404 || status === 405) {
    if (method && url) {
      return `API не поддерживает эндпоинт: ${method} ${url}`;
    }
    return 'API не поддерживает запрошенный эндпоинт.';
  }

  if (status >= 500) {
    return 'Ошибка сервера. Попробуйте позже.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Превышено время ожидания ответа от API.';
  }

  return 'Не удалось выполнить запрос к API.';
}
