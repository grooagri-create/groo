const axios = require('axios');

/**
 * Get Weather Data for a specific location using Google Weather API
 * GET /api/weather?lat=...&lon=...
 */
const getWeatherData = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.WEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'Google Maps / Weather API key not configured' });
        }

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }

        // Google Weather API Endpoints
        const currentUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&unitsSystem=METRIC`;
        const forecastUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&unitsSystem=METRIC&days=10&pageSize=10`;
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

        // 1. Fetch Current Weather, Forecast, and City Name (Geocoding)
        const [currentRes, forecastRes, geocodeRes] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl),
            axios.get(geocodeUrl)
        ]);

        const current = currentRes.data;
        const forecast = forecastRes.data;
        
        // Extract exact city/locality name from Geocoding results
        let cityName = 'Current Location';
        if (geocodeRes.data.results && geocodeRes.data.results.length > 0) {
            const addressComponents = geocodeRes.data.results[0].address_components;
            const cityComp = addressComponents.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_2'));
            if (cityComp) cityName = cityComp.long_name;
        }

        // 2. Add Agriculture Insights based on weather
        const mainWeatherType = current.weatherCondition?.type || '';
        const temp = current.temperature?.degrees || 0;
        const humidity = current.relativeHumidity || 0;
        const windSpeed = current.wind?.speed?.value || 0;

        let agriAlert = "Ideal weather for farming activities.";

        if (mainWeatherType.includes('RAIN') || mainWeatherType.includes('STORM')) {
            agriAlert = "Rain detected. Avoid pesticide spraying and ensure proper drainage in fields.";
        } else if (temp > 35) {
            agriAlert = "High temperature alert. Increase irrigation frequency to prevent crop heat stress.";
        } else if (windSpeed > 20) {
            agriAlert = "High wind speed. Avoid drone spraying or chemical applications.";
        } else if (humidity > 80 && temp > 20) {
            agriAlert = "High humidity detected. Monitor crops for potential fungal infections or pests.";
        }

        // Map Google Icons
        const getIconUrl = (baseUri) => baseUri ? `${baseUri}.svg` : '';

        res.status(200).json({
            success: true,
            data: {
                current: {
                    temp: temp,
                    feels_like: current.feelsLikeTemperature?.degrees,
                    humidity: humidity,
                    pressure: current.airPressure?.meanSeaLevelMillibars,
                    wind_speed: windSpeed.toFixed(1),
                    description: current.weatherCondition?.description?.text || 'No description',
                    icon: getIconUrl(current.weatherCondition?.iconBaseUri),
                    city: cityName,
                    
                    // Extra Details for Agri Support
                    uv_index: current.uvIndex,
                    precipitation_prob: current.precipitation?.probability?.percent || 0,
                    thunderstorm_prob: current.thunderstormProbability || 0,
                    cloud_cover: current.cloudCover,
                    visibility: current.visibility?.distance,
                    sunrise: current.sunEvents?.sunriseTime || forecast.forecastDays?.[0]?.sunEvents?.sunriseTime,
                    sunset: current.sunEvents?.sunsetTime || forecast.forecastDays?.[0]?.sunEvents?.sunsetTime
                },
                forecast: (forecast.forecastDays || []).map(day => ({
                    date: `${day.displayDate.year}-${String(day.displayDate.month).padStart(2, '0')}-${String(day.displayDate.day).padStart(2, '0')}`,
                    temp: day.maxTemperature?.degrees,
                    min_temp: day.minTemperature?.degrees,
                    description: day.daytimeForecast?.weatherCondition?.description?.text || 'N/A',
                    icon: getIconUrl(day.daytimeForecast?.weatherCondition?.iconBaseUri),
                    humidity: day.daytimeForecast?.relativeHumidity,
                    
                    // Extra Forecast Details
                    uv_index: day.daytimeForecast?.uvIndex,
                    precipitation_prob: day.daytimeForecast?.precipitation?.probability?.percent || 0,
                    thunderstorm_prob: day.daytimeForecast?.thunderstormProbability || 0,
                    cloud_cover: day.daytimeForecast?.cloudCover,
                    visibility: day.daytimeForecast?.visibility?.distance,
                    sunrise: day.sunEvents?.sunriseTime,
                    sunset: day.sunEvents?.sunsetTime
                })),
                agriAlert,
                provider: 'google'
            }
        });

    } catch (error) {
        console.error('Google Weather API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data from Google',
            error: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = {
    getWeatherData
};
