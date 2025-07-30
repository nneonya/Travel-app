const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        reviews.*,
        trips.from_city_id,
        trips.to_city_id,
        fc.name AS trip_from_city,
        tc.name AS trip_to_city,
        trips.date_from AS trip_date_from,
        trips.date_to AS trip_date_to,
        users.name AS user_name,
        users.avatar AS user_avatar
      FROM reviews
      JOIN trips ON reviews.trip_id = trips.id
      JOIN cities fc ON trips.from_city_id = fc.id
      JOIN cities tc ON trips.to_city_id = tc.id
      JOIN users ON reviews.user_id = users.id
      ORDER BY reviews.created_at DESC
    `);
    // Приводим user_avatar к формату /public/avatars/...
    const reviews = result.rows.map(row => {
      if (row.user_avatar && !row.user_avatar.startsWith('/public')) {
        const path = require('path');
        const filename = path.basename(row.user_avatar);
        row.user_avatar = `/public/avatars/${filename}`;
      }
      return row;
    });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for a specific trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await pool.query(
      `SELECT 
        reviews.*,
        trips.from_city_id,
        trips.to_city_id,
        fc.name AS trip_from_city,
        tc.name AS trip_to_city,
        trips.date_from AS trip_date_from,
        trips.date_to AS trip_date_to,
        users.name AS user_name,
        users.avatar AS user_avatar
      FROM reviews
      JOIN trips ON reviews.trip_id = trips.id
      JOIN cities fc ON trips.from_city_id = fc.id
      JOIN cities tc ON trips.to_city_id = tc.id
      JOIN users ON reviews.user_id = users.id
      WHERE reviews.trip_id = $1
      ORDER BY reviews.created_at DESC`,
      [tripId]
    );
    // Приводим user_avatar к формату /public/avatars/...
    const reviews = result.rows.map(row => {
      if (row.user_avatar && !row.user_avatar.startsWith('/public')) {
        const path = require('path');
        const filename = path.basename(row.user_avatar);
        row.user_avatar = `/public/avatars/${filename}`;
      }
      return row;
    });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { trip_id, rating, comment } = req.body;
    const user_id = req.user.id;

    const result = await pool.query(
      'INSERT INTO reviews (user_id, trip_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [user_id, trip_id, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a review
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    const result = await pool.query(
      'UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [rating, comment, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 