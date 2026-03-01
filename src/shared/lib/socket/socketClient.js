export class SocketClient {
  constructor() {
    this.handlers = new Map();
    this.connected = false;
  }

  connect() {
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
    this.handlers.clear();
  }

  subscribe(event, callback) {
    const callbacks = this.handlers.get(event) ?? new Set();
    callbacks.add(callback);
    this.handlers.set(event, callbacks);

    return () => {
      const nextCallbacks = this.handlers.get(event);

      if (!nextCallbacks) {
        return;
      }

      nextCallbacks.delete(callback);

      if (nextCallbacks.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  emit(event, payload) {
    const callbacks = this.handlers.get(event);

    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback) => callback(payload));
  }
}
