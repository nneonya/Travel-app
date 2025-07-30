const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db');
const authMiddleware = require('./middleware/auth');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

function getIO() {
  return io;
}

// Экспортируем getIO сразу после создания
module.exports.getIO = getIO;

const userRoutes = require('./routes/users');
const tripRoutes = require('./routes/trips');
const requestJoinRouter = require('./routes/requestJoin');
const tripRequestsRouter = require('./routes/tripRequests');
const notificationsRouter = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const citiesRouter = require('./routes/cities');
const chatsRouter = require('./routes/chats');
const reviewsRouter = require('./routes/reviews');

// Разрешить запросы с клиента
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Ensure public directory exists
const publicPath = path.join(__dirname, 'public');
const avatarsPath = path.join(publicPath, 'avatars');

if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
  console.log('Created public directory:', publicPath);
}

if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
  console.log('Created avatars directory:', avatarsPath);
}

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
console.log('Serving static files from:', path.join(__dirname, 'public'));

// Подключение маршрутов
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trip-requests', tripRequestsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/cities', citiesRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api', requestJoinRouter);

// Простой тестовый маршрут
app.get('/api/cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cities ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Socket.IO логика
io.on('connection', (socket) => {
  console.log('🔌 Новое Socket.IO соединение:', socket.id);

  socket.on('joinChat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`👥 Пользователь ${socket.id} присоединился к комнате chat_${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Пользователь отключился:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;