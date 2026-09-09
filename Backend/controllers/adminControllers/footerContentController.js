const FooterContent = require('../../models/FooterContent');

/**
 * Get the footer content for admin
 */
exports.getFooterContent = async (req, res) => {
  try {
    let footer = await FooterContent.findOne();
    
    // If no document exists, create default one
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
    console.error('Error fetching footer content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update the footer content
 */
exports.updateFooterContent = async (req, res) => {
  try {
    const updateData = req.body;
    let footer = await FooterContent.findOne();

    if (!footer) {
      footer = new FooterContent(updateData);
      await footer.save();
    } else {
      footer = await FooterContent.findOneAndUpdate({}, updateData, { new: true });
    }

    res.status(200).json({
      success: true,
      data: footer,
      message: 'Footer content updated successfully'
    });
  } catch (error) {
    console.error('Error updating footer content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
