import jwt from 'jsonwebtoken';

export const generateAccessToken = (adminId, sessionId) => {
  return jwt.sign({ id: adminId, sessionId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
  });
};

export const generateRefreshToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  });
};
