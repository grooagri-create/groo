const SoilTestRequest = require('../../models/SoilTestRequest');

/**
 * Admin: Get all soil test requests
 */
const getAllSoilTestRequests = async (req, res) => {
    try {
        const requests = await SoilTestRequest.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Admin: Update soil test request status/report
 */
const updateSoilTestRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, reportUrl } = req.body;

        const request = await SoilTestRequest.findByIdAndUpdate(
            id,
            { status, adminNotes, reportUrl },
            { new: true, runValidators: true }
        );

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Soil test request updated successfully',
            data: request
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Admin: Delete soil test request
 */
const deleteSoilTestRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await SoilTestRequest.findByIdAndDelete(id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Soil test request deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllSoilTestRequests,
    updateSoilTestRequest,
    deleteSoilTestRequest
};
