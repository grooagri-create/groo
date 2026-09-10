const rateLimit = require('express-rate-limit');

const OTP_WINDOW_MS = parseInt(process.env.OTP_RATE_WINDOW || '600', 10) * 1000;
const OTP_IP_LIMIT = parseInt(process.env.OTP_IP_RATE_LIMIT || '10', 10);

const getPhone = (req) => {
  const phone = String(req.body?.phone || '').replace(/\D/g, '');
  return phone || 'missing-phone';
};

const otpIpRateLimiter = rateLimit({
  windowMs: OTP_WINDOW_MS,
  max: OTP_IP_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this network. Please try again later.'
  }
});

const otpPhoneRateLimiter = rateLimit({
  windowMs: OTP_WINDOW_MS,
  max: parseInt(process.env.OTP_RATE_LIMIT || '3', 10),
  keyGenerator: getPhone,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests for this number. Please try again later.'
  }
});

module.exports = [otpIpRateLimiter, otpPhoneRateLimiter];