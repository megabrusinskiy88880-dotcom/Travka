const adminRoutes = require('./admin');
const userRoutes = require('./user');

const setupRoutes = (app, config) => {
  // API маршруты
  app.use('/api/admin', adminRoutes);
  app.use('/api/user', userRoutes);

  // Отдаём путь секретной админки как отдельную статичную страницу
  const path = require('path');
  app.get(`/${config.ADMIN_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'admin.html'));
  });

  // Публичные страницы (должна быть последней)
  const pagesRoutes = require('./pages');
  app.use(pagesRoutes);
};

module.exports = setupRoutes;
