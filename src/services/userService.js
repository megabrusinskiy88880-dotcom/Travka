const db = require('../db');
const { validateNickname } = require('../utils/validators');
const CONSTANTS = require('../config/constants');

/**
 * Получить или создать пользователя
 */
const getOrCreateUser = async (nickname) => {
  const validation = validateNickname(nickname);
  if (!validation.valid) {
    throw { status: 400, message: validation.error };
  }

  const cleanNickname = nickname.trim();
  const data = db.read();

  let user = data.users.find(u => u.nickname.toLowerCase() === cleanNickname.toLowerCase());

  if (!user) {
    user = {
      id: db.genId(CONSTANTS.ID_PREFIXES.USER),
      nickname: cleanNickname,
      createdAt: new Date().toISOString()
    };
    data.users.push(user);
    await db.write(data);
  }

  return user;
};

/**
 * Получить всех пользователей (для админки)
 */
const getAllUsers = () => {
  const data = db.read();
  return data.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

module.exports = {
  getOrCreateUser,
  getAllUsers
};
