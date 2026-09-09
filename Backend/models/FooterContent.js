const mongoose = require('mongoose');

const footerContentSchema = new mongoose.Schema({
  // Brand Section
  logoUrl: { type: String, default: '/logo.png' },
  byline: { type: String, default: 'By Chinmay Anand' },
  description: { 
    type: String, 
    default: 'AgriTech Platform for On-Demand Farm Machinery & Smart Agriculture. GLOBAL RURAL OUTREACH ORGANISATION LLP. Smart farming for a smarter future.' 
  },
  
  // Social Links
  socialLinks: {
    facebook: { type: String, default: 'https://www.facebook.com/share/1YgEfFD8jW/' },
    instagram: { type: String, default: 'https://www.instagram.com/grooagri?igsh=MWticXBlbHR4YnVjMQ==' },
    linkedin: { type: String, default: 'https://www.linkedin.com/in/global-rural-outreach-organisation-llp-groo-4923873b8/' },
    twitter: { type: String, default: '' }
  },

  // Explore Quick Links
  exploreTitle: { type: String, default: 'Explore Groo' },
  exploreLinks: [{
    title: { type: String, required: true },
    url: { type: String, required: true }
  }],

  // Support & Contact
  contactTitle: { type: String, default: 'Contact Support' },
  address: { type: String, default: 'gulni kushaha Banka bihar 813211' },
  phone: { type: String, default: '+91 91177 04450' },
  email: { type: String, default: 'grooagri@gmail.com' },

  // Newsletter Section
  newsletterTitle: { type: String, default: 'Stay Updated' },
  newsletterSubtitle: { type: String, default: 'Get the latest harvest season offers and new machine alerts.' },

  // Copyright Text
  copyrightText: { 
    type: String, 
    default: 'Groo Technologies. Building the future of farming.' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FooterContent', footerContentSchema);
