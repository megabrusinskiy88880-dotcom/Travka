const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Секретный путь в админку. По умолчанию сложный, но лучше задать свой в Railway (ADMIN_PATH).
const ADMIN_PATH = process.env.ADMIN_PATH || 'admin-portal-7f3k9x2m';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-change-in-railway';

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 14 // 14 дней
  }
}));

// Отдаём загруженные фото и статику.
// Если задан UPLOAD_DIR (например, точка монтирования Railway Volume), фото раздаются оттуда.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// API
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Отдаём путь секретной админки как отдельную статичную страницу
app.get(`/${ADMIN_PATH}`, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Публичные страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});
app.get('/cabinet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cabinet.html'));
});

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), (err) => {
    if (err) res.status(404).send('Страница не найдена');
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Секретный путь админки: /${ADMIN_PATH}`);
  if (!process.env.ADMIN_PATH) {
    console.log('⚠️  ADMIN_PATH не задан в переменных окружения — используется путь по умолчанию. Задайте свой в Railway!');
  }
  if (!process.env.ADMIN_PASSWORD) {
    console.log('⚠️  ADMIN_PASSWORD не задан — используется пароль по умолчанию. Обязательно задайте свой в Railway!');
  }
});
