const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { getRedis, isRedisConnected } = require('../services/redisService');

const OTP_WINDOW_SECONDS = parseInt(process.env.OTP_RATE_WINDOW || '600', 10);
const OTP_GLOBAL_LIMIT = parseInt(process.env.OTP_GLOBAL_LIMIT || '300', 10);
const OTP_GLOBAL_WINDOW = parseInt(process.env.OTP_GLOBAL_WINDOW || '600', 10);
const OTP_IP_LIMIT = parseInt(process.env.OTP_IP_RATE_LIMIT || '10', 10);
const OTP_PHONE_LIMIT = parseInt(process.env.OTP_RATE_LIMIT || '3', 10);
const OTP_PHONE_COOLDOWN = parseInt(process.env.OTP_PHONE_COOLDOWN || '60', 10);
const failClosed = process.env.OTP_GLOBAL_FAIL_CLOSED === 'true' || process.env.NODE_ENV === 'production';
const localState = new Map();

const RATE_LIMIT_SCRIPT = `
local function increment(key, limit, window)
  local current = redis.call('INCR', key)
  if current == 1 then redis.call('EXPIRE', key, window) end
  if current > limit then
    local ttl = redis.call('TTL', key)
    if ttl > 0 then redis.call('SET', key, limit, 'EX', ttl) end
    return 0
  end
  return 1
end

if redis.call('EXISTS', KEYS[4]) == 1 then return {0, 'cooldown'} end
if increment(KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2])) == 0 then return {0, 'global-limit'} end
if increment(KEYS[2], tonumber(ARGV[3]), tonumber(ARGV[4])) == 0 then return {0, 'ip-limit'} end
if increment(KEYS[3], tonumber(ARGV[5]), tonumber(ARGV[4])) == 0 then return {0, 'phone-limit'} end
if redis.call('SET', KEYS[4], '1', 'EX', ARGV[6], 'NX') == false then return {0, 'cooldown'} end
return {1, 'allowed'}
`;

const getPhone = (req) => String(req.body?.phone || '').replace(/\D/g, '');

const maskPhone = (phone) => {
  const value = String(phone || '');
  if (value.length < 4) return '****';
  return `${value.slice(0, 2)}${'*'.repeat(Math.max(2, value.length - 4))}${value.slice(-2)}`;
};

const clientId = (req) => crypto.createHash('sha256').update(String(req.ip || 'unknown')).digest('hex').slice(0, 12);

const logBlocked = (req, phone, reason) => {
  console.warn('[OTP SECURITY] blocked', JSON.stringify({
    timestamp: new Date().toISOString(),
    endpoint: `${req.baseUrl || ''}${req.path || ''}`,
    phone: maskPhone(phone),
    client: clientId(req),
    reason
  }));
};

const localCheck = (phone, ip) => {
  const now = Date.now();
  const windowMs = OTP_WINDOW_SECONDS * 1000;
  const globalWindowMs = OTP_GLOBAL_WINDOW * 1000;
  const cooldownKey = `cooldown:${phone}`;
  const cooldown = localState.get(cooldownKey);
  if (cooldown && cooldown.resetAt > now) return { allowed: false, reason: 'cooldown' };

  const keyData = [
    ['global', globalWindowMs, OTP_GLOBAL_LIMIT],
    [`ip:${ip}`, windowMs, OTP_IP_LIMIT],
    [`phone:${phone}`, windowMs, OTP_PHONE_LIMIT]
  ];

  for (const [key, duration, limit] of keyData) {
    const existing = localState.get(key);
    if (!existing || existing.resetAt <= now) {
      localState.set(key, { count: 1, resetAt: now + duration });
    } else {
      existing.count += 1;
      if (existing.count > limit) return { allowed: false, reason: key.split(':')[0] + '-limit' };
    }
  }

  localState.set(cooldownKey, { count: 1, resetAt: now + OTP_PHONE_COOLDOWN * 1000 });
  return { allowed: true };
};

const otpRateLimiter = async (req, res, next) => {
  // Validation remains responsible for the 400 response and invalid requests do not consume limits.
  if (!validationResult(req).isEmpty()) return next();

  const phone = getPhone(req);
  const ip = String(req.ip || 'unknown');
  const redis = getRedis();

  if (!isRedisConnected() || !redis) {
    if (failClosed) {
      logBlocked(req, phone, 'redis-unavailable');
      return res.status(503).json({ success: false, message: 'OTP service temporarily unavailable. Please try again later.' });
    }
    const result = localCheck(phone, ip);
    if (!result.allowed) {
      logBlocked(req, phone, result.reason);
      return res.status(429).json({ success: false, message: 'Too many OTP requests. Please try again later.' });
    }
    return next();
  }

  try {
    const result = await redis.eval(
      RATE_LIMIT_SCRIPT,
      4,
      'otp:global',
      `otp:ip:${ip}`,
      `otp:phone:${phone}`,
      `otp:cooldown:${phone}`,
      OTP_GLOBAL_LIMIT,
      OTP_GLOBAL_WINDOW,
      OTP_IP_LIMIT,
      OTP_WINDOW_SECONDS,
      OTP_PHONE_LIMIT,
      OTP_PHONE_COOLDOWN
    );

    if (Number(result[0]) !== 1) {
      const reason = String(result[1]);
      logBlocked(req, phone, reason);
      const message = reason === 'cooldown'
        ? 'Please wait before requesting another OTP.'
        : 'Too many OTP requests. Please try again later.';
      return res.status(429).json({ success: false, message });
    }

    return next();
  } catch (error) {
    console.error('[OTP SECURITY] Redis limiter error:', error.message);
    logBlocked(req, phone, 'redis-error');
    if (failClosed) {
      return res.status(503).json({ success: false, message: 'OTP service temporarily unavailable. Please try again later.' });
    }
    return next();
  }
};

module.exports = otpRateLimiter;