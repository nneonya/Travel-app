// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'super_secret_key';

function authMiddleware(req, res, next) {
  console.log('Проверка авторизации');
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('Отсутствует заголовок Authorization');
    return res.status(401).json({ error: 'Нет токена' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Токен не найден в заголовке');
    return res.status(401).json({ error: 'Неверный формат токена' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Токен успешно проверен. User ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Ошибка проверки токена:', err.message);
    res.status(403).json({ error: 'Неверный токен' });
  }
}

module.exports = authMiddleware;
