import { productApi } from './http';

const UPLOAD_TIMEOUT = 30000; // 30 секунд таймаут (увеличено для отладки)

/**
 * Загрузка файла на сервер
 * @param {File} file - Файл для загрузки
 * @param {string} folder - Папка для файла (products, categories, manufacturers, etc.)
 * @param {string | null} originalFilename - Исходное имя файла (опционально)
 * @param {Function} onProgress - Callback для отслеживания прогресса (0-100)
 * @param {AbortSignal} abortSignal - Сигнал для отмены загрузки
 */
export async function uploadFileRequest(
  file,
  folder,
  {
    originalFilename = null,
    onProgress = null,
    abortSignal = null,
  } = {}
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (originalFilename) {
    formData.append('original_filename', originalFilename);
  }

  const response = await productApi.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: UPLOAD_TIMEOUT,
    signal: abortSignal,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data?.data ?? response.data;
}

/**
 * Получение информации о загруженном файле по upload_id
 * @param {number} uploadId - ID загруженного файла
 */
export async function getUploadInfoRequest(uploadId) {
  const response = await productApi.get(`/upload/${uploadId}`);
  return response.data?.data ?? response.data;
}
