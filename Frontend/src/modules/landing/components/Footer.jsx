import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
    const [showTerms, setShowTerms] = useState(false);
    const [footerData, setFooterData] = useState(null);

    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/public/website/footer`);
                const data = await res.json();
                if (data.success && data.data) {
                    setFooterData(data.data);
                }
            } catch (error) {
                console.error("Error fetching footer data:", error);
            }
        };
        fetchFooter();
    }, []);

    const content = footerData || {
        logoUrl: '/logo.png',
        byline: 'By Chinmay Anand',
        description: 'AgriTech Platform for On-Demand Farm Machinery & Smart Agriculture. GLOBAL RURAL OUTREACH ORGANISATION LLP. Smart farming for a smarter future.',
        socialLinks: {
            facebook: 'https://www.facebook.com/share/1YgEfFD8jW/',
            instagram: 'https://www.instagram.com/grooagri?igsh=MWticXBlbHR4YnVjMQ==',
            linkedin: 'https://www.linkedin.com/in/global-rural-outreach-organisation-llp-groo-4923873b8/'
        },
        exploreTitle: 'Explore Groo',
        exploreLinks: [
            { title: 'Rent Equipment', url: '/user/machinery-explorer' },
            { title: 'Latest Agriculture News', url: '/blogs' },
            { title: 'How to Book', url: '/#workflow' },
            { title: 'Platform Features', url: '/#features' },
            { title: 'Owner Dashboard', url: '/vendor/login' }
        ],
        contactTitle: 'Contact Support',
        address: 'gulni kushaha Banka bihar 813211',
        phone: '+91 91177 04450',
        email: 'grooagri@gmail.com',
        newsletterTitle: 'Stay Updated',
        newsletterSubtitle: 'Get the latest harvest season offers and new machine alerts.',
        copyrightText: 'Groo Technologies. Building the future of farming.'
    };

    return (
        <footer className="bg-gray-950 text-gray-400 py-20 border-t border-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="mb-4">
                            <img src={content.logoUrl || '/logo.png'} alt="Groo Logo" className="h-16 w-auto brightness-0 invert" />
                        </div>
                        <p className="text-yellow-500 font-black tracking-widest text-[10px] uppercase mt-2 mb-4">
                            {content.byline}
                        </p>
                        <p className="leading-relaxed text-sm">
                            {content.description}
                        </p>
                        <div className="flex space-x-5">
                            {content.socialLinks?.facebook && <a href={content.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaFacebook size={24} /></a>}
                            {content.socialLinks?.instagram && <a href={content.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaInstagram size={24} /></a>}
                            {content.socialLinks?.linkedin && <a href={content.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaLinkedin size={24} /></a>}
                            {content.socialLinks?.twitter && <a href={content.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaTwitter size={24} /></a>}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">{content.exploreTitle}</h4>
                        <ul className="space-y-4 text-sm">
                            {content.exploreLinks?.map((link, idx) => (
                                <li key={idx}><a href={link.url} className="hover:text-yellow-500 transition-colors">{link.title}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Contact */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">{content.contactTitle}</h4>
                        <ul className="space-y-4 text-sm">
                            {content.address && (
                            <li className="flex items-center space-x-3">
                                <span className="text-green-600">📍</span>
                                <span>{content.address}</span>
                            </li>
                            )}
                            {content.phone && (
                            <li className="flex items-center space-x-3">
                                <span className="text-green-600">📞</span>
                                <div>
                                    <p className="font-bold">{content.phone}</p>
                                </div>
                            </li>
                            )}
                            {content.email && (
                            <li className="flex items-center space-x-3">
                                <span className="text-green-600">📧</span>
                                <span>{content.email}</span>
                            </li>
                            )}
                            <li>
                                <button 
                                    onClick={() => setShowTerms(true)}
                                    className="hover:text-yellow-500 transition-colors underline decoration-gray-800 underline-offset-4"
                                >
                                    Privacy & Terms
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">{content.newsletterTitle}</h4>
                        <p className="text-sm mb-6">{content.newsletterSubtitle}</p>
                        <form className="flex" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Your email" 
                                className="bg-gray-900 border border-gray-800 rounded-l-lg px-4 py-3 text-sm focus:outline-none focus:border-green-600 w-full"
                            />
                            <button className="bg-green-700 text-white px-4 py-3 rounded-r-lg hover:bg-green-800 transition-colors font-bold text-xs uppercase tracking-widest">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-900 text-center text-xs uppercase tracking-widest font-medium">
                    <p>&copy; {new Date().getFullYear()} {content.copyrightText}</p>
                </div>
            </div>

            {/* Privacy & Terms Modal */}
            <AnimatePresence>
                {showTerms && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-8 md:p-12 max-w-4xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl"
                        >
                            <button 
                                onClick={() => setShowTerms(false)}
                                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <HiX size={24} className="text-gray-900" />
                            </button>
                            
                            <h2 className="text-3xl font-black text-gray-900 mb-8 border-b pb-4">Privacy & Terms of Use</h2>

                            <div className="grid md:grid-cols-2 gap-10">
                                {/* Farmer Policy */}
                                <div className="space-y-6 text-gray-700">
                                    <h3 className="text-xl font-bold text-green-700 flex items-center">
                                        <span className="mr-2">🌾</span> For Farmers (Users)
                                    </h3>
                                    <div className="space-y-4 text-sm leading-relaxed">
                                        <p><strong>1. Booking & Payments:</strong> All bookings must be made through the Groo app. Payments are secured via integrated gateways. Cancellation is free up to 24 hours before work starts.</p>
                                        <p><strong>2. Equipment Usage:</strong> Farmers must ensure a safe working environment for the machinery and operators. Any site hazards must be disclosed beforehand.</p>
                                        <p><strong>3. Data Privacy:</strong> Your location and booking history are used only to improve service efficiency. We never sell your data to third parties.</p>
                                    </div>
                                </div>

                                {/* Vendor Policy */}
                                <div className="space-y-6 text-gray-700 border-t md:border-t-0 md:border-l md:pl-10 pt-8 md:pt-0">
                                    <h3 className="text-xl font-bold text-yellow-600 flex items-center">
                                        <span className="mr-2">🚜</span> For Equipment Owners
                                    </h3>
                                    <div className="space-y-4 text-sm leading-relaxed">
                                        <p><strong>1. Verification & KYC:</strong> Owners must provide valid machine documents and KYC to list equipment. Admin verification is mandatory for live listings.</p>
                                        <p><strong>2. Service Quality:</strong> Owners are responsible for maintaining their machines in top condition. Operators must be skilled and follow safety protocols.</p>
                                        <p><strong>3. Earnings & Fees:</strong> Payouts are settled after work completion verification. Groo charges a platform fee which is disclosed during listing.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-xs text-gray-500 text-center">
                                By using the Groo platform, you agree to abide by these policies designed to ensure a fair and efficient agricultural ecosystem for all.
                                <br />Last Updated: March 2026
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
