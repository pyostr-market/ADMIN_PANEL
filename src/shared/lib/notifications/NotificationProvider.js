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
  const removeToastRef = useRef(null);
  const clearToastsRef = useRef(null);
  const infoRef = useRef(null);
  const errorRef = useRef(null);
  const mailRef = useRef(null);
  const eventRef = useRef(null);
  const warningRef = useRef(null);

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
      removeToastRef.current?.(id);
    }, payload.lifetimeMs);

    timersRef.current.set(id, timeoutId);
    return id;
  }, []);

  // Keep the ref updated with the latest pushToast function
  pushToastRef.current = pushToast;

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  // Stabilized notification methods using refs to avoid recreating functions
  const info = useCallback((message, options = {}) => {
    pushToastRef.current?.({ ...options, type: 'info', message });
  }, []);
  const error = useCallback((message, options = {}) => {
    pushToastRef.current?.({ ...options, type: 'error', message });
  }, []);
  const mail = useCallback((message, options = {}) => {
    pushToastRef.current?.({ ...options, type: 'mail', message });
  }, []);
  const event = useCallback((message, options = {}) => {
    pushToastRef.current?.({ ...options, type: 'event', message });
  }, []);
  const warning = useCallback((message, options = {}) => {
    pushToastRef.current?.({ ...options, type: 'warning', message });
  }, []);

  // Update refs to always point to the latest functions
  removeToastRef.current = removeToast;
  clearToastsRef.current = clearToasts;
  infoRef.current = info;
  errorRef.current = error;
  mailRef.current = mail;
  eventRef.current = event;
  warningRef.current = warning;

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
      pushToast: pushToastRef.current,
      removeToast: removeToastRef.current,
      clearToasts: clearToastsRef.current,
      info: infoRef.current,
      error: errorRef.current,
      mail: mailRef.current,
      event: eventRef.current,
      warning: warningRef.current,
    }),
    [toasts],
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
