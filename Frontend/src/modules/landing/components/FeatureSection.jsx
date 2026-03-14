import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMap, HiOutlineCalendar, HiOutlineBadgeCheck, HiOutlineCloud, HiOutlineChartBar, HiOutlineLockClosed } from 'react-icons/hi';
import featureImg from '../landing_images/dron_spraying1.jpg';

const FeatureSection = () => {
  const features = [
    {
      title: "Real-time Tracking",
      desc: "Live GPS tracking of your booked tractor or harvester in real-time.",
      icon: <HiOutlineMap className="w-8 h-8" />
    },
    {
      title: "Easy Scheduling",
      desc: "Pre-book machines for your harvest season to avoid last-minute rushes.",
      icon: <HiOutlineCalendar className="w-8 h-8" />
    },
    {
      title: "Verified Operators",
      desc: "Every machine comes with a skilled and verified operator for efficiency.",
      icon: <HiOutlineBadgeCheck className="w-8 h-8" />
    },
    {
      title: "Weather Alerts",
      desc: "In-app weather monitoring to help you plan your farming activities better.",
      icon: <HiOutlineCloud className="w-8 h-8" />
    },
    {
      title: "Proof of Work",
      desc: "Secure image & speedometer proof uploads for transparent billing.",
      icon: <HiOutlineChartBar className="w-8 h-8" />
    },
    {
      title: "OTP Security",
      desc: "Fully secure transactions with mobile OTP based work verification.",
      icon: <HiOutlineLockClosed className="w-8 h-8" />
    }
  ];

  return (
    <section id="features" className="py-10 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Feature Image */}
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-60"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
              <img
                src={featureImg}
                alt="Modern Farming Features"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-all duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-gray-100 max-w-[200px]">
              <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white font-black text-lg italic shadow-inner">
                A+
              </div>
              <div>
                <p className="font-black text-gray-900 leading-tight text-sm">Elite Tech</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Certified 2024</p>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">Built for Modern Farmers</h2>
              <p className="text-xs text-gray-600 font-medium">
                Packed with features that simplify every step of the agriculture process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex flex-col items-start"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 group-hover:bg-green-700 group-hover:text-white transition-all duration-300 mb-2 shadow-sm">
                    {React.cloneElement(feature.icon, { className: 'w-5 h-5' })}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
