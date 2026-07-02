const db = require('../db');
const { validateOrderData } = require('../utils/validators');
const CONSTANTS = require('../config/constants');

/**
 * Получить все заказы (для админки)
 */
const getAllOrders = () => {
  const data = db.read();
  return data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Получить заказы пользователя
 */
const getUserOrders = (nickname) => {
  const data = db.read();
  return data.orders
    .filter(o => o.nickname.toLowerCase() === nickname.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Создать новый заказ
 */
const createOrder = async (nickname, orderData) => {
  const validation = validateOrderData(orderData);
  if (!validation.valid) {
    throw { status: 400, message: validation.error };
  }

  const { lotId } = orderData;
  const qty = validation.quantity;

  const data = db.read();
  const lot = data.lots.find(l => l.id === lotId && l.active);

  if (!lot) {
    throw { status: 404, message: CONSTANTS.ERRORS.LOT_NOT_FOUND };
  }

  if (lot.quantity < qty) {
    throw { status: 400, message: CONSTANTS.ERRORS.INSUFFICIENT_STOCK };
  }

  const order = {
    id: db.genId(CONSTANTS.ID_PREFIXES.ORDER),
    nickname,
    lotId: lot.id,
    lotTitle: lot.title,
    price: lot.price,
    quantity: qty,
    status: CONSTANTS.ORDER_STATUSES.PENDING,
    coords: null,
    adminNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.orders.push(order);
  await db.write(data);

  return order;
};

/**
 * Обновить заказ
 */
const updateOrder = async (orderId, updates) => {
  const data = db.read();
  const order = data.orders.find(o => o.id === orderId);

  if (!order) {
    throw { status: 404, message: CONSTANTS.ERRORS.ORDER_NOT_FOUND };
  }

  const { status, coords, adminNote } = updates;

  // При подтверждении заказа со статусом confirmed/completed — списываем товар один раз
  if (status && status !== order.status) {
    const isConfirming =
      (status === CONSTANTS.ORDER_STATUSES.CONFIRMED || status === CONSTANTS.ORDER_STATUSES.COMPLETED) &&
      ![CONSTANTS.ORDER_STATUSES.CONFIRMED, CONSTANTS.ORDER_STATUSES.COMPLETED].includes(order.status);

    if (isConfirming) {
      const lot = data.lots.find(l => l.id === order.lotId);
      if (lot) {
        lot.quantity = Math.max(0, lot.quantity - order.quantity);
      }
    }

    order.status = status;
  }

  if (coords !== undefined) order.coords = String(coords).trim();
  if (adminNote !== undefined) order.adminNote = String(adminNote).trim();
  order.updatedAt = new Date().toISOString();

  await db.write(data);

  return order;
};

module.exports = {
  getAllOrders,
  getUserOrders,
  createOrder,
  updateOrder
};
