function requireUser(req, res, next) {
  if (req.session && req.session.nickname) {
    return next();
  }
  return res.status(401).json({ error: 'Нужно войти по нику' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: 'Нужна авторизация админа' });
}

module.exports = { requireUser, requireAdmin };
