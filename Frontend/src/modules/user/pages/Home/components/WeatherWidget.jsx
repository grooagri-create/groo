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
        if (d.includes('rain')) return <FiCloudRain className="w-8 h-8 text-white drop-shadow-md" />;
        if (d.includes('cloud')) return <FiCloud className="w-8 h-8 text-white drop-shadow-md" />;
        if (d.includes('sun') || d.includes('clear')) return <FiSun className="w-8 h-8 text-white drop-shadow-md" />;
        return <FiCloud className="w-8 h-8 text-white drop-shadow-md" />;
    };

    const displayTemp = weather ? `${Math.round(weather.current.temp)}°C` : (loading ? "..." : "--");
    const displayDesc = weather ? weather.current.description : (loading ? "Loading..." : "Unknown");
    const iconToRender = weather ? getWeatherIcon(weather.current.description) : <FiCloud className="w-8 h-8 text-white drop-shadow-md opacity-50" />;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/user/weather')}
            className="flex flex-col items-center cursor-pointer active:scale-95 transition-all group w-[70px]"
        >
            <div className="relative">
                <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md transition-all border border-white/20 ${loading ? 'animate-pulse' : 'group-hover:shadow-lg group-hover:shadow-indigo-500/30'}`}>
                    <div className="absolute inset-0 bg-white/10 rounded-full" />
                    {iconToRender}
                </div>
                {/* Temperature Badge */}
                {(!loading && weather) && (
                    <div className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm border-[1.5px] border-white">
                        {displayTemp}
                    </div>
                )}
            </div>
            <div className="text-center mt-2 w-full">
                <p className="text-[10px] font-black text-slate-800 leading-tight uppercase tracking-tight truncate">Weather</p>
                <p className="text-[8px] font-bold text-slate-400 truncate capitalize">{displayDesc}</p>
            </div>
        </motion.div>
    );
}
