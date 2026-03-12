const axios = require('axios');

/**
 * Get Weather Data for a specific location
 * GET /api/weather?lat=...&lon=...
 */
const getWeatherData = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'Weather API key not configured' });
        }

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }

        // 1. Fetch Current Weather & Forecast (using 5 day / 3 hour forecast for free tier)
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        ]);

        // 2. Add Agriculture Insights based on weather
        const current = currentRes.data;
        const forecast = forecastRes.data;

        let agriAlert = "Ideal weather for farming activities.";
        const mainWeather = current.weather[0].main.toLowerCase();
        const temp = current.main.temp;
        const humidity = current.main.humidity;
        const windSpeed = current.wind.speed * 3.6; // converting m/s to km/h

        if (mainWeather.includes('rain')) {
            agriAlert = "Rain detected. Avoid pesticide spraying and ensure proper drainage in fields.";
        } else if (temp > 35) {
            agriAlert = "High temperature alert. Increase irrigation frequency to prevent crop heat stress.";
        } else if (windSpeed > 20) {
            agriAlert = "High wind speed. Avoid drone spraying or chemical applications.";
        } else if (humidity > 80 && temp > 20) {
            agriAlert = "High humidity detected. Monitor crops for potential fungal infections or pests.";
        }

        res.status(200).json({
            success: true,
            data: {
                current: {
                    temp: current.main.temp,
                    feels_like: current.main.feels_like,
                    humidity: current.main.humidity,
                    pressure: current.main.pressure,
                    wind_speed: windSpeed.toFixed(1),
                    description: current.weather[0].description,
                    icon: current.weather[0].icon,
                    city: current.name,
                    country: current.sys.country
                },
                forecast: forecast.list.filter((_, index) => index % 8 === 0).map(item => ({
                    date: item.dt_txt,
                    temp: item.main.temp,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity
                })),
                agriAlert
            }
        });

    } catch (error) {
        console.error('Weather API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error.response?.data?.message || error.message
        });
    }
};

module.exports = {
    getWeatherData
};
