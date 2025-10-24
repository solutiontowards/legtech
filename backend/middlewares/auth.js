import asyncHandler from 'express-async-handler';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export const auth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  let decoded;
  try { decoded = verifyToken(token); } catch (err) { return res.status(401).json({ error: 'Invalid token' }); }
  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) return res.status(401).json({ error: 'User not found' });
  req.user = user;
  next();
});