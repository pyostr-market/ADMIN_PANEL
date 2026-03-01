import { useEffect } from 'react';

/**
 * Хук для отслеживания кликов вне указанных элементов
 * @param {Array} refs - Массив ref объектов или DOM элементов
 * @param {Function} handler - Callback при клике вне элементов
 */
export function useClickOutside(refs, handler) {
  useEffect(() => {
    function handleClick(event) {
      const isOutside = refs.every((ref) => {
        if (!ref) return true;
        
        // Если ref - это объект с current
        if ('current' in ref) {
          return ref.current && !ref.current.contains(event.target);
        }
        
        // Если ref - это DOM элемент
        return ref && !ref.contains(event.target);
      });

      if (isOutside) {
        handler(event);
      }
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [refs, handler]);
}
