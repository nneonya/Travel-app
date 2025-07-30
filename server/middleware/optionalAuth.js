// middleware/optionalAuth.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'super_secret_key';

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
      } catch (err) {
        // Игнорируем невалидный токен, т.к. аутентификация опциональна
        console.log('Optional auth: invalid token, proceeding without user.');
      }
    }
  }
  next();
}

module.exports = optionalAuth; 