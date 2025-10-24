import rateLimit from 'express-rate-limit';

// generic limiter for auth endpoints (adjust as needed)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many requests, try again later'
});
