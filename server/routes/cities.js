// server/routes/cities.ts (если есть роуты)
// или в index.js / app.ts

const express = require('express');
const router = express.Router();
const pool = require('../db'); // твой пул для PostgreSQL

router.get('/cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM cities ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке городов' });
  }
});

module.exports = router;
