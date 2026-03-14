import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTarget, FiBox, FiUsers, FiGlobe, FiShield } from 'react-icons/fi';

const CompanyDeepDive = () => {
    const marketStats = [
        { label: "Farmers in India", value: "140M+", desc: "The backbone of the Indian economy." },
        { label: "GDP Contribution", value: "18%", desc: "Agriculture's significant share in national GDP." },
        { label: "Mechanization", value: "Low", desc: "Huge scope for digital mechanization platforms." },
        { label: "Opportunity", value: "Billions", desc: "Agricultural services market is scaling rapidly." }
    ];

    const businessModel = [
        "Commission on machinery rentals",
        "Marketplace commission on agri inputs",
        "Premium listings for equipment owners",
        "Subscription for advanced services",
        "Data-driven advisory & Partnerships"
    ];

    const impacts = [
        { title: "Increase Productivity", icon: <FiTrendingUp /> },
        { title: "Reduce Equipment Costs", icon: <FiShield /> },
        { title: "Create Rural Employment", icon: <FiUsers /> },
        { title: "Improve Farmers' Income", icon: <FiBox /> },
        { title: "Modern Tech to Villages", icon: <FiGlobe /> },
        { title: "Timely Availability", icon: <FiTarget /> }
    ];

    return (
        <section id="company" className="py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Vision Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center max-w-4xl mx-auto"
                >
                    <h2 className="text-xs text-green-700 font-bold tracking-[0.3em] uppercase mb-4">Our Vision & Mission</h2>
                    <p className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-6 tracking-tighter">
                        Organizing the Unstructured <br />
                        <span className="text-green-600 font-serif italic text-xl md:text-3xl">Agricultural Service Sector</span>
                    </p>
                    <p className="text-base text-gray-600 leading-relaxed font-medium bg-gray-50 p-6 rounded-3xl border border-gray-100 italic shadow-inner">
                        "To build India’s—and eventually the world’s—largest digital ecosystem for farm mechanization and smart agriculture, enabling farmers to access modern equipment, AI-driven advisory, and agricultural inputs efficiently."
                    </p>
                    <p className="mt-6 text-lg font-black text-red-600 animate-pulse">
                        ➡️ No farmers should lose income because a tractor or harvester arrived late.
                    </p>
                </motion.div>

                {/* Market Opportunity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Market Opportunity</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed text-base">
                            India has tractors, India has farmers, but India doesn’t have a system. 
                            <strong className="text-green-700"> We are building the system.</strong> With over 140 million households depending on agriculture, the shift toward Agritech is not just a trend—it's a necessity.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {marketStats.map((stat, i) => (
                                <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-green-200 transition-all">
                                    <p className="text-2xl font-black text-green-700 mb-0.5 tracking-tighter">{stat.value}</p>
                                    <p className="text-[10px] font-black text-gray-800 mb-0.5 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{stat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-[2rem] blur-3xl -z-10" />
                        <div className="bg-gray-950 rounded-[2.5rem] p-8 text-white shadow-2xl border border-gray-800">
                            <h3 className="text-[10px] font-black mb-6 text-yellow-500 uppercase tracking-widest border-l-4 border-yellow-500 pl-4">Business Model</h3>
                            <ul className="space-y-4">
                                {businessModel.map((item, i) => (
                                    <li key={i} className="flex items-center space-x-3 group">
                                        <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500">
                                            <FiTarget size={12} />
                                        </div>
                                        <span className="font-bold text-gray-400 text-sm group-hover:text-white transition-colors duration-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Impact Section */}
                <div className="mb-12">
                    <h3 className="text-2xl font-black text-gray-900 text-center mb-8 uppercase tracking-tighter">Impact on Rural Ecosystem</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {impacts.map((impact, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-3 group-hover:bg-green-600 group-hover:text-white transition-all">
                                    {React.cloneElement(impact.icon, { size: 18 })}
                                </div>
                                <p className="text-[10px] font-black text-gray-800 uppercase tracking-tight">{impact.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scalability & Team */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <FiTrendingUp size={100} />
                        </div>
                        <h3 className="text-2xl font-black mb-4">Scalability</h3>
                        <p className="text-green-100 mb-6 leading-relaxed font-medium text-sm">
                            Designed for rapid expansion through districts and villages, integrating AI and data-driven farming. Our framework scales across multi-state regions and global economies.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/20 uppercase tracking-wider">AI Integration</span>
                            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/20 uppercase tracking-wider">District Expansion</span>
                        </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-md flex flex-col justify-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-2">Founder & CEO</p>
                        <h3 className="text-2xl font-black text-gray-900 mb-1">Chinmay Anand</h3>
                        <p className="text-xs text-gray-500 font-bold mb-4">Designated Partner</p>
                        <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic border-l-4 border-green-600 pl-4">
                            "Transforming agriculture through technology."
                        </p>
                        <div className="mt-6">
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-0.5">Company</p>
                            <p className="text-[11px] font-black text-gray-800 leading-tight">GLOBAL RURAL OUTREACH ORGANISATION LLP</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CompanyDeepDive;
