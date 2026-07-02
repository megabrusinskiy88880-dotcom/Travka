// Константы приложения
module.exports = {
  // Валидация
  NICKNAME_MIN_LENGTH: 3,
  NICKNAME_MAX_LENGTH: 16,
  NICKNAME_REGEX: /^[a-zA-Z0-9_]+$/,

  // Файлы
  MAX_FILE_SIZE: 8 * 1024 * 1024, // 8MB
  ALLOWED_IMAGE_TYPES: /^image\/(jpeg|png|webp|gif)$/,
  IMAGE_RESIZE_WIDTH: 900,
  IMAGE_RESIZE_HEIGHT: 900,
  IMAGE_QUALITY: 82,

  // Сессия
  SESSION_MAX_AGE: 1000 * 60 * 60 * 24 * 14, // 14 дней

  // ID префиксы
  ID_PREFIXES: {
    USER: 'user',
    LOT: 'lot',
    ORDER: 'order',
    IMAGE: 'img'
  },

  // Статусы заказов
  ORDER_STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Ошибки
  ERRORS: {
    INVALID_NICKNAME: 'Ник может содержать только латинские буквы, цифры и _',
    NICKNAME_LENGTH: 'Ник должен быть от 3 до 16 символов',
    NICKNAME_REQUIRED: 'Введите ник',
    INVALID_FILE: 'Разрешены только изображения',
    LOT_NOT_FOUND: 'Лот не найден',
    ORDER_NOT_FOUND: 'Заказ не найден',
    INSUFFICIENT_STOCK: 'Недостаточно товара в наличии',
    INVALID_ORDER_DATA: 'Некорректные данные заказа',
    TITLE_AND_PRICE_REQUIRED: 'Название и цена обязательны',
    INVALID_PASSWORD: 'Неверный пароль'
  }
};
