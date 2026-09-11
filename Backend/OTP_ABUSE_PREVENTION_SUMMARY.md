# OTP Abuse Prevention Summary

**Date:** 2026-09-10  
**Environment:** Production  
**Application:** GrooAgri Backend

## Incident

The public OTP endpoint was receiving automated requests even when no genuine user was using the application.

Affected endpoints:

- `POST /api/users/auth/send-otp`
- `POST /api/vendors/auth/send-otp`
- `POST /api/workers/auth/send-otp`

Observed indicators:

- Different phone numbers on successive requests
- Different client/IP identifiers
- Requests arriving without normal application usage
- Requests reaching the SMS provider
- SMS provider response: `Failed#insufficient credits`
- Gmail SMTP response: `535-5.7.8 Username and Password not accepted`

The SMS and Gmail errors are provider/account configuration issues. They are separate from the bot abuse. The security fix must remain active after provider accounts are repaired.

## Root Cause

The original protection had per-phone and per-IP limits, but attackers could rotate both phone numbers and IP addresses. There was no shared global OTP limit across all three OTP endpoints.

The frontend also had a possible duplicate-request race: React's `setIsLoading(true)` is asynchronous, so rapid double-click or Enter-plus-click could trigger more than one request before the button became disabled.

## Implemented Backend Protection

### Redis global limiter

`Backend/middleware/otpRateLimiter.js` now applies a shared Redis-backed limit across user, vendor, and worker OTP endpoints.

The limiter checks, before OTP generation or SMS delivery:

1. Global request limit
2. Per-IP request limit
3. Per-phone request limit
4. Same-phone cooldown

The Redis Lua script performs the checks atomically to avoid race conditions across PM2 processes or multiple servers.

### Redis failure behavior

Production fails closed when Redis is unavailable or the limiter encounters a Redis error:

```text
HTTP 503 OTP service temporarily unavailable
```

This prevents an unlimited SMS path during Redis outages.

### Blocked request behavior

Blocked requests return `429` and do not call:

- `generateOTP()`
- `storeOTP()`
- `sendSMSOTP()`
- Email OTP delivery

Security logs contain only safe information:

- Timestamp
- Endpoint
- Masked phone number
- Hashed client identifier
- Reason, such as `global-limit`, `ip-limit`, `phone-limit`, or `cooldown`

### Counter cap fix

The Redis counter was updated so blocked traffic cannot make the counter grow indefinitely above its configured limit. Once the limit is reached, the key remains capped at the configured limit until its TTL expires.

## Implemented Frontend Protection

Concurrent OTP calls are deduplicated in the frontend auth services:

- `Frontend/src/services/authService.js`
- `Frontend/src/modules/vendor/services/authService.js`

A second call for the same endpoint, phone number, and flow reuses the existing in-flight request instead of creating another HTTP request.

The worker login resend button also now has an immediate loading guard and is disabled while a request is pending.

## Production Configuration

Recommended production values:

```env
HOST=127.0.0.1
REDIS_ENABLED=true

OTP_RATE_LIMIT=3
OTP_RATE_WINDOW=600
OTP_IP_RATE_LIMIT=30

OTP_GLOBAL_LIMIT=300
OTP_GLOBAL_WINDOW=600
OTP_PHONE_COOLDOWN=60
OTP_GLOBAL_FAIL_CLOSED=true
```

Meaning:

- Maximum 3 requests per phone in 10 minutes
- Maximum 30 requests per IP in 10 minutes
- Maximum 300 requests globally across all OTP endpoints in 10 minutes
- Minimum 60 seconds between requests for the same phone
- Redis outage blocks OTP requests in production

Adjust `OTP_GLOBAL_LIMIT` upward only after observing genuine traffic requirements.

## Network Hardening

Nginx was verified to proxy to:

```text
http://127.0.0.1:5000/
```

The Node server was changed to bind to:

```text
127.0.0.1:5000
```

UFW was configured to deny external access to port `5000`:

```text
5000/tcp DENY Anywhere
5000/tcp DENY Anywhere (v6)
```

Public API access should therefore pass through Nginx on ports `80`/`443` only.

## Production Verification Completed

The following production checks succeeded:

```text
PM2 script path: /home/grooagri-api/htdocs/api.grooagri.com/groo/Backend/server.js
PM2 working directory: /home/grooagri-api/htdocs/api.grooagri.com/groo/Backend
Server running on 127.0.0.1:5000 in production mode
[Redis] Connected successfully
```

The deployed routes contain the limiter before the controller:

```js
router.post('/send-otp', sendOTPValidation, otpRateLimiter, sendOTP);
```

Redis was confirmed working:

```text
PONG
```

During the incident, the following security logs confirmed that bot traffic was being blocked:

```text
[OTP SECURITY] blocked ... reason:"global-limit"
```

## Safe Monitoring Commands

Check the global counter without exposing secrets:

```bash
redis-cli GET otp:global
redis-cli TTL otp:global
```

Monitor blocked requests:

```bash
pm2 logs backend --lines 0 --timestamp | grep "OTP SECURITY"
```

Monitor fresh OTP/SMS activity:

```bash
tail -f /root/.pm2/logs/backend-out.log | grep -E "OTP|SMS|SECURITY"
```

Check the active process and port:

```bash
pm2 describe backend
sudo ss -lntp | grep :5000
```

Expected listener:

```text
127.0.0.1:5000
```

## Deployment Commands

```bash
cd /home/grooagri-api/htdocs/api.grooagri.com/groo/Backend
git pull
pm2 restart backend --update-env
pm2 save
```

After deployment, confirm:

```bash
pm2 logs backend --lines 50 --nostream
redis-cli ping
sudo ss -lntp | grep :5000
```

## Current Interpretation of Logs

Allowed request sequence:

```text
[OTP] Stored in Redis
[SMS] Attempting OTP delivery
```

Blocked request sequence:

```text
[OTP SECURITY] blocked ... reason:"global-limit"
```

A blocked request must not produce a new `Stored in Redis` or `Attempting OTP delivery` line. Old PM2 log entries can appear together with newer entries, so use `pm2 flush backend` or timestamped fresh log monitoring when correlating events.

## Remaining Operational Issues

### SMS provider credits

The provider returns:

```text
Failed#insufficient credits
```

Add credits or contact the SMS provider. Do this only after confirming the abuse limiter remains active.

### Gmail SMTP credentials

Email delivery returns:

```text
535-5.7.8 Username and Password not accepted
```

Replace the SMTP password/app password and verify the configured account. Do not place credentials in source control.

### PM2 restart count

A high PM2 restart count was observed during the incident. Continue monitoring:

```bash
pm2 describe backend | grep -E "restarts|uptime|status"
pm2 logs backend --err --lines 200 --nostream
```

If the restart count increases without a manual restart, investigate the newest crash or unhandled rejection separately.

### Secrets rotation

Production credentials were previously present in environment material visible during the audit. Rotate any exposed credentials, including database, SMTP, Cloudinary, Google, Firebase, Razorpay, SMS provider, and JWT secrets. Keep secrets outside Git and avoid printing them in diagnostics.

## Final Status

The OTP abuse was confirmed as automated traffic. The backend now has distributed global protection, per-IP protection, per-phone protection, same-phone cooldown, Redis fail-closed behavior, safe security logging, frontend request deduplication, localhost-only binding, and a firewall block for direct port `5000` access.

The bot may continue sending requests to the public Nginx endpoint, but after the global threshold those requests should receive `429` and must not reach the SMS or email providers.
