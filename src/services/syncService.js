// Простой сервис синхронизации через localStorage событие
class SyncService {
  constructor() {
    this.listeners = new Map();
    this.setupListeners();
  }

  setupListeners() {
    // Слушаем изменения в localStorage
    window.addEventListener("storage", (event) => {
      if (this.listeners.has(event.key)) {
        const callbacks = this.listeners.get(event.key);
        const newValue = event.newValue ? JSON.parse(event.newValue) : null;
        callbacks.forEach((callback) => callback(newValue));
      }
    });
  }

  // Подписка на изменения ключа
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // Сохранение с синхронизацией
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Получение значения
  getItem(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
}

export const syncService = new SyncService();
