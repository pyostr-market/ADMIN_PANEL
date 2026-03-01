export function getApiErrorMessage(error) {
  // Пробуем разные варианты извлечения сообщения об ошибке
  const responseData = error?.response?.data;
  
  // Вариант 1: error.response.data.error.message
  const apiMessage = responseData?.error?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage.trim();
  }

  // Вариант 2: error.response.data.message
  const directMessage = responseData?.message;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage.trim();
  }

  // Вариант 3: error.response.data (если это строка)
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim();
  }

  // Вариант 4: error.response.data.data.error.message (вложенная структура)
  const nestedMessage = responseData?.data?.error?.message;
  if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
    return nestedMessage.trim();
  }

  // Вариант 5: error.message (если это не стандартная ошибка axios)
  if (error?.message && !error?.response) {
    return error.message;
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

  if (status === 409) {
    return 'Конфликт данных. Возможно, запись уже существует.';
  }

  if (status >= 500) {
    return 'Ошибка сервера. Попробуйте позже.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Превышено время ожидания ответа от API.';
  }
  console.log(error)
  return 'Не удалось выполнить запрос к API.';
}
