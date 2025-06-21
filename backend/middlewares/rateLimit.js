const rateLimit = require('express-rate-limit');
module.exports = {
  generalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
  }),
  createDisasterLimiter: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many disaster reports'
  }),
  verificationLimiter: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many image verifications'
  }),
  geocodingLimiter: rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: 'Too many geocoding requests'
  })
};
