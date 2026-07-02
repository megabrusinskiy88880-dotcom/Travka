const { CONSTANTS } = require('../config/constants');
const CONSTANTS_MODULE = require('../config/constants');

/**
 * Валидирует никнейм пользователя
 * @param {string} nickname - Никнейм для проверки
 * @returns {object} { valid: boolean, error?: string }
 */
const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: CONSTANTS_MODULE.ERRORS.NICKNAME_REQUIRED };
  }

  nickname = nickname.trim();

  if (nickname.length < CONSTANTS_MODULE.NICKNAME_MIN_LENGTH || nickname.length > CONSTANTS_MODULE.NICKNAME_MAX_LENGTH) {
    return { valid: false, error: CONSTANTS_MODULE.ERRORS.NICKNAME_LENGTH };
  }

  if (!CONSTANTS_MODULE.NICKNAME_REGEX.test(nickname)) {
    return { valid: false, error: CONSTANTS_MODULE.ERRORS.INVALID_NICKNAME };
  }

  return { valid: true };
};

/**
 * Валидирует данные лота
 * @param {object} lotData - Данные лота
 * @returns {object} { valid: boolean, error?: string }
 */
const validateLotData = (lotData) => {
  const { title, price } = lotData;

  if (!title || !price) {
    return { valid: false, error: CONSTANTS_MODULE.ERRORS.TITLE_AND_PRICE_REQUIRED };
  }

  return { valid: true };
};

/**
 * Валидирует данные заказа
 * @param {object} orderData - Данные заказа
 * @returns {object} { valid: boolean, error?: string }
 */
const validateOrderData = (orderData) => {
  const { lotId, quantity } = orderData;
  const qty = parseInt(quantity, 10) || 1;

  if (!lotId || qty < 1) {
    return { valid: false, error: CONSTANTS_MODULE.ERRORS.INVALID_ORDER_DATA };
  }

  return { valid: true, quantity: qty };
};

module.exports = {
  validateNickname,
  validateLotData,
  validateOrderData
};
