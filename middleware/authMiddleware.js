const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || "hari", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateJWT;
