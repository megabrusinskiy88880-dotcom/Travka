const express = require('express');
const router = express.Router();
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../../public');

// Главная страница
router.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Магазин
router.get('/shop', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'shop.html'));
});

// Кабинет
router.get('/cabinet', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'cabinet.html'));
});

// 404
router.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'), (err) => {
    if (err) res.status(404).send('Страница не найдена');
  });
});

module.exports = router;
