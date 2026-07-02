// Middleware для обработки ошибок

const errorHandler = (err, req, res, next) => {
  console.error('Ошибка:', err);

  if (err.message === 'Разрешены только изображения') {
    return res.status(400).json({ error: err.message });
  }

  if (err.status === 413) {
    return res.status(413).json({ error: 'Файл слишком большой' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера'
  });
};

module.exports = errorHandler;
