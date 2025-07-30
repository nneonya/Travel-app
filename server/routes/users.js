const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SECRET_KEY = process.env.SECRET_KEY || 'super_secret_key';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the public/avatars directory
    const uploadDir = path.join(__dirname, '..', 'public', 'avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp + user ID + original extension
    const uniqueSuffix = Date.now() + '-' + req.user.id;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Auth routes
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ id: result.rows[0].id }, SECRET_KEY, { expiresIn: '24h' });

    res.status(201).json({ token, user: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        city_id: user.city_id,
      }
    });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Profile routes - these need to be BEFORE the /:id routes
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, 
        u.name, 
        u.age, 
        u.gender, 
        u.description, 
        u.interests, 
        u.avatar,
        u.city_id,
        c.name as "cityName"
       FROM users u
       LEFT JOIN cities c ON u.city_id = c.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    // Transform the avatar path
    const profile = result.rows[0];
    if (profile.avatar) {
      // Make sure the avatar path starts with /public
      if (!profile.avatar.startsWith('/public')) {
        const filename = path.basename(profile.avatar);
        profile.avatar = `/public/avatars/${filename}`;
      }
    }

    console.log('Profile data:', profile);
    res.json(profile);
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/my-trips', auth, async (req, res) => {
  console.log('Getting trips for user:', req.user.id);

  try {
    const result = await pool.query(
      `SELECT 
        t.*, 
        fc.name AS "fromCity", 
        tc.name AS "toCity",
        creator.name AS creator_name,
        creator.age AS creator_age,
        creator_city.name AS creator_city,
        creator.avatar AS creator_avatar,
        t.creator_id,
        companion.name AS companion_name,
        companion.avatar AS companion_avatar,
        COALESCE(tr.status, 'none') as request_status
      FROM trips t
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      JOIN users creator ON t.creator_id = creator.id
      LEFT JOIN cities creator_city ON creator.city_id = creator_city.id
      LEFT JOIN trip_requests tr ON t.id = tr.trip_id AND tr.user_id = $1
      LEFT JOIN trip_requests accepted_request ON t.id = accepted_request.trip_id AND accepted_request.status = 'accepted'
      LEFT JOIN users companion ON accepted_request.user_id = companion.id
      WHERE t.creator_id = $1 AND t.status = 'searching'
      ORDER BY t.created_at DESC
      LIMIT 2`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении поездок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, age, city, gender, description, interests } = req.body;
    
    // Get city_id from city name
    let cityId = null;
    if (city) {
      const cityResult = await pool.query(
        'SELECT id FROM cities WHERE name = $1',
        [city]
      );
      if (cityResult.rows.length > 0) {
        cityId = cityResult.rows[0].id;
      }
    }

    // Update user profile
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           age = COALESCE($2, age),
           city_id = COALESCE($3, city_id),
           gender = COALESCE($4, gender),
           description = COALESCE($5, description),
           interests = COALESCE($6, interests)
       WHERE id = $7
       RETURNING *`,
      [name, age, cityId, gender, description, interests, req.user.id]
    );

    // Transform the avatar path in the response
    const updatedUser = result.rows[0];
    if (updatedUser.avatar && !updatedUser.avatar.startsWith('/public')) {
      const filename = path.basename(updatedUser.avatar);
      updatedUser.avatar = `/public/avatars/${filename}`;
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
});

// Parametrized routes - these should come AFTER the specific routes
router.get('/:id', async (req, res) => {
  const tripId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT trips.*, 
              fc.name AS fromCity, 
              tc.name AS toCity, 
              u.name AS creator_name, 
              u.age AS creator_age, 
              c.name AS creator_city,
              trips.creator_id
       FROM trips
       JOIN cities fc ON trips.from_city_id = fc.id
       JOIN cities tc ON trips.to_city_id = tc.id
       JOIN users u ON trips.creator_id = u.id
       JOIN cities c ON u.city_id = c.id
       WHERE trips.id = $1`,
      [tripId]
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

router.get('/:id/trips', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        fc.name AS "fromCity",
        tc.name AS "toCity",
        creator.name AS creator_name,
        creator.age AS creator_age,
        creator_city.name AS creator_city,
        creator.avatar AS creator_avatar
      FROM trips t
      JOIN cities fc ON t.from_city_id = fc.id
      JOIN cities tc ON t.to_city_id = tc.id
      JOIN users creator ON t.creator_id = creator.id
      LEFT JOIN cities creator_city ON creator.city_id = creator_city.id
      WHERE t.creator_id = $1 AND t.status = 'searching'
      ORDER BY t.created_at DESC
      LIMIT 2
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении поездок пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Delete old avatar if exists
    const oldAvatarQuery = await pool.query(
      'SELECT avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    if (oldAvatarQuery.rows[0]?.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', 'public', oldAvatarQuery.rows[0].avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Get the filename only and construct the URL path
    const filename = path.basename(req.file.path);
    const avatarPath = `/avatars/${filename}`;
    
    await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2',
      [avatarPath, req.user.id]
    );

    res.json({ avatar: avatarPath });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error updating avatar' });
  }
});

module.exports = router;