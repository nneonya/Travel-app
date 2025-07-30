const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.get('/my', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        trips.*,
        fc.name AS "fromCity",
        tc.name AS "toCity",
        u.name AS "creator_name",
        u.age AS "creator_age",
        c.name AS "creator_city",
        u.avatar AS "creator_avatar",
        companion.id AS companion_id,
        companion.name AS companion_name,
        companion.avatar AS companion_avatar,
        EXISTS (
          SELECT 1 FROM reviews
          WHERE reviews.trip_id = trips.id AND reviews.user_id = $1
        ) AS "currentUserHasReviewed"
      FROM trips
      JOIN cities fc ON trips.from_city_id = fc.id
      JOIN cities tc ON trips.to_city_id = tc.id
      JOIN users u ON trips.creator_id = u.id
      JOIN cities c ON u.city_id = c.id
      LEFT JOIN trip_requests accepted_request ON trips.id = accepted_request.trip_id AND accepted_request.status = 'accepted'
      LEFT JOIN users companion ON accepted_request.user_id = companion.id
      WHERE trips.creator_id = $1 OR accepted_request.user_id = $1
      ORDER BY trips.date_from ASC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении поездок:', error);
    res.status(500).json({ message: 'Ошибка при получении поездок' });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  const { from, to, startDate, endDate } = req.query;

  try {
    const conditions = ['trips.status = \'searching\''];
    const values = [];
    let paramIndex = 1;

    let selectClause = `
      SELECT
        trips.*,
        fc.name AS "fromCity",
        tc.name AS "toCity",
        u.name AS "creator_name",
        u.age AS "creator_age",
        c.name AS "creator_city",
        u.avatar AS "creator_avatar",
        companion.id AS companion_id,
        companion.name AS companion_name,
        companion.avatar AS companion_avatar
    `;
    
    if (req.user) {
      values.push(req.user.id);
      selectClause += `, EXISTS (SELECT 1 FROM reviews WHERE reviews.trip_id = trips.id AND reviews.user_id = $${paramIndex++}) AS "currentUserHasReviewed"`;
    } else {
      selectClause += ', false AS "currentUserHasReviewed"';
    }

    if (from) {
      values.push(from);
      conditions.push(`trips.from_city_id = $${paramIndex++}`);
    }

    if (to) {
      values.push(to);
      conditions.push(`trips.to_city_id = $${paramIndex++}`);
    }

    if (startDate) {
      values.push(startDate);
      conditions.push(`trips.date_from >= $${paramIndex++}`);
    }

    if (endDate) {
      values.push(endDate);
      conditions.push(`trips.date_to <= $${paramIndex++}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const tripsQuery = `
      ${selectClause}
      FROM trips
      JOIN cities fc ON trips.from_city_id = fc.id
      JOIN cities tc ON trips.to_city_id = tc.id
      JOIN users u ON trips.creator_id = u.id
      LEFT JOIN cities c ON u.city_id = c.id
      LEFT JOIN trip_requests accepted_request ON trips.id = accepted_request.trip_id AND accepted_request.status = 'accepted'
      LEFT JOIN users companion ON accepted_request.user_id = companion.id
      ${whereClause}
      ORDER BY trips.created_at DESC
      LIMIT 20
    `;

    const result = await pool.query(tripsQuery, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении поездок:', error);
    res.status(500).json({ message: 'Ошибка при получении поездок' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  const tripId = req.params.id;
  const params = [tripId];

  let selectReviewedSubquery = 'false AS "currentUserHasReviewed"';
  if (req.user) {
    params.push(req.user.id);
    selectReviewedSubquery = `EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.trip_id = trips.id AND reviews.user_id = $2
    ) AS "currentUserHasReviewed"`;
  }

  try {
    const result = await pool.query(
      `SELECT
        trips.*,
        fc.name AS "fromCity",
        tc.name AS "toCity",
        u.name AS "creator_name",
        u.age AS "creator_age",
        c.name AS "creator_city",
        u.avatar AS "creator_avatar",
        companion.id AS companion_id,
        companion.name AS companion_name,
        companion.avatar AS companion_avatar,
        ${selectReviewedSubquery}
       FROM trips
       JOIN cities fc ON trips.from_city_id = fc.id
       JOIN cities tc ON trips.to_city_id = tc.id
       JOIN users u ON trips.creator_id = u.id
       LEFT JOIN cities c ON u.city_id = c.id
       LEFT JOIN trip_requests accepted_request ON trips.id = accepted_request.trip_id AND accepted_request.status = 'accepted'
       LEFT JOIN users companion ON accepted_request.user_id = companion.id
       WHERE trips.id = $1`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Поездка не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении поездки:', error);
    res.status(500).json({ message: 'Ошибка при получении поездки' });
  }
});

router.post('/', auth, async (req, res) => {
  const {
    from_city_id,
    to_city_id,
    date_from,
    date_to,
    description,
    companion_description,
    preferred_gender,
    preferred_age_min,
    preferred_age_max,
    interests,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO trips (
         creator_id, from_city_id, to_city_id, date_from, date_to, description,
         companion_description, preferred_gender, preferred_age_min, preferred_age_max,
         interests, status
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10,
         $11, 'searching'
       )
       RETURNING *`,
      [
        req.user.id,
        from_city_id,
        to_city_id,
        date_from,
        date_to,
        description,
        companion_description,
        preferred_gender,
        preferred_age_min,
        preferred_age_max,
        interests,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при создании поездки:', error);
    res.status(500).json({ message: 'Ошибка при создании поездки' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const tripId = req.params.id;
  const {
    fromCity,
    toCity,
    date_from,
    date_to,
    description,
    companion_description,
    preferred_gender,
    preferred_age_min,
    preferred_age_max,
    status
  } = req.body;

  try {
    // Check if the trip belongs to the user
    const tripCheck = await pool.query(
      'SELECT creator_id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Поездка не найдена' });
    }

    if (tripCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на редактирование этой поездки' });
    }

    // Get city IDs
    const fromCityResult = await pool.query(
      'SELECT id FROM cities WHERE name = $1',
      [fromCity]
    );

    const toCityResult = await pool.query(
      'SELECT id FROM cities WHERE name = $1',
      [toCity]
    );

    if (fromCityResult.rows.length === 0 || toCityResult.rows.length === 0) {
      return res.status(400).json({ message: 'Неверно указан город' });
    }

    const from_city_id = fromCityResult.rows[0].id;
    const to_city_id = toCityResult.rows[0].id;

    // Update the trip
    const result = await pool.query(
      `UPDATE trips
       SET from_city_id = $1,
           to_city_id = $2,
           date_from = $3,
           date_to = $4,
           description = $5,
           companion_description = $6,
           preferred_gender = $7,
           preferred_age_min = $8,
           preferred_age_max = $9,
           status = COALESCE($10, status)
       WHERE id = $11 AND creator_id = $12
       RETURNING *`,
      [
        from_city_id,
        to_city_id,
        date_from,
        date_to,
        description,
        companion_description,
        preferred_gender,
        preferred_age_min,
        preferred_age_max,
        status,
        tripId,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Поездка не найдена' });
    }

    // Get the updated trip with all necessary information
    const updatedTrip = await pool.query(
      `SELECT
        trips.*,
        fc.name AS "fromCity",
        tc.name AS "toCity",
        u.name AS "creator_name",
        u.age AS "creator_age",
        c.name AS "creator_city",
        u.avatar AS "creator_avatar",
        companion.id AS companion_id,
        companion.name AS companion_name,
        companion.avatar AS companion_avatar
       FROM trips
       JOIN cities fc ON trips.from_city_id = fc.id
       JOIN cities tc ON trips.to_city_id = tc.id
       JOIN users u ON trips.creator_id = u.id
       LEFT JOIN cities c ON u.city_id = c.id
       LEFT JOIN trip_requests accepted_request ON trips.id = accepted_request.trip_id AND accepted_request.status = 'accepted'
       LEFT JOIN users companion ON accepted_request.user_id = companion.id
       WHERE trips.id = $1`,
      [tripId]
    );

    res.json(updatedTrip.rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении поездки:', error);
    res.status(500).json({ message: 'Ошибка при обновлении поездки' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const tripId = req.params.id;

  try {
    // Check if the trip belongs to the user
    const tripCheck = await pool.query(
      'SELECT creator_id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Поездка не найдена' });
    }

    if (tripCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ message: 'У вас нет прав на удаление этой поездки' });
    }

    await pool.query(
      'DELETE FROM trips WHERE id = $1 AND creator_id = $2',
      [tripId, req.user.id]
    );

    res.json({ message: 'Поездка успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении поездки:', error);
    res.status(500).json({ message: 'Ошибка при удалении поездки' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { fromCity, toCity, dateFrom, dateTo } = req.query;
    const userId = req.user?.id; // Optional user ID for authenticated users

    let query = `
      SELECT t.*, 
             fc.name AS fromCity, 
             tc.name AS toCity,
             u.name AS creator_name,
             u.age AS creator_age,
             c.name AS creator_city,
             u.avatar AS creator_avatar,
             t.creator_id,
             COALESCE(tr.status, 'none') as request_status,
             companion.id AS companion_id,
             companion.name AS companion_name,
             companion.avatar AS companion_avatar
      FROM trips t
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      JOIN users u ON t.creator_id = u.id
      LEFT JOIN cities c ON u.city_id = c.id
      LEFT JOIN trip_requests tr ON t.id = tr.trip_id AND tr.user_id = $1
      LEFT JOIN trip_requests accepted_request ON t.id = accepted_request.trip_id AND accepted_request.status = 'accepted'
      LEFT JOIN users companion ON accepted_request.user_id = companion.id
      WHERE t.status = 'searching'
    `;

    const queryParams = [userId || null];
    let paramIndex = 2;

    if (fromCity) {
      query += ` AND fc.name ILIKE $${paramIndex}`;
      queryParams.push(`%${fromCity}%`);
      paramIndex++;
    }

    if (toCity) {
      query += ` AND tc.name ILIKE $${paramIndex}`;
      queryParams.push(`%${toCity}%`);
      paramIndex++;
    }

    if (dateFrom) {
      query += ` AND t.date_from >= $${paramIndex}`;
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      query += ` AND t.date_to <= $${paramIndex}`;
      queryParams.push(dateTo);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при поиске поездок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Create a join request
router.post('/:tripId/request', auth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Check if request already exists
    const existingRequest = await pool.query(
      'SELECT * FROM trip_requests WHERE trip_id = $1 AND user_id = $2',
      [tripId, userId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Запрос уже существует' });
    }

    // Check if user is not the creator of the trip
    const tripCheck = await pool.query(
      'SELECT creator_id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    if (tripCheck.rows[0].creator_id === userId) {
      return res.status(400).json({ error: 'Вы не можете отправить запрос на свою поездку' });
    }

    // Create request
    const result = await pool.query(
      'INSERT INTO trip_requests (trip_id, user_id) VALUES ($1, $2) RETURNING *',
      [tripId, userId]
    );

    // Create notification for trip creator
    await pool.query(
      `INSERT INTO notifications (user_id, type, related_trip_id, related_user_id)
       VALUES ($1, 'join_request', $2, $3)`,
      [tripCheck.rows[0].creator_id, tripId, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при создании запроса:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get requests for a trip
router.get('/:tripId/requests', auth, async (req, res) => {
  try {
    const { tripId } = req.params;
    
    // Check if user is the trip creator
    const tripCheck = await pool.query(
      'SELECT creator_id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    if (tripCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'У вас нет прав для просмотра запросов' });
    }

    const result = await pool.query(
      `SELECT tr.*, 
              u.name, u.age, c.name as city,
              u.avatar,
              t.from_city_id, t.to_city_id,
              fc.name as fromCity,
              tc.name as toCity,
              t.date_from, t.date_to
       FROM trip_requests tr
       JOIN users u ON tr.user_id = u.id
       LEFT JOIN cities c ON u.city_id = c.id
       JOIN trips t ON tr.trip_id = t.id
       JOIN cities fc ON t.from_city_id = fc.id
       JOIN cities tc ON t.to_city_id = tc.id
       WHERE tr.trip_id = $1`,
      [tripId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении запросов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Complete a trip
router.put('/:tripId/complete', auth, async (req, res) => {
  try {
    const { tripId } = req.params;
    
    // Check if user is the trip creator
    const tripCheck = await pool.query(
      'SELECT creator_id FROM trips WHERE id = $1',
      [tripId]
    );

    if (tripCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Поездка не найдена' });
    }

    if (tripCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'У вас нет прав для завершения этой поездки' });
    }

    // Update trip status to completed
    const result = await pool.query(
      `UPDATE trips 
       SET status = 'completed' 
       WHERE id = $1 AND creator_id = $2
       RETURNING *`,
      [tripId, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при завершении поездки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
