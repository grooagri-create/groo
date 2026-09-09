const FooterContent = require('../../models/FooterContent');

/**
 * Get footer content for public view
 */
exports.getPublicFooterContent = async (req, res) => {
  try {
    let footer = await FooterContent.findOne();

    // If it doesn't exist, create a default one on the fly to return
    if (!footer) {
      footer = await FooterContent.create({
        exploreLinks: [
          { title: 'Rent Equipment', url: '/user/machinery-explorer' },
          { title: 'Latest Agriculture News', url: '/blogs' },
          { title: 'How to Book', url: '/#workflow' },
          { title: 'Platform Features', url: '/#features' },
          { title: 'Owner Dashboard', url: '/vendor/login' }
        ]
      });
    }

    res.status(200).json({
      success: true,
      data: footer
    });
  } catch (error) {
    console.error('Error fetching public footer content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
