// src/app.js
const express = require('express');
const db = require('./db');
// dotenv вже ініціалізовано в src/db.js, але можна додати тут для надійності
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обробки JSON
app.use(express.json());

// 💡 Тимчасовий маршрут для перевірки, що сервер працює
app.get('/', (req, res) => {
  res.send('Server is running and ready for Lab 7!');
});

// 💡 Маршрут для перевірки підключення до БД та виконання вимоги з init.sql
app.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, age FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err.message);
    // Якщо тут буде помилка, то швидше за все проблема з підключенням до БД (налаштування .env)
    res.status(500).send('Помилка сервера. Не вдалося отримати користувачів.');
  }
});


// 🚨 Важливий крок: запуск сервера
// Прослуховування порту (0.0.0.0 дозволяє доступ ззовні контейнера)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});