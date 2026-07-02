const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-please';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Разрешены только изображения'));
  }
});

// Вход в админку по паролю
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Неверный пароль' });
});

router.post('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// --- ЛОТЫ ---

router.get('/lots', requireAdmin, (req, res) => {
  const data = db.read();
  res.json(data.lots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/lots', requireAdmin, upload.single('photo'), async (req, res) => {
  const { title, price, description, quantity } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: 'Название и цена обязательны' });
  }

  let photoPath = null;
  if (req.file) {
    const filename = db.genId('img') + '.webp';
    await sharp(req.file.buffer)
      .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(UPLOAD_DIR, filename));
    photoPath = '/uploads/' + filename;
  }

  const data = db.read();
  const lot = {
    id: db.genId('lot'),
    title: String(title).trim(),
    price: Number(price) || 0,
    description: String(description || '').trim(),
    quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 1,
    photo: photoPath,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.lots.push(lot);
  await db.write(data);
  res.json({ ok: true, lot });
});

router.put('/lots/:id', requireAdmin, upload.single('photo'), async (req, res) => {
  const data = db.read();
  const lot = data.lots.find(l => l.id === req.params.id);
  if (!lot) return res.status(404).json({ error: 'Лот не найден' });

  const { title, price, description, quantity, active } = req.body;
  if (title !== undefined) lot.title = String(title).trim();
  if (price !== undefined) lot.price = Number(price) || 0;
  if (description !== undefined) lot.description = String(description).trim();
  if (quantity !== undefined) lot.quantity = Number(quantity) || 0;
  if (active !== undefined) lot.active = active === 'true' || active === true;

  if (req.file) {
    const filename = db.genId('img') + '.webp';
    await sharp(req.file.buffer)
      .resize(900, 900, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(UPLOAD_DIR, filename));

    if (lot.photo) {
      const oldFilename = path.basename(lot.photo);
      fs.unlink(path.join(UPLOAD_DIR, oldFilename), () => {});
    }
    lot.photo = '/uploads/' + filename;
  }

  lot.updatedAt = new Date().toISOString();
  await db.write(data);
  res.json({ ok: true, lot });
});

router.delete('/lots/:id', requireAdmin, async (req, res) => {
  const data = db.read();
  const idx = data.lots.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Лот не найден' });

  const [removed] = data.lots.splice(idx, 1);
  if (removed.photo) {
    const filename = path.basename(removed.photo);
    fs.unlink(path.join(UPLOAD_DIR, filename), () => {});
  }
  await db.write(data);
  res.json({ ok: true });
});

// --- ЗАКАЗЫ ---

router.get('/orders', requireAdmin, (req, res) => {
  const data = db.read();
  res.json(data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.put('/orders/:id', requireAdmin, async (req, res) => {
  const data = db.read();
  const order = data.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });

  const { status, coords, adminNote } = req.body;

  // При подтверждении заказа со статусом confirmed/completed — списываем товар один раз
  if (status && status !== order.status) {
    if ((status === 'confirmed' || status === 'completed') &&
        !['confirmed', 'completed'].includes(order.status)) {
      const lot = data.lots.find(l => l.id === order.lotId);
      if (lot) {
        lot.quantity = Math.max(0, lot.quantity - order.quantity);
      }
    }
    order.status = status;
  }

  if (coords !== undefined) order.coords = String(coords).trim();
  if (adminNote !== undefined) order.adminNote = String(adminNote).trim();
  order.updatedAt = new Date().toISOString();

  await db.write(data);
  res.json({ ok: true, order });
});

// --- ПОЛЬЗОВАТЕЛИ (для справки в админке) ---
router.get('/users', requireAdmin, (req, res) => {
  const data = db.read();
  res.json(data.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

module.exports = router;
