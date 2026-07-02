const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const config = require('./src/config/env');
const CONSTANTS = require('./src/config/constants');
const errorHandler = require('./src/middleware/errorHandler');
const setupRoutes = require('./src/routes');

const app = express();
const PORT = config.PORT;

// Middleware
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CONSTANTS.SESSION_MAX_AGE
  }
}));

// Static files
const UPLOAD_DIR = path.join(__dirname, config.UPLOAD_DIR);
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Routes
setupRoutes(app, config);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📝 Секретный путь админки: /${config.ADMIN_PATH}`);

  if (config.ADMIN_PATH === 'admin-portal-7f3k9x2m') {
    console.log('⚠️  ADMIN_PATH использует значение по умолчанию. Задайте свой в переменных окружения!');
  }
  if (config.ADMIN_PASSWORD === 'change-me-please') {
    console.log('⚠️  ADMIN_PASSWORD использует значение по умолчанию. Обязательно задайте свой!');
  }
  if (config.SESSION_SECRET === 'insecure-dev-secret-change-in-railway') {
    console.log('⚠️  SESSION_SECRET использует значение по умолчанию. Обязательно задайте свой для production!');
  }
});
