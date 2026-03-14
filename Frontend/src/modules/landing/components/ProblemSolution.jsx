import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineCurrencyDollar, HiOutlineClock } from 'react-icons/hi';
import solutionImg from '../landing_images/tracter.jpg';

const ProblemSolution = () => {
  const problems = [
    {
      title: "Hard to Find Equipment",
      desc: "Farmers struggle to find tractors and harvesters during peak seasons.",
      icon: <HiOutlineSearch className="text-red-500 w-12 h-12" />,
    },
    {
      title: "Pricing Lack Clarity",
      desc: "No fixed rates, leading to overcharging and unexpected costs.",
      icon: <HiOutlineCurrencyDollar className="text-red-500 w-12 h-12" />,
    },
    {
      title: "Unreliable Availability",
      desc: "Equipment often isn't available when promised, delaying crops.",
      icon: <HiOutlineClock className="text-red-500 w-12 h-12" />,
    }
  ];

  const solutions = [
    {
      title: "Instant Digital Booking",
      desc: "Find and book nearby equipment in seconds through our mobile app.",
      icon: <HiOutlineSearch className="text-green-600 w-12 h-12" />,
    },
    {
      title: "Transparent Fixed Pricing",
      desc: "Know exactly what you pay with fixed rates and no hidden charges.",
      icon: <HiOutlineCurrencyDollar className="text-green-600 w-12 h-12" />,
    },
    {
      title: "Verified & Insured",
      desc: "All equipment and owners are verified to ensure quality service.",
      icon: <HiOutlineShieldCheck className="text-green-600 w-12 h-12" />,
    }
  ];

  return (
    <section id="problem" className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs text-green-700 font-bold tracking-[0.2em] uppercase mb-4">The Challenge & The Change</h2>
          <p className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 leading-tight">
            Modernizing Agriculture Rental
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Problem Section */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-red-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-150 transition-all duration-700" />
            <h3 className="text-xl font-black text-red-600 mb-6 flex items-center tracking-tight">
              Traditional Challenges
            </h3>
            <div className="space-y-3.5">
              {[
                "High cost of modern farm machinery",
                "Limited access to technology in rural areas",
                "Middleman dependency & unorganized services",
                "Lack of timely weather, soil, and crop insights",
                "Small farmers cannot afford high-cost equipment",
                "Labour shortage & rising wages"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 mt-0.5">
                    <HiOutlineClock size={12} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 leading-tight">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-5 bg-red-600 rounded-2xl text-white shadow-lg relative overflow-hidden group">
              <p className="text-lg font-bold tracking-tight relative z-10 leading-tight">
                "Problem is not lack of machinery, Problem is lack of access."
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700/50 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
            </div>
          </div>

          {/* Solution Section */}
          <div className="bg-green-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-green-800">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full -translate-y-24 translate-x-24 blur-3xl opacity-50 group-hover:scale-125 transition-all duration-1000" />
            <div className="inline-block bg-green-800 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase shadow-sm">
              Our Solution: GROO
            </div>
            <h3 className="text-3xl font-black text-white mb-6 leading-tight">Digital Ecosystem for Farm Access</h3>
            <div className="space-y-4 mb-8">
              {[
                { title: "On-Demand Rentals", desc: "Rent nearby machinery via app", icon: <HiOutlineSearch /> },
                { title: "Pay-As-You-Go", desc: "Pay for actual usage hours", icon: <HiOutlineCurrencyDollar /> },
                { title: "Verified Partners", desc: "100% verified owners", icon: <HiOutlineShieldCheck /> },
                { title: "AI-Advised Farming", desc: "Weather & crop advisory", icon: <HiOutlineClock /> }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-11 h-11 bg-green-800 rounded-2xl flex items-center justify-center text-green-400 text-xl shadow-inner group-hover:bg-green-700 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-tight">{item.title}</h4>
                    <p className="text-green-200/60 text-xs font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-800/50 text-green-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-700/50">Drones</span>
              <span className="bg-green-800/50 text-green-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-700/50">Soil Testing</span>
              <span className="bg-green-800/50 text-green-300 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-700/50">Marketplace</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
