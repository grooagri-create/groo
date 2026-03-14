import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import harvesterHero from '../landing_images/hero_premium.png';

const Hero = () => {
  return (
    <section className="relative h-screen flex flex-col justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${harvesterHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-32 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-yellow-500/20 backdrop-blur-md text-yellow-500 px-4 py-1 rounded-full text-xs font-bold mb-4 tracking-widest uppercase border border-yellow-500/30">
              Founded in India
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tighter">
              GROO
            </h1>
            <p className="text-xl md:text-2xl font-bold text-yellow-500 mb-6 font-serif italic">
              Grow more with GROO
            </p>
            <p className="text-lg text-gray-200 mb-8 max-w-xl leading-relaxed">
              AgriTech Platform for On-Demand Farm Machinery & Smart Agriculture.
              Empowering farmers with instant access to high-quality agricultural machinery and AI-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/user/login"
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-xl text-center"
              >
                Book Now
              </Link>
              <Link
                to="/vendor/login"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 text-center"
              >
                Owner Registration
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center space-x-12"
          >
            <div className="text-white">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest">Active Machines</p>
            </div>
            <div className="text-white">
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest">Happy Farmers</p>
            </div>
            <div className="text-white">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest">Verified Owners</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 text-white cursor-pointer"
        onClick={() => {
          document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-yellow-500 rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
