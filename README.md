# Travka — Bedrock Cache Shop 🛒

Магазин кладов бедрока для Minecraft на Node.js + Express

## 📋 Структура проекта

```
Travka/
├── server.js              # Главный файл приложения
├── package.json
├── .env.example           # Пример переменных окружения
├── .gitignore
│
├── src/                   # Исходный код
│   ├── config/
│   │   ├── env.js         # Конфигурация переменных окружения
│   │   └── constants.js   # Константы приложения
│   ├── middleware/
│   │   ├── auth.js        # Middleware авторизации
│   │   └── errorHandler.js # Обработка ошибок
│   ├── db/
│   │   └── index.js       # Модуль работы с БД
│   ├── services/
│   │   ├── lotService.js      # Логика работы с лотами
│   │   ├── orderService.js    # Логика работы с заказами
│   │   └── userService.js     # Логика работы с пользователями
│   ├── utils/
│   │   ├── validators.js  # Валидаторы
│   │   └── imageProcessor.js # Обработка изображений
│   └── routes/
│       ├── index.js       # Главный роутер
│       ├── admin.js       # Админ API
│       ├── user.js        # Пользовательский API
│       └── pages.js       # Маршруты страниц
│
├── public/                # Статические файлы
│   ├── index.html         # Главная
│   ├── shop.html          # Магазин
│   ├── cabinet.html       # Кабинет
│   ├── admin.html         # Админ-панель
│   ├── 404.html           # 404
│   ├── css/
│   │   └── style.css      # Стили
│   ├── js/
│   │   ├── api.js         # API клиент
│   │   ├── auth.js        # Авторизация
│   │   ├── admin.js       # Админ скрипты
│   │   ├── shop.js        # Магазин скрипты
│   │   └── cabinet.js     # Кабинет скрипты
│   └── uploads/           # Загруженные изображения (auto-created)
│
├── data/                  # Данные (в .gitignore)
│   └── db.json           # База данных
│
docs/                     # Документация
└── logs/                  # Логи
```

## 🚀 Установка

1. Клонируем репозиторий:
```bash
git clone https://github.com/yourusername/Travka.git
cd Travka
```

2. Устанавливаем зависимости:
```bash
npm install
```

3. Создаём `.env` файл из примера:
```bash
cp .env.example .env
```

4. Отредактируем `.env` (особенно пароли и пути):
```
ADMIN_PATH=your-secret-admin-path
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-random-secret
```

5. Запускаем:
```bash
npm start
```

Сервер запустится на `http://localhost:3000`

## 📚 API

### User API (`/api/user`)

#### Вход по нику
```
POST /api/user/login
{
  "nickname": "Player123"
}
```

#### Выход
```
POST /api/user/logout
```

#### Статус
```
GET /api/user/me
```

#### Активные лоты
```
GET /api/user/lots
```

#### Создать заказ
```
POST /api/user/orders
{
  "lotId": "lot_xxx",
  "quantity": 1
}
```

#### Мои заказы
```
GET /api/user/orders/mine
```

### Admin API (`/api/admin`)

#### Вход в админку
```
POST /api/admin/login
{
  "password": "your-admin-password"
}
```

#### Выход
```
POST /api/admin/logout
```

#### Статус
```
GET /api/admin/me
```

#### Все лоты
```
GET /api/admin/lots
```

#### Создать лот
```
POST /api/admin/lots
Content-Type: multipart/form-data

{
  "title": "Bedrock Vein",
  "price": 100,
  "description": "Awesome bedrock",
  "quantity": 5,
  "photo": [file]
}
```

#### Обновить лот
```
PUT /api/admin/lots/:id
```

#### Удалить лот
```
DELETE /api/admin/lots/:id
```

#### Все заказы
```
GET /api/admin/orders
```

#### Обновить заказ
```
PUT /api/admin/orders/:id
{
  "status": "confirmed",
  "coords": "x:100 y:64 z:200",
  "adminNote": "Awaiting delivery"
}
```

#### Все пользователи
```
GET /api/admin/users
```

## 🔒 Безопасность

- ✅ Всегда меняйте пароли в production
- ✅ Используйте сложный `SESSION_SECRET`
- ✅ Используйте сложный путь админ-панели
- ✅ Включайте HTTPS в production
- ✅ Используйте переменные окружения для всех секретов

## 📦 Зависимости

- **express** — веб-фреймворк
- **express-session** — управление сессиями
- **multer** — загрузка файлов
- **sharp** — обработка изображений

## 📝 Лицензия

MIT
