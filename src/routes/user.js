const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/auth');
const userService = require('../services/userService');
const lotService = require('../services/lotService');
const orderService = require('../services/orderService');
const CONSTANTS = require('../config/constants');

// Вход по нику — без пароля. Если ника нет в базе, создаём профиль.
router.post('/login', async (req, res, next) => {
  try {
    const { nickname } = req.body;
    const user = await userService.getOrCreateUser(nickname);

    req.session.nickname = user.nickname;
    req.session.userId = user.id;
    res.json({ ok: true, nickname: user.nickname });
  } catch (err) {
    next(err);
  }
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
router.get('/lots', requireUser, (req, res, next) => {
  try {
    const activeLots = lotService.getActiveLots();
    res.json(activeLots);
  } catch (err) {
    next(err);
  }
});

// Создать заказ (заявку) на лот
router.post('/orders', requireUser, async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.session.nickname, req.body);
    res.json({ ok: true, order });
  } catch (err) {
    next(err);
  }
});

// Мои заказы (кабинет)
router.get('/orders/mine', requireUser, (req, res, next) => {
  try {
    const myOrders = orderService.getUserOrders(req.session.nickname);
    res.json(myOrders);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
