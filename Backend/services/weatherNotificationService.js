const User = require('../models/User');
const axios = require('axios');
const { sendNotificationToUser } = require('./firebaseAdmin');
const { createNotification } = require('../controllers/notificationControllers/notificationController');

/**
 * Weather Notification Service
 * Handles daily updates and critical weather alerts for users.
 */

/**
 * Fetch weather for a specific lat/lon
 */
async function fetchWeather(lat, lon) {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) return null;

        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        return response.data;
    } catch (err) {
        console.error(`[WeatherService] Error fetching weather for ${lat},${lon}:`, err.message);
        return null;
    }
}

/**
 * Generate a friendly daily update message based on weather data
 */
function generateDailyMessage(weather) {
    const temp = Math.round(weather.main.temp);
    const description = weather.weather[0].description;
    const main = weather.weather[0].main.toLowerCase();
    const humidity = weather.main.humidity;

    let advice = "Have a great day in the fields!";

    if (main.includes('clear')) {
        advice = "Ideal weather for irrigation. Plan your field work today!";
    } else if (main.includes('cloud')) {
        advice = "Perfect temperature for crop inspection and maintenance.";
    } else if (main.includes('rain')) {
        advice = "Rain expected. Postpone pesticide sprays and check drainage.";
    }

    if (temp > 35) {
        advice = "High heat alert! Ensure extra irrigation to protect your crops from stress.";
    }

    return `Good Morning! Today: ${temp}°C, ${description}. ${advice}`;
}

/**
 * Generate a critical alert message based on weather data
 */
function generateCriticalAlert(weather) {
    const main = weather.weather[0].main.toLowerCase();
    const windSpeed = weather.wind.speed * 3.6; // km/h
    const temp = weather.main.temp;

    if (main.includes('thunderstorm') || main.includes('extreme')) {
        return "⚠️ CRITICAL WEATHER ALERT: Severe storm detected. Take cover and protect loose equipment.";
    }

    if (windSpeed > 30) {
        return `⚠️ HIGH WIND ALERT (${windSpeed.toFixed(1)} km/h): Avoid any drone services or high-elevation work.`;
    }

    if (temp > 42) {
        return `⚠️ EXTREME HEAT ALERT (${temp}°C): Major risk of crop damage. High irrigation recommended immediately.`;
    }

    if (main.includes('rain') || main.includes('drizzle')) {
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
