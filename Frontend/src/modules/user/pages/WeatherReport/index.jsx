import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCloud, FiCloudRain, FiCloudSnow, FiSun, FiWind, FiDroplet, FiChevronLeft, FiAlertTriangle, FiThermometer } from 'react-icons/fi';
import { motion } from 'framer-motion';
import weatherService from '../../services/weatherService';
import { themeColors } from '../../../../theme';

export default function WeatherReport() {
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = () => {
            setLoading(true);
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const res = await weatherService.getWeather(latitude, longitude);
                            if (res.success) {
                                setWeather(res.data);
                            } else {
                                setError(res.message);
                            }
                        } catch (err) {
                            setError("Failed to fetch weather data");
                        } finally {
                            setLoading(false);
                        }
                    },
                    (err) => {
                        setError("Location access denied. Please allow location to see weather for your fields.");
                        setLoading(false);
                    }
                );
            } else {
                setError("Geolocation is not supported by your browser");
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const getWeatherIcon = (description) => {
        const d = description.toLowerCase();
        if (d.includes('rain')) return <FiCloudRain className="w-12 h-12 text-blue-400" />;
        if (d.includes('cloud')) return <FiCloud className="w-12 h-12 text-gray-400" />;
        if (d.includes('snow')) return <FiCloudSnow className="w-12 h-12 text-blue-200" />;
        if (d.includes('sun') || d.includes('clear')) return <FiSun className="w-12 h-12 text-yellow-400" />;
        return <FiCloud className="w-12 h-12 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Fetching mausam report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-slate-100">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
                        <FiChevronLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <h1 className="text-lg font-black text-slate-800">Weather Report</h1>
                </div>
                <div className="p-6 text-center">
                    <FiAlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-bold mb-2">Oops!</p>
                    <p className="text-gray-600 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-slate-100">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <FiChevronLeft className="w-6 h-6 text-slate-800" />
                </button>
                <h1 className="text-lg font-black text-slate-800">Agri Weather Report</h1>
            </div>

            <main className="px-5 pt-6">
                {/* Current Weather Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Current Weather</p>
                            <h2 className="text-2xl font-black text-slate-800">{weather.current.city}</h2>
                            <p className="text-slate-500 capitalize">{weather.current.description}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-2xl">
                            {getWeatherIcon(weather.current.description)}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <h1 className="text-6xl font-black text-slate-900">{Math.round(weather.current.temp)}°</h1>
                        <div className="h-10 w-px bg-slate-100"></div>
                        <div className="space-y-1">
                            <p className="text-sm text-slate-500 font-medium leading-none">Feels like</p>
                            <p className="text-lg font-bold text-slate-800 leading-none">{Math.round(weather.current.feels_like)}°</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                        <div className="text-center">
                            <FiDroplet className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Humidity</p>
                            <p className="font-bold text-slate-800">{weather.current.humidity}%</p>
                        </div>
                        <div className="text-center">
                            <FiWind className="w-5 h-5 text-teal-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Wind</p>
                            <p className="font-bold text-slate-800">{weather.current.wind_speed} <span className="text-[10px]">km/h</span></p>
                        </div>
                        <div className="text-center">
                            <FiThermometer className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Pressure</p>
                            <p className="font-bold text-slate-800">{weather.current.pressure} <span className="text-[10px]">hPa</span></p>
                        </div>
                    </div>
                </motion.div>

                {/* Agri Insights Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-600 rounded-3xl p-6 text-white mb-8 relative overflow-hidden shadow-lg shadow-emerald-100"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <FiSun className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <FiAlertTriangle className="w-4 h-4" />
                        </div>
                        <h3 className="font-black text-lg">Agri Advisory</h3>
                    </div>
                    <p className="text-emerald-50 text-sm leading-relaxed font-medium">
                        {weather.agriAlert}
                    </p>
                </motion.div>

                {/* 5 Day Forecast */}
                <h3 className="text-lg font-black text-slate-800 mb-4 px-1">Upcoming Days</h3>
                <div className="space-y-3">
                    {weather.forecast.map((day, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-white rounded-2xl p-4 flex items-center justify-between border border-dashed border-slate-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                    {getWeatherIcon(day.description)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">
                                        {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium capitalize">{day.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-slate-800">{Math.round(day.temp)}°</p>
                                <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase">
                                    <FiDroplet className="w-2 h-2" />
                                    {day.humidity}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
