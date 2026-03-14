import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUser, HiOutlineTruck, HiOutlineShieldCheck } from 'react-icons/hi';

import farmerImg from '../landing_images/tracter.jpg';
import ownerImg from '../landing_images/harvester.jpg';
import adminImg from '../landing_images/admin_dashboard.png';

const WorkflowSection = () => {
  const [activeTab, setActiveTab] = useState('farmer');

  const workflows = {
    farmer: {
      title: "Farmer Journey",
      image: farmerImg,
      color: "green",
      steps: ["OTP Login", "Select Location", "Search Machine", "Check Slot", "Secure Pay", "Review"]
    },
    owner: {
      title: "Owner Journey",
      image: ownerImg,
      color: "yellow",
      steps: ["KYC Auth", "List Machine", "Admin Verify", "Get Orders", "Start Work", "Direct Pay"]
    },
    admin: {
      title: "Admin Journey",
      image: adminImg,
      color: "blue",
      steps: ["Verify KYC", "Fleet Monitor", "Global Push", "Escrow Pay", "Analytics", "Support"]
    }
  };

  return (
    <section id="workflow" className="py-10 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">How It Works</h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto font-medium">
            A seamless experience built for India's agriculture ecosystem.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="inline-flex bg-gray-800/50 p-1.5 rounded-2xl mb-6 backdrop-blur-md">
          {['farmer', 'owner', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              className={`px-6 py-2.5 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest ${activeTab === role ? 'bg-green-700 text-white shadow-xl' : 'text-gray-400 hover:text-white'
                }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Split Workflow Visualization */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col lg:flex-row bg-gray-800/30 rounded-[3rem] border border-gray-800 overflow-hidden"
            >
              {/* Image Side */}
              <div className="lg:w-1/2 h-80 lg:h-auto overflow-hidden relative">
                <img
                  src={workflows[activeTab].image}
                  alt={workflows[activeTab].title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-gray-900 to-transparent" />
                <div className="absolute bottom-10 left-10 text-left">
                  <h3 className="text-3xl font-black text-white">{workflows[activeTab].title}</h3>
                </div>
              </div>

              {/* Steps Side */}
              <div className="lg:w-1/2 p-6 lg:p-8 text-left flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  {workflows[activeTab].steps.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-4 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-lg font-black text-yellow-500 group-hover:scale-110 group-hover:border-yellow-500 transition-all">
                        {idx + 1}
                      </div>
                      <p className="font-bold text-gray-200 text-xs tracking-wide">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-800 flex items-center space-x-4 text-gray-500">
                  <HiOutlineShieldCheck size={20} className="text-green-500" />
                  <p className="text-[10px] font-medium italic">Integrated with Real-time OTP & GPS Tracking for complete transparency</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
