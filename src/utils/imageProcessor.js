const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const CONSTANTS = require('../config/constants');
const config = require('../config/env');

/**
 * Обрабатывает загруженное изображение
 * @param {Buffer} buffer - Буфер изображения
 * @returns {Promise<string>} Путь к сохраненному файлу
 */
const processImage = async (buffer) => {
  const UPLOAD_DIR = path.join(__dirname, '../../', config.UPLOAD_DIR);

  // Убедиться, что директория существует
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const filename = db.genId('img') + '.webp';
  const filepath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .resize(CONSTANTS.IMAGE_RESIZE_WIDTH, CONSTANTS.IMAGE_RESIZE_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: CONSTANTS.IMAGE_QUALITY })
    .toFile(filepath);

  return '/uploads/' + filename;
};

/**
 * Удаляет старое изображение
 * @param {string} photoPath - Путь к изображению (например, '/uploads/img_xxx.webp')
 */
const deleteImage = (photoPath) => {
  if (!photoPath) return;

  const UPLOAD_DIR = path.join(__dirname, '../../', config.UPLOAD_DIR);
  const filename = path.basename(photoPath);
  const filepath = path.join(UPLOAD_DIR, filename);

  fs.unlink(filepath, (err) => {
    if (err) console.error('Ошибка при удалении файла:', err);
  });
};

module.exports = { processImage, deleteImage };
