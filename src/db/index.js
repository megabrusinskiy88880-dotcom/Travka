const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const DB_PATH = path.join(__dirname, '../../', config.DB_PATH);

// Простая очередь записи, чтобы параллельные запросы не затирали друг друга
let writeQueue = Promise.resolve();

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ lots: [], orders: [], users: [] }, null, 2));
  }
}

function read() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    parsed.lots = parsed.lots || [];
    parsed.orders = parsed.orders || [];
    parsed.users = parsed.users || [];
    return parsed;
  } catch (e) {
    console.error('Ошибка при чтении БД:', e);
    return { lots: [], orders: [], users: [] };
  }
}

function write(data) {
  writeQueue = writeQueue.then(() => {
    return new Promise((resolve, reject) => {
      const tmpPath = DB_PATH + '.tmp';
      fs.writeFile(tmpPath, JSON.stringify(data, null, 2), (err) => {
        if (err) return reject(err);
        fs.rename(tmpPath, DB_PATH, (err2) => {
          if (err2) return reject(err2);
          resolve();
        });
      });
    });
  });
  return writeQueue;
}

function genId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = { read, write, genId, DB_PATH };
