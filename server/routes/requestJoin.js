const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

router.post('/request-join', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { tripId } = req.body;

  if (!tripId) {
    return res.status(400).json({ error: 'Не указан tripId' });
  }

  try {
    const tripRes = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (tripRes.rows.length === 0) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    if (tripRes.rows[0].creator_id === userId) {
      return res.status(400).json({ error: 'Нельзя отправлять запрос на свою поездку' });
    }

    const existingRequest = await pool.query(
      'SELECT * FROM trip_requests WHERE trip_id = $1 AND user_id = $2',
      [tripId, userId]
    );
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже отправили запрос на эту поездку' });
    }

    await pool.query(
      'INSERT INTO trip_requests (trip_id, user_id) VALUES ($1, $2)',
      [tripId, userId]
    );

    res.json({ message: 'Запрос на участие отправлен' });
  } catch (err) {
    console.error('Ошибка при отправке запроса на участие:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
