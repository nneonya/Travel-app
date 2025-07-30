const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT
        chats.*,
        u1.name AS creator_name,
        u1.id AS creator_id,
        u2.name AS companion_name,
        u2.id AS companion_id,
        t.description AS trip_description,
        t.id AS trip_id,
        t.from_city_id,
        t.to_city_id,
        fc.name AS from_city,
        tc.name AS to_city
      FROM chats
      JOIN users u1 ON chats.creator_id = u1.id
      JOIN users u2 ON chats.companion_id = u2.id
      JOIN trips t ON chats.trip_id = t.id
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      WHERE chats.creator_id = $1 OR chats.companion_id = $1
      ORDER BY chats.created_at DESC
    `;

    const { rows } = await pool.query(query, [userId]);

    const formattedChats = rows.map(chat => ({
      id: chat.id,
      trip_id: chat.trip_id,
      trip_description: chat.trip_description,
      from_city: { id: chat.from_city_id, name: chat.from_city },
      to_city: { id: chat.to_city_id, name: chat.to_city },
      participants: {
        creator: { id: chat.creator_id, name: chat.creator_name },
        companion: { id: chat.companion_id, name: chat.companion_name }
      },
      created_at: chat.created_at
    }));

    res.json(formattedChats);
  } catch (err) {
    console.error('Error fetching user chats:', err);
    res.status(500).json({
      error: 'Failed to load chats',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

router.get('/:chatId/messages', authMiddleware, async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  if (!chatId || !/^\d+$/.test(chatId)) {
    return res.status(400).json({ error: 'Invalid chat ID' });
  }

  try {
    const accessCheck = await pool.query(
      `SELECT 1 FROM chats
       WHERE id = $1 AND (creator_id = $2 OR companion_id = $2)
       LIMIT 1`,
      [chatId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access to chat denied' });
    }

    const messagesQuery = `
      SELECT
        m.id,
        m.content,
        m.sent_at,
        m.sender_id,
        u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.sent_at ASC
    `;

    const { rows } = await pool.query(messagesQuery, [chatId]);
    res.json(rows.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.sent_at,
      sender: {
        id: msg.sender_id,
        name: msg.sender_name
      }
    })));
  } catch (err) {
    console.error(`Error fetching messages for chat ${chatId}:`, err);
    res.status(500).json({
      error: 'Failed to load messages',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
