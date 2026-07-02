// Middleware для проверки авторизации

/**
 * Проверяет, что пользователь является администратором
 */
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Доступ запрещен' });
};

/**
 * Проверяет, что пользователь вошел под ником
 */
const requireUser = (req, res, next) => {
  if (req.session && req.session.nickname) {
    return next();
  }
  res.status(401).json({ error: 'Необходима авторизация' });
};

module.exports = { requireAdmin, requireUser };
