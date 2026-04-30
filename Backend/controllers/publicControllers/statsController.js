const User = require('../../models/User');
const Vendor = require('../../models/Vendor');

/**
 * Get Public Stats for Landing Page
 * GET /api/public/stats
 */
exports.getPublicStats = async (req, res) => {
    try {
        const farmerCount = await User.countDocuments();
        const ownerCount = await Vendor.countDocuments({ status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                farmers: farmerCount,
                owners: ownerCount
            }
        });
    } catch (error) {
        console.error('Get public stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch platform stats'
        });
    }
};
