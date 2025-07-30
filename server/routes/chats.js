const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { getIO } = require('../index');

// Get all chats for the current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id as chat_id,
        c.trip_id,
        c.creator_id,
        c.companion_id,
        t.from_city_id,
        t.to_city_id,
        fc.name as from_city,
        tc.name as to_city,
        t.date_from,
        t.date_to,
        creator.name as creator_name,
        creator.avatar as creator_avatar,
        companion.name as companion_name,
        companion.avatar as companion_avatar,
        (
          SELECT m.content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.sent_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT m.sent_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.sent_at DESC
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.chat_id = c.id
            AND m.sender_id != $1
            AND m.is_read = false
        ) as unread_count
      FROM chats c
      JOIN trips t ON c.trip_id = t.id
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      JOIN users creator ON c.creator_id = creator.id
      JOIN users companion ON c.companion_id = companion.id
      WHERE c.creator_id = $1 OR c.companion_id = $1
      ORDER BY last_message_time DESC NULLS LAST`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting chats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    // First verify the user is a participant of this chat
    const participantCheck = await pool.query(
      `SELECT 1 FROM chats 
       WHERE id = $1 AND (creator_id = $2 OR companion_id = $2)`,
      [req.params.chatId, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    // Get messages
    const result = await pool.query(
      `SELECT 
        m.id,
        m.content,
        m.sent_at as created_at,
        m.sender_id,
        u.name as sender_name,
        u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.sent_at ASC`,
      [req.params.chatId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
  const { content } = req.body;
  
  try {
    // Verify user is a participant
    const participantCheck = await pool.query(
      `SELECT 1 FROM chats 
       WHERE id = $1 AND (creator_id = $2 OR companion_id = $2)`,
      [req.params.chatId, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to send messages in this chat' });
    }

    // Insert message
    const result = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sent_at`,
      [req.params.chatId, req.user.id, content]
    );

    // Получаем имя и аватар отправителя
    const userResult = await pool.query(
      'SELECT name, avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    const message = {
      id: result.rows[0].id,
      content,
      created_at: result.rows[0].sent_at,
      sender_id: req.user.id,
      sender_name: userResult.rows[0]?.name || '',
      sender_avatar: userResult.rows[0]?.avatar || ''
    };

    res.status(201).json(message);
    // После успешного сохранения сообщения рассылаем событие через сокет
    const io = getIO();
    const socketMessage = {
      ...message,
      chat_id: parseInt(req.params.chatId),
      sent_at: result.rows[0].sent_at
    };
    io.to(`chat_${req.params.chatId}`).emit('newMessage', socketMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Create a new chat
router.post('/create', auth, async (req, res) => {
  const { trip_id, companion_id } = req.body;
  
  try {
    // Start transaction
    await pool.query('BEGIN');

    // Check if chat already exists
    const existingChat = await pool.query(
      `SELECT id FROM chats 
       WHERE trip_id = $1 
       AND ((creator_id = $2 AND companion_id = $3) 
         OR (creator_id = $3 AND companion_id = $2))`,
      [trip_id, req.user.id, companion_id]
    );

    if (existingChat.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Chat already exists' });
    }

    // Create chat
    const chatResult = await pool.query(
      `INSERT INTO chats (trip_id, creator_id, companion_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [trip_id, req.user.id, companion_id]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({ id: chatResult.rows[0].id });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Пометить сообщения как прочитанные
router.post('/:chatId/read', auth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE messages
       SET is_read = true
       WHERE chat_id = $1 AND sender_id != $2 AND is_read = false`,
      [req.params.chatId, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 