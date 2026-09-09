const User = require('../models/User');
const axios = require('axios');
const { sendNotificationToUser } = require('./firebaseAdmin');
const { createNotification } = require('../controllers/notificationControllers/notificationController');

/**
 * Weather Notification Service
 * Handles daily updates and critical weather alerts for users.
 */

/**
 * Fetch weather for a specific lat/lon using Google Weather API
 */
async function fetchWeather(lat, lon) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.WEATHER_API_KEY;
        if (!apiKey) return null;
        
        const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&unitsSystem=METRIC`;
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.error(`[WeatherService] Error fetching weather for ${lat},${lon}:`, err.response?.data || err.message);
        return null;
    }
}

/**
 * Generate a friendly daily update message based on Google weather data
 */
function generateDailyMessage(weather) {
    const temp = Math.round(weather.temperature?.degrees || 0);
    const description = weather.weatherCondition?.description?.text || 'fair';
    const mainType = (weather.weatherCondition?.type || '').toLowerCase();
    const humidity = weather.relativeHumidity || 0;

    let advice = "Great day for farming! Keep an eye on your crops.";

    if (mainType.includes('rain') || mainType.includes('drizzle')) {
        advice = "Rain is expected. Good for natural irrigation, but check for waterlogging.";
    } else if (temp > 35) {
        advice = "It's quite hot today. Ensure your crops are well hydrated.";
    } else if (mainType.includes('clear') || mainType.includes('sunny')) {
        advice = "Ideal weather for irrigation. Plan your field work today!";
    }

    return `Morning Update: It's ${temp}°C with ${description}. ${advice}`;
}

/**
 * Generate a critical alert message based on Google weather data
 */
function generateCriticalAlert(weather) {
    const mainType = (weather.weatherCondition?.type || '').toLowerCase();
    const windSpeed = weather.wind?.speed?.value || 0; // km/h
    const temp = weather.temperature?.degrees || 0;

    if (mainType.includes('storm') || windSpeed > 40) {
        return "⚠️ CRITICAL WEATHER ALERT: Severe storm detected. Take cover and protect loose equipment.";
    }

    if (temp > 42) {
        return "🔥 HEAT ALERT: Extreme temperature detected. Protect young saplings and livestock.";
    }

    if (mainType.includes('rain') || mainType.includes('shower')) {
        return "🌧️ WEATHER ALERT: Rain detected. Avoid fertilizing or spraying today.";
    }

    return null;
}

/**
 * Send daily updates to all active users
 */
async function sendDailyUpdates() {
    console.log('[WeatherNotification] Starting daily morning updates...');
    const users = await User.find({
        'fcmTokenMobile.0': { $exists: true }, // At least one mobile token
        'settings.notifications': true,
        'addresses.0': { $exists: true } // At least one address
    });

    for (const user of users) {
        const address = user.addresses[0]; // Take primary address
        if (address && address.lat && address.lng) {
            const weather = await fetchWeather(address.lat, address.lng);
            if (weather) {
                const message = generateDailyMessage(weather);
                await createNotification({
                    userId: user._id,
                    type: 'weather_update',
                    title: '🌾 Daily Agri Update',
                    message: message,
                    data: {
                        link: '/user/weather'
                    }
                });
            }
        }
    }
    console.log(`[WeatherNotification] Daily updates sent to ${users.length} users.`);
}

/**
 * Check for critical weather conditions and send alerts
 */
async function checkAndSendCriticalAlerts() {
    console.log('[WeatherNotification] Checking for critical weather alerts...');
    const users = await User.find({
        'fcmTokenMobile.0': { $exists: true },
        'settings.notifications': true,
        'addresses.0': { $exists: true }
    });

    for (const user of users) {
        const address = user.addresses[0];
        if (address && address.lat && address.lng) {
            const weather = await fetchWeather(address.lat, address.lng);
            if (weather) {
                const alertMessage = generateCriticalAlert(weather);
                if (alertMessage) {
                    await createNotification({
                        userId: user._id,
                        type: 'weather_critical',
                        title: '⚠️ Weather Alert!',
                        message: alertMessage,
                        priority: 'high',
                        data: {
                            link: '/user/weather'
                        }
                    });
                }
            }
        }
    }
}

/**
 * Scheduler logic (To be called once on server start)
 */
function startWeatherScheduler() {
    // 1. Task: Daily update at 8:00 AM (local time)
    const scheduleDailyUpdate = () => {
        const now = new Date();
        const next8AM = new Date();
        next8AM.setHours(8, 0, 0, 0);

        if (now > next8AM) {
            next8AM.setDate(next8AM.getDate() + 1);
        }

        const delay = next8AM - now;
        console.log(`[WeatherScheduler] Next daily update scheduled in ${Math.floor(delay / 1000 / 60 / 60)}h ${Math.floor((delay / 60000) % 60)}m`);

        setTimeout(async () => {
            try {
                await sendDailyUpdates();
            } catch (err) {
                console.error('[WeatherScheduler] Error in daily update:', err);
            }
            // Reschedule for next day after running
            scheduleDailyUpdate();
        }, delay);
    };

    // 2. Task: Check for critical alerts every 3 hours
    const scheduleCriticalChecks = () => {
        setInterval(async () => {
            try {
                await checkAndSendCriticalAlerts();
            } catch (err) {
                console.error('[WeatherScheduler] Error in critical check:', err);
            }
        }, 3 * 60 * 60 * 1000); // Check every 3 hours
    };

    scheduleDailyUpdate();
    scheduleCriticalChecks();

    console.log('✅ Weather Notification Scheduler Initialized');
}

module.exports = {
    sendDailyUpdates,
    checkAndSendCriticalAlerts,
    startWeatherScheduler
};
