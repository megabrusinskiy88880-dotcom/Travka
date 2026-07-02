const db = require('../db');
const { processImage, deleteImage } = require('../utils/imageProcessor');
const { validateLotData } = require('../utils/validators');
const CONSTANTS = require('../config/constants');

/**
 * Получить все лоты (для админки)
 */
const getAllLots = () => {
  const data = db.read();
  return data.lots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Получить активные лоты (для пользователей)
 */
const getActiveLots = () => {
  const data = db.read();
  return data.lots
    .filter(l => l.active)
    .map(({ id, title, price, description, quantity, photo }) => ({
      id,
      title,
      price,
      description,
      quantity,
      photo
    }));
};

/**
 * Создать новый лот
 */
const createLot = async (lotData, photoBuffer) => {
  const validation = validateLotData(lotData);
  if (!validation.valid) {
    throw { status: 400, message: validation.error };
  }

  const { title, price, description, quantity } = lotData;

  let photoPath = null;
  if (photoBuffer) {
    photoPath = await processImage(photoBuffer);
  }

  const data = db.read();
  const lot = {
    id: db.genId(CONSTANTS.ID_PREFIXES.LOT),
    title: String(title).trim(),
    price: Number(price) || 0,
    description: String(description || '').trim(),
    quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 1,
    photo: photoPath,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.lots.push(lot);
  await db.write(data);

  return lot;
};

/**
 * Обновить лот
 */
const updateLot = async (lotId, updates, photoBuffer) => {
  const data = db.read();
  const lot = data.lots.find(l => l.id === lotId);

  if (!lot) {
    throw { status: 404, message: CONSTANTS.ERRORS.LOT_NOT_FOUND };
  }

  const { title, price, description, quantity, active } = updates;

  if (title !== undefined) lot.title = String(title).trim();
  if (price !== undefined) lot.price = Number(price) || 0;
  if (description !== undefined) lot.description = String(description).trim();
  if (quantity !== undefined) lot.quantity = Number(quantity) || 0;
  if (active !== undefined) lot.active = active === 'true' || active === true;

  if (photoBuffer) {
    const newPhotoPath = await processImage(photoBuffer);
    if (lot.photo) {
      deleteImage(lot.photo);
    }
    lot.photo = newPhotoPath;
  }

  lot.updatedAt = new Date().toISOString();
  await db.write(data);

  return lot;
};

/**
 * Удалить лот
 */
const deleteLot = async (lotId) => {
  const data = db.read();
  const idx = data.lots.findIndex(l => l.id === lotId);

  if (idx === -1) {
    throw { status: 404, message: CONSTANTS.ERRORS.LOT_NOT_FOUND };
  }

  const [removed] = data.lots.splice(idx, 1);

  if (removed.photo) {
    deleteImage(removed.photo);
  }

  await db.write(data);
};

module.exports = {
  getAllLots,
  getActiveLots,
  createLot,
  updateLot,
  deleteLot
};
