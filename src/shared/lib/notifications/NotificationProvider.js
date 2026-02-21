import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from '../socket/SocketProvider';

const NotificationContext = createContext(null);
const DEFAULT_TOAST_LIFETIME_MS = 5000;

function toToastType(rawType) {
  const type = typeof rawType === 'string' ? rawType.toLowerCase() : 'info';
  if (['info', 'error', 'mail', 'event', 'warning'].includes(type)) {
    return type;
  }
  return 'info';
}

export function NotificationProvider({ children }) {
  const socket = useSocket();
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const pushToastRef = useRef(null);

  const removeToast = useCallback((toastId) => {
    const timerId = timersRef.current.get(toastId);
    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(toastId);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = toast?.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const lifetime = Number.isFinite(toast?.lifetimeMs) ? toast.lifetimeMs : DEFAULT_TOAST_LIFETIME_MS;
    const payload = {
      id,
      type: toToastType(toast?.type),
      message: typeof toast?.message === 'string' && toast.message.trim()
        ? toast.message.trim()
        : 'Новое уведомление',
      lifetimeMs: lifetime,
      createdAt: Date.now(),
    };

    setToasts((prev) => [payload, ...prev].slice(0, 20));

    const timeoutId = window.setTimeout(() => {
      removeToast(id);
    }, payload.lifetimeMs);

    timersRef.current.set(id, timeoutId);
    return id;
  }, [removeToast]);

  // Keep the ref updated with the latest pushToast function
  pushToastRef.current = pushToast;

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const info = useCallback((message, options = {}) => (
    pushToast({ ...options, type: 'info', message })
  ), [pushToast]);
  const error = useCallback((message, options = {}) => (
    pushToast({ ...options, type: 'error', message })
  ), [pushToast]);
  const mail = useCallback((message, options = {}) => (
    pushToast({ ...options, type: 'mail', message })
  ), [pushToast]);
  const event = useCallback((message, options = {}) => (
    pushToast({ ...options, type: 'event', message })
  ), [pushToast]);
  const warning = useCallback((message, options = {}) => (
    pushToast({ ...options, type: 'warning', message })
  ), [pushToast]);

  useEffect(() => {
    const unsubscribe = socket.subscribe('notification', (notification) => {
      if (pushToastRef.current) {
        pushToastRef.current({
          type: notification?.type ?? notification?.level ?? 'event',
          message: notification?.message ?? notification?.text ?? 'Новое событие',
          lifetimeMs: notification?.lifetime_ms,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [socket]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    },
    [],
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
      clearToasts,
      info,
      error,
      mail,
      event,
      warning,
    }),
    [clearToasts, error, event, info, mail, pushToast, removeToast, toasts, warning],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }

  return context;
}
