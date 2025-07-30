const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Test endpoint to check database state
router.get('/debug', auth, async (req, res) => {
  try {
    const allRequests = await pool.query(
      `SELECT tr.*, 
              t.creator_id,
              u.name as requester_name,
              t.from_city_id, t.to_city_id
       FROM trip_requests tr
       JOIN trips t ON tr.trip_id = t.id
       JOIN users u ON tr.user_id = u.id`
    );
    
    console.log('All trip requests in system:', allRequests.rows);
    res.json({
      allRequests: allRequests.rows,
      currentUserId: req.user.id
    });
  } catch (err) {
    console.error('Debug query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  console.log('Getting notifications for user:', userId);

  try {
    const incoming = await pool.query(`
      SELECT tr.*, 
             u.name AS from_user_name, 
             t.id AS trip_id,
             t.from_city_id, t.to_city_id,
             fc.name as fromCity,
             tc.name as toCity,
             t.date_from, t.date_to
      FROM trip_requests tr
      JOIN users u ON tr.user_id = u.id
      JOIN trips t ON tr.trip_id = t.id
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      WHERE t.creator_id = $1 AND tr.status = 'pending'
    `, [userId]);

    console.log('Incoming requests found:', incoming.rows.length);
    console.log('Incoming requests:', incoming.rows);

    const accepted = await pool.query(`
      SELECT tr.*, 
             t.id AS trip_id, 
             u.name AS creator_name,
             t.from_city_id, t.to_city_id,
             fc.name as fromCity,
             tc.name as toCity,
             t.date_from, t.date_to
      FROM trip_requests tr
      JOIN trips t ON tr.trip_id = t.id
      JOIN users u ON t.creator_id = u.id
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      WHERE tr.user_id = $1 AND tr.status = 'accepted'
    `, [userId]);

    console.log('Accepted requests found:', accepted.rows.length);
    res.json({ incoming: incoming.rows, accepted: accepted.rows });
  } catch (err) {
    console.error('Ошибка при получении уведомлений:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get trip requests for notifications
router.get('/requests', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        tr.id,
        tr.trip_id,
        tr.user_id,
        tr.status,
        u.name,
        u.age,
        u.avatar,
        c.name as city,
        fc.name as "fromCity",
        tc.name as "toCity",
        t.date_from,
        t.date_to
      FROM trip_requests tr
      JOIN users u ON tr.user_id = u.id
      LEFT JOIN cities c ON u.city_id = c.id
      JOIN trips t ON tr.trip_id = t.id
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      WHERE t.creator_id = $1 AND tr.status = 'pending'
      ORDER BY tr.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error getting trip requests:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
