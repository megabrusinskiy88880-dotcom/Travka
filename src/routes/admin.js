const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAdmin } = require('../middleware/auth');
const config = require('../config/env');
const CONSTANTS = require('../config/constants');
const lotService = require('../services/lotService');
const orderService = require('../services/orderService');
const userService = require('../services/userService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CONSTANTS.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (CONSTANTS.ALLOWED_IMAGE_TYPES.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(CONSTANTS.ERRORS.INVALID_FILE));
    }
  }
});

// Вход в админку по паролю
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password && password === config.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: CONSTANTS.ERRORS.INVALID_PASSWORD });
});

router.post('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// --- ЛОТЫ ---

router.get('/lots', requireAdmin, (req, res, next) => {
  try {
    const lots = lotService.getAllLots();
    res.json(lots);
  } catch (err) {
    next(err);
  }
});

router.post('/lots', requireAdmin, upload.single('photo'), async (req, res, next) => {
  try {
    const lot = await lotService.createLot(req.body, req.file?.buffer);
    res.json({ ok: true, lot });
  } catch (err) {
    next(err);
  }
});

router.put('/lots/:id', requireAdmin, upload.single('photo'), async (req, res, next) => {
  try {
    const lot = await lotService.updateLot(req.params.id, req.body, req.file?.buffer);
    res.json({ ok: true, lot });
  } catch (err) {
    next(err);
  }
});

router.delete('/lots/:id', requireAdmin, async (req, res, next) => {
  try {
    await lotService.deleteLot(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- ЗАКАЗЫ ---

router.get('/orders', requireAdmin, (req, res, next) => {
  try {
    const orders = orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.put('/orders/:id', requireAdmin, async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    res.json({ ok: true, order });
  } catch (err) {
    next(err);
  }
});

// --- ПОЛЬЗОВАТЕЛИ ---

router.get('/users', requireAdmin, (req, res, next) => {
  try {
    const users = userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
