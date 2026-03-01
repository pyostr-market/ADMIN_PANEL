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

  console.log('[uploadApi] Отправка файла:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder,
    originalFilename,
  });

  try {
    const response = await productApi.post('/upload/', formData, {
      timeout: UPLOAD_TIMEOUT,
      signal: abortSignal,
      // Важно: не устанавливаем Content-Type вручную для FormData
      // Axios должен сам установить 'multipart/form-data' с boundary
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    console.log('Отправка в S3 2', response.data);
    return response.data?.data ?? response.data;

  } catch (error) {
    console.error('[uploadApi] Ошибка загрузки файла:', error);
    throw error;
  }
}

/**
 * Получение информации о загруженном файле по upload_id
 * @param {number} uploadId - ID загруженного файла
 */
export async function getUploadInfoRequest(uploadId) {
  const response = await productApi.get(`/upload/${uploadId}`);
  return response.data?.data ?? response.data;
}
