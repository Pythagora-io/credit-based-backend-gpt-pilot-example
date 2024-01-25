const jwt = require('jsonwebtoken');

const getApiKeyFromJwt = (jwtToken) => {
  if (!jwtToken) return null;
  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    return decoded.apiKey;
  } catch (error) {
    console.error('Failed to decode JWT', error);
    return null;
  }
};

module.exports = { getApiKeyFromJwt };