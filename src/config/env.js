// Конфигурация переменных окружения
module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_PATH: process.env.ADMIN_PATH || 'admin-portal-7f3k9x2m',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'change-me-please',
  SESSION_SECRET: process.env.SESSION_SECRET || 'insecure-dev-secret-change-in-railway',
  DB_PATH: process.env.DB_PATH || 'data/db.json',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'public/uploads'
};
