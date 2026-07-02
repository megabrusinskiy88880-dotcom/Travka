const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireUser } = require('../middleware/auth');

// Вход по нику — без пароля. Если ника нет в базе, создаём профиль.
router.post('/login', async (req, res) => {
  let { nickname } = req.body;
  if (!nickname || typeof nickname !== 'string') {
    return res.status(400).json({ error: 'Введите ник' });
  }
  nickname = nickname.trim();
  if (nickname.length < 3 || nickname.length > 16) {
    return res.status(400).json({ error: 'Ник должен быть от 3 до 16 символов' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
    return res.status(400).json({ error: 'Ник может содержать только латинские буквы, цифры и _' });
  }

  const data = db.read();
  let user = data.users.find(u => u.nickname.toLowerCase() === nickname.toLowerCase());
  if (!user) {
    user = {
      id: db.genId('user'),
      nickname,
      createdAt: new Date().toISOString()
    };
    data.users.push(user);
    await db.write(data);
  }

  req.session.nickname = user.nickname;
  req.session.userId = user.id;
  res.json({ ok: true, nickname: user.nickname });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.nickname) {
    return res.json({ loggedIn: true, nickname: req.session.nickname });
  }
  res.json({ loggedIn: false });
});

// Список активных лотов (публично видно только вошедшим по нику)
router.get('/lots', requireUser, (req, res) => {
  const data = db.read();
  const activeLots = data.lots
    .filter(l => l.active)
    .map(({ id, title, price, description, quantity, photo }) => ({
      id, title, price, description, quantity, photo
    }));
  res.json(activeLots);
});

// Создать заказ (заявку) на лот
router.post('/orders', requireUser, async (req, res) => {
  const { lotId, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;
  if (!lotId || qty < 1) {
    return res.status(400).json({ error: 'Некорректные данные заказа' });
  }

  const data = db.read();
  const lot = data.lots.find(l => l.id === lotId && l.active);
  if (!lot) {
    return res.status(404).json({ error: 'Лот не найден' });
  }
  if (lot.quantity < qty) {
    return res.status(400).json({ error: 'Недостаточно товара в наличии' });
  }

  const order = {
    id: db.genId('order'),
    nickname: req.session.nickname,
    lotId: lot.id,
    lotTitle: lot.title,
    price: lot.price,
    quantity: qty,
    status: 'pending', // pending -> confirmed -> completed / cancelled
    coords: null,
    adminNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.orders.push(order);
  await db.write(data);
  res.json({ ok: true, order });
});

// Мои заказы (кабинет)
router.get('/orders/mine', requireUser, (req, res) => {
  const data = db.read();
  const myOrders = data.orders
    .filter(o => o.nickname.toLowerCase() === req.session.nickname.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myOrders);
});

module.exports = router;
