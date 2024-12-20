const rateLimit = require('express-rate-limit');

const captureRateLimiter = rateLimit({
  windowMs: 61 * 1000, // 1 minute 1 Sec window
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = captureRateLimiter;
