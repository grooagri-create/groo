const SoilTestRequest = require('../../models/SoilTestRequest');
const Admin = require('../../models/Admin');
const { createNotification } = require('../notificationControllers/notificationController');

/**
 * User: Create Soil Test Request
 */
const createSoilTestRequest = async (req, res) => {
    try {
        const { landSize, location, cropType, phoneNumber } = req.body;

        const newRequest = new SoilTestRequest({
            userId: req.user.id,
            landSize,
            location,
            cropType,
            phoneNumber
        });

        await newRequest.save();

        // Notify Admins
        try {
            const admins = await Admin.find({ isActive: true });
            const notifications = admins.map(admin => createNotification({
                adminId: admin._id,
                type: 'soil_test_request',
                title: 'New Soil Test Request',
                message: `Farmer ${req.user.name || 'A user'} has requested a soil test for ${landSize} land.`,
                relatedId: newRequest._id,
                relatedType: 'service',
                data: {
                    requestId: newRequest._id,
                    farmerName: req.user.name
                }
            }));
            await Promise.all(notifications);
        } catch (noticeErr) {
            console.error('[SoilTest] Notification error:', noticeErr);
        }

        res.status(201).json({
            success: true,
            message: 'Soil test request submitted successfully!',
            data: newRequest
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * User: Get my soil test requests
 */
const getMySoilTestRequests = async (req, res) => {
    try {
        const requests = await SoilTestRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSoilTestRequest,
    getMySoilTestRequests
};
