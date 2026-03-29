import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiTruck, 
  FiShoppingBag, 
  FiWind, 
  FiSettings, 
  FiUsers, 
  FiSun,
  FiDroplet
} from 'react-icons/fi';
import TranslatedText from '../../../components/TranslatedText';

const AboutSection = () => {
    const services = [
        {
            icon: <FiTruck className="text-green-600" size={24} />,
            title: "Tractor & Harvester Booking",
            desc: "Get tractors, harvesters, thresher sprayer cultivator, cage wheel, rotavators etc on rent."
        },
        {
            icon: <FiShoppingBag className="text-orange-500" size={24} />,
            title: "Seeds & Fertilizer Ordering",
            desc: "Order farm items easily from nearby shops"
        },
        {
            icon: <FiWind className="text-blue-500" size={24} />,
            title: "Drone & Modern Farming Services",
            desc: "Access new farming technology and equipment."
        },
        {
            icon: <FiSettings className="text-red-500" size={24} />,
            title: "Heavy Machinary",
            desc: "Book heavy machines like Jcb, cranes, dumpers, loaders, drilling machines."
        },
        {
            icon: <FiDroplet className="text-cyan-500" size={24} />,
            title: "Borewell Services",
            desc: "Get borewll services when needed"
        },
        {
            icon: <FiSun className="text-yellow-500" size={24} />,
            title: "Weather & Farming Support",
            desc: "Get useful updates and support for better planning."
        }
    ];

    return (
        <section id="about" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
                            <TranslatedText>About GROO</TranslatedText>
                        </h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                            <p>
                                <TranslatedText>
                                    GROO is made to help farmers with daily farming needs in one place. They can also book tractors, harvesters, rotavators, drones, JCB, borewell machines, and other equipment on rent.
                                </TranslatedText>
                            </p>
                            <p>
                                <TranslatedText>
                                    Farmers can order seeds, fertilizers, and other farm items from nearby shops. GROO aims to make farming work easy, fast, and on time with useful support and modern technology.
                                </TranslatedText>
                            </p>
                        </div>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl bg-green-50 flex items-center justify-center p-12 overflow-hidden shadow-2xl shadow-green-900/10">
                             <div className="grid grid-cols-2 gap-4 w-full h-full">
                                    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                            <FiTruck className="text-green-600" size={24} />
                                        </div>
                                        <span className="font-bold text-xs"><TranslatedText>Rental</TranslatedText></span>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-4 translate-y-8 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                                            <FiShoppingBag className="text-orange-600" size={24} />
                                        </div>
                                        <span className="font-bold text-xs"><TranslatedText>Shop</TranslatedText></span>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-4 -translate-y-8 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                            <FiWind className="text-blue-600" size={24} />
                                        </div>
                                        <span className="font-bold text-xs"><TranslatedText>Drone</TranslatedText></span>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center text-center">
                                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
                                            <FiDroplet className="text-cyan-600" size={24} />
                                        </div>
                                        <span className="font-bold text-xs"><TranslatedText>Borewell</TranslatedText></span>
                                    </div>
                             </div>
                        </div>
                    </motion.div>
                </div>

                <div>
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-black text-gray-900">
                            <TranslatedText>Our Services</TranslatedText>
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {services.map((service, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-gray-50 p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 h-full flex flex-col text-center items-center"
                            >
                                <div className="mb-4 p-3 bg-white rounded-xl shadow-sm">
                                    {service.icon}
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2 truncate w-full">
                                    <TranslatedText>{service.title}</TranslatedText>
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <TranslatedText>{service.desc}</TranslatedText>
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
