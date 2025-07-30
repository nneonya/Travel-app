const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { trip_id } = req.query;

  if (!trip_id) {
    return res.status(400).json({ error: 'Не указан trip_id' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        tr.id,
        tr.trip_id,
        tr.user_id,
        tr.status,
        tr.created_at,
        u.name AS user_name, 
        u.age
      FROM trip_requests tr
      JOIN users u ON tr.user_id = u.id
      WHERE trip_id = $1
    `, [trip_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении заявок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  console.log('Processing trip request:', { requestId, status });

  try {
    const requestRes = await pool.query('SELECT * FROM trip_requests WHERE id = $1', [requestId]);
    if (requestRes.rows.length === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    const request = requestRes.rows[0];
    console.log('Found request:', request);

    const tripRes = await pool.query('SELECT * FROM trips WHERE id = $1', [request.trip_id]);
    if (tripRes.rows.length === 0) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    const trip = tripRes.rows[0];
    console.log('Found trip:', trip);

    if (trip.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа' });
    }

    await pool.query('UPDATE trip_requests SET status = $1 WHERE id = $2', [status, requestId]);
    console.log('Updated trip request status');

    if (status === 'accepted') {
      await pool.query('UPDATE trips SET status = $1 WHERE id = $2', ['planned', request.trip_id]);
      console.log('Updated trip status to planned');

      try {
        const participantResult = await pool.query(
          `INSERT INTO trip_participants (trip_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT (trip_id, user_id) DO NOTHING
           RETURNING *`,
          [request.trip_id, request.user_id]
        );
        console.log('Added participant:', participantResult.rows[0]);
      } catch (err) {
        console.error('Error adding participant:', err);
        throw err;
      }

      // Проверка существующего чата
      const chatCheck = await pool.query(
        `SELECT id FROM chats 
        WHERE trip_id = $1 AND creator_id = $2 AND companion_id = $3`,
        [request.trip_id, trip.creator_id, request.user_id]
      );

      let chat;
      if (chatCheck.rows.length > 0) {
        chat = chatCheck.rows[0];
        console.log('Found existing chat:', chat);
      } else {
        const chatRes = await pool.query(
          `INSERT INTO chats (trip_id, creator_id, companion_id)
          VALUES ($1, $2, $3) RETURNING *`,
          [request.trip_id, trip.creator_id, request.user_id]
        );
        chat = chatRes.rows[0];
        console.log('Created new chat:', chat);
      }

      res.json({ message: 'Заявка принята, чат создан', chat: chat });
    } else {
      res.json({ message: 'Заявка отклонена' });
    }
  } catch (err) {
    console.error('Ошибка при обработке заявки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
