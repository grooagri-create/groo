import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCloud, FiCloudRain, FiSun, FiWind, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import weatherService from '../../../services/weatherService';

export default function WeatherWidget() {
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const res = await weatherService.getWeather(latitude, longitude);
                        if (res.success) {
                            setWeather(res.data);
                        }
                    } catch (err) {
                        console.error("Weather error:", err);
                    } finally {
                        setLoading(false);
                    }
                },
                () => setLoading(false)
            );
        } else {
            setLoading(false);
        }
    }, []);

    const getWeatherIcon = (description) => {
        const d = description?.toLowerCase() || '';
        if (d.includes('rain')) return <FiCloudRain className="w-8 h-8 text-blue-400" />;
        if (d.includes('cloud')) return <FiCloud className="w-8 h-8 text-gray-400" />;
        if (d.includes('sun') || d.includes('clear')) return <FiSun className="w-8 h-8 text-yellow-400" />;
        return <FiCloud className="w-8 h-8 text-gray-400" />;
    };

    if (loading) return null;
    if (!weather) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/user/weather')}
            className="mx-5 mb-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl">
                    {getWeatherIcon(weather.current.description)}
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-0.5">
                        <FiMapPin className="w-3 h-3 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{weather.current.city}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 leading-none mb-1">{Math.round(weather.current.temp)}°C</h4>
                    <p className="text-xs text-slate-500 font-medium capitalize">{weather.current.description}</p>
                </div>
            </div>

            <div className="bg-emerald-50 h-10 w-10 rounded-full flex items-center justify-center text-emerald-600">
                <FiArrowRight />
            </div>

            {/* Mini Alert Tag */}
            <div className="absolute top-2 right-5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[8px] font-black uppercase tracking-tighter">
                    Agri Alert
                </span>
            </div>
        </motion.div>
    );
}
