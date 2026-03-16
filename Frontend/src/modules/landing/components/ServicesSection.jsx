import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTractor } from 'react-icons/lu';
import { GiScythe, GiDustCloud, GiDrippingTube, GiWheat } from 'react-icons/gi';
import { RiGamepadLine } from 'react-icons/ri';
import { HiX, HiOutlineUsers } from 'react-icons/hi';

// Import Images
import tractorImg from '../landing_images/tracter1.jpg';
import harvesterImg from '../landing_images/harvester2.jpg';
import droneImg from '../landing_images/dron_spraying.jpg';
import soilImg from '../landing_images/soil_testing2.jpg';
import seedsImg from '../landing_images/fertilizer_seeds3.jpg';
import advisoryImg from '../landing_images/crop_advasory.jpg';
import labourImg from '../landing_images/labour2.jpg';

const services = [
  {
    id: 1,
    title: "Tractor Rental",
    desc: "Top HP tractors for plowing, tilling and transport.",
    image: tractorImg,
    details: "Our fleet includes top brands like Mahindra, John Deere, and Swaraj. You can book tractors for plowing, tilling, or transportation. All tractors are fuel-efficient and come with verified operators if requested.",
    icon: <LuTractor className="w-5 h-5 text-green-700" />,
    color: "bg-green-50",
    specs: ["30HP - 90HP Range", "Verified Operators", "Attachments available"]
  },
  {
    id: 2,
    title: "Harvester Booking",
    desc: "Modern harvesters for minimal grain loss during harvest.",
    image: harvesterImg,
    details: "High-performance combine harvesters that minimize grain loss. Suitable for various crops including wheat, soybean, and paddy. Flexible booking by hour or acre.",
    icon: <GiScythe className="w-5 h-5 text-yellow-700" />,
    color: "bg-yellow-50",
    specs: ["Minimal Grain Loss", "GPS-linked Billing", "24/7 Season Support"]
  },
  {
    id: 3,
    title: "Drone Spraying",
    desc: "Precision pesticide & fertilizer spraying using drones.",
    image: droneImg,
    icon: <RiGamepadLine className="w-5 h-5 text-blue-700" />,
    details: "Drones cover 1 acre in just 10-15 minutes, ensuring uniform spraying and 90% water saving. Expert pilots handle the operation.",
    color: "bg-blue-50",
    specs: ["10 min per Acre", "90% Water Saving", "Precision Targeting"]
  },
  {
    id: 4,
    title: "Soil Testing",
    desc: "Soil health analysis to maximize crop yield & quality.",
    image: soilImg,
    details: "Get a comprehensive soil health card covering NPK levels, pH, organic carbon, and micronutrients. Results within 48 hours.",
    icon: <GiDrippingTube className="w-5 h-5 text-purple-700" />,
    color: "bg-purple-50",
    specs: ["NPK & pH Analysis", "48hr Lab Results", "Custom Fertilizer Plan"]
  },
  {
    id: 5,
    title: "Seeds & Fertilizer",
    desc: "Certified high-yield seeds & organic fertilizers.",
    image: seedsImg,
    details: "Find certified, high-germination seeds and premium organic/inorganic fertilizers directly from top manufacturers.",
    icon: <GiDustCloud className="w-5 h-5 text-orange-700" />,
    color: "bg-orange-50",
    specs: ["Certified Seeds", "Quality Checked", "Doorstep Delivery"]
  },
  {
    id: 6,
    title: "Crop Advisory",
    desc: "Expert advice on crop selection based on weather forecasts.",
    image: advisoryImg,
    details: "Access AI-driven and expert-verified advice based on your local soil data and 15-day weather forecasts.",
    icon: <GiWheat className="w-5 h-5 text-emerald-700" />,
    color: "bg-emerald-50",
    specs: ["Weather Alerts", "Expert Consultations", "Pest Risk Alerts"]
  },
  {
    id: 7,
    title: "Labour Management",
    desc: "Skilled operators & farm labor for seasonal needs.",
    image: labourImg,
    details: "Groo connects you with verified and skilled agricultural workers. Find reliable help at standardized rates.",
    icon: <HiOutlineUsers className="w-5 h-5 text-cyan-700" />,
    color: "bg-cyan-50",
    specs: ["Verified Skillsets", "Skill-based Rating", "Direct Work Tracking"]
  }
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scrolling logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [services.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % services.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);

  return (
    <section id="services" className="py-8 bg-gray-50 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-6 px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">Agriculture Services</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto font-medium">
            Smart farming solutions designed for modern agriculture.
          </p>
        </div>

        {/* Floating Slider Container */}
        <div className="relative w-full group">
          <div className="relative h-[420px] md:h-[320px] overflow-hidden bg-white rounded-[2rem] shadow-xl border border-gray-100">
            <AnimatePresence>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col md:flex-row"
              >
                {/* Image Section */}
                <div className="w-full md:w-7/12 h-56 md:h-full relative overflow-hidden">
                  <img 
                    src={services[currentIndex].image} 
                    alt={services[currentIndex].title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
                </div>

                {/* Content Section */}
                <div className="w-full md:w-5/12 p-6 md:p-8 flex flex-col justify-center text-left bg-white relative z-10">
                  <div className="flex flex-col mb-4">
                     <div className="inline-flex items-center space-x-3 mb-2">
                        <div className="p-2 rounded-xl bg-green-50 text-green-700 shadow-inner">
                            {React.cloneElement(services[currentIndex].icon, { className: 'w-4 h-4' })}
                        </div>
                        <span className="text-green-600 font-extrabold text-[9px] uppercase tracking-[0.2em]">Premium Solution</span>
                     </div>
                     <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-tight mb-2">
                        {services[currentIndex].title}
                     </h3>
                     <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-sm line-clamp-2 md:line-clamp-3">
                        {services[currentIndex].desc}
                     </p>
                  </div>

                  <div>
                    <button 
                      onClick={() => setSelectedService(services[currentIndex])}
                      className="inline-flex items-center bg-green-700 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 transform hover:-translate-y-1"
                    >
                      <span className="mr-3">View Details</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 pointer-events-none z-30">
                <button 
                    onClick={prevSlide}
                    className="pointer-auto pointer-events-auto w-10 h-10 md:w-11 md:h-11 bg-white/30 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-gray-800 hover:bg-white hover:text-green-700 transition-all shadow-lg group/nav"
                >
                    <svg className="w-5 h-5 transform group-hover/nav:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button 
                    onClick={nextSlide}
                    className="pointer-auto pointer-events-auto w-10 h-10 md:w-11 md:h-11 bg-white/30 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-gray-800 hover:bg-white hover:text-green-700 transition-all shadow-lg group/nav"
                >
                    <svg className="w-5 h-5 transform group-hover/nav:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="flex justify-center mt-10 space-x-2">
            {services.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-700 h-1 rounded-full ${
                  currentIndex === idx ? 'w-12 bg-green-700' : 'w-3 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full relative shadow-2xl overflow-hidden"
            >
                <button 
                    onClick={() => setSelectedService(null)}
                    className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <HiX size={24} className="text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-6 mb-8">
                    <div className={`p-4 rounded-3xl ${selectedService.color}`}>
                        {selectedService.icon}
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{selectedService.title}</h3>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-10">
                    {selectedService.details}
                </p>

                <div className="bg-gray-50 rounded-3xl p-6 mb-10">
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Service Highlights</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedService.specs.map((spec, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-gray-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="font-medium">{spec}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => setSelectedService(null)}
                        className="bg-green-700 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-800 transition-all flex-grow shadow-lg"
                    >
                        Book Now via App
                    </button>
                    <button 
                        onClick={() => setSelectedService(null)}
                        className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                        Contact support
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;
