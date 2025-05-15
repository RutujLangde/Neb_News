const jwt = require('jsonwebtoken');
const secret = "SXDFCGVBHJNK$$%^%^&FCGVBHJN"; // Use environment variable in production

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

module.exports = authMiddleware;
