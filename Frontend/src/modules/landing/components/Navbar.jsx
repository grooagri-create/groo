import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '#services' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Features', href: '#features' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img src="/logo.png" alt="Groo Logo" className="h-14 md:h-16 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-yellow-500 ${isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
              >
                {link.name}
              </a>
            ))}
            <div className="flex items-center space-x-3">
              <Link
                to="/user/login"
                className="bg-green-700 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-green-800 transition-colors shadow-lg"
              >
                Join as User
              </Link>
              <Link
                to="/vendor/login"
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${isScrolled ? 'border-green-700 text-green-700 hover:bg-green-50' : 'border-white text-white hover:bg-white/10'
                  }`}
              >
                Join as Vendor
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 px-3 space-y-3">
                <Link
                  to="/user/login"
                  className="block w-full text-center bg-green-700 text-white px-6 py-3 rounded-lg text-base font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  Join as User
                </Link>
                <Link
                  to="/vendor/login"
                  className="block w-full text-center border-2 border-green-700 text-green-700 px-6 py-3 rounded-lg text-base font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  Join as Vendor
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
