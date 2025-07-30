import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';
import chatRoutes from '../routes/chat.js';
import citiesRoutes from '../routes/cities.js';
import notificationsRoutes from '../routes/notifications.js';
import requestJoinRoutes from '../routes/requestJoin.js';
import tripRequestsRoutes from '../routes/tripRequests.js';
import tripsRoutes from '../routes/trips.js';
import usersRoutes from '../routes/users.js';

const app = express();
app.use(express.json());
app.use('/chat', chatRoutes);
app.use('/cities', citiesRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/request-join', requestJoinRoutes);
app.use('/trip-requests', tripRequestsRoutes);
app.use('/trips', tripsRoutes);
app.use('/users', usersRoutes);

describe('API Routes', () => {
  let token;
  let client;

  beforeAll(async () => {
    client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Создаем необходимые данные для тестов
      await client.query(`
        INSERT INTO cities (id, name)
        VALUES (1, 'Минск'), (2, 'Брест')
        ON CONFLICT (id) DO NOTHING;
      `);

      await client.query(`
        INSERT INTO users (id, name, email, password_hash, age, gender, city_id)
        VALUES (1, 'Test User', 'test@example.com', '$2b$10$xNz15XyGqp/to7B9sIN7n..LJUtVCQsrnd.eh438aMRfTveFeCkVi', 25, 'male', 1)
        ON CONFLICT (id) DO NOTHING;
      `);

      await client.query(`
        INSERT INTO trips (id, creator_id, from_city_id, to_city_id, date_from, date_to, description, status)
        VALUES (1, 1, 1, 2, '2023-01-01', '2023-01-10', 'Test trip', 'searching')
        ON CONFLICT (id) DO NOTHING;
      `);

      const res = await request(app)
        .post('/users/login')
        .send({ email: 'test@example.com', password: 'password' });

      token = res.body.token;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  });

  afterAll(async () => {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });

  describe('GET /cities', () => {
    it('should return a list of cities', async () => {
      const res = await request(app).get('/cities');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /notifications', () => {
    it('should return notifications for authenticated user', async () => {
      const res = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('incoming');
      expect(res.body).toHaveProperty('accepted');
    });
  });

  describe('POST /request-join', () => {
    it('should create a trip request', async () => {
      const res = await request(app)
        .post('/request-join')
        .set('Authorization', `Bearer ${token}`)
        .send({ tripId: 1 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Запрос на участие отправлен');
    });
  });

  describe('GET /trip-requests', () => {
    it('should return trip requests for a specific trip', async () => {
      const res = await request(app)
        .get('/trip-requests')
        .query({ trip_id: 1 })
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('PUT /trip-requests/:id', () => {
    it('should update the status of a trip request', async () => {
      const res = await request(app)
        .put('/trip-requests/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'accepted' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /trips', () => {
    it('should return a list of trips', async () => {
      const res = await request(app).get('/trips');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /trips/:id', () => {
    it('should return a specific trip', async () => {
      const res = await request(app).get('/trips/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('POST /trips', () => {
    it('should create a new trip', async () => {
      const res = await request(app)
        .post('/trips')
        .set('Authorization', `Bearer ${token}`)
        .send({
          from_city_id: 1,
          to_city_id: 2,
          date_from: '2023-01-01',
          date_to: '2023-01-10',
          description: 'Test trip',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password',
          age: 25,
          gender: 'male',
          city_id: 1,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('POST /users/login', () => {
    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({ email: 'test@example.com', password: 'password' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('GET /users/:id', () => {
    it('should return a specific user', async () => {
      const res = await request(app).get('/users/4');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('GET /users/:id/trips', () => {
    it('should return trips for a specific user', async () => {
      const res = await request(app).get('/users/4/trips');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });
});
