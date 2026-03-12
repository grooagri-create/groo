const Dispute = require('../../models/Dispute');
const Booking = require('../../models/Booking');
const { createNotification } = require('../notificationControllers/notificationController');

/**
 * Dispute Controller
 */

// Raise a new dispute (User or Vendor)
const raiseDispute = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { bookingId, reason, description, attachments } = req.body;

        // Check if booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Check for existing dispute for this booking by this user to avoid duplication
        const existing = await Dispute.findOne({ bookingId, raisedBy: userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Dispute already raised for this booking' });
        }

        const dispute = await Dispute.create({
            bookingId,
            raisedBy: userId,
            raisedByRole: userRole === 'VENDOR' ? 'VENDOR' : 'USER',
            reason,
            description,
            attachments
        });

        // Notify Admin (optional - usually Admin has a dashboard, but a notification is good)
        // We can use createNotification to internal admin if needed.

        res.status(201).json({
            success: true,
            data: dispute,
            message: 'Dispute raised successfully. Admin will review it shortly.'
        });
    } catch (error) {
        console.error('Raise dispute error:', error);
        res.status(500).json({ success: false, message: 'Failed to raise dispute' });
    }
};

// Admin: Get all disputes with filters
const getAdminDisputes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (status) filter.status = status;

        const disputes = await Dispute.find(filter)
            .populate('bookingId', 'bookingNumber status')
            .populate('raisedBy', 'name phone email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Dispute.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: disputes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get admin disputes error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch disputes' });
    }
};

// Admin: Get single dispute details
const getAdminDisputeById = async (req, res) => {
    try {
        const { id } = req.params;
        const dispute = await Dispute.findById(id)
            .populate({
                path: 'bookingId',
                populate: [
                    { path: 'userId', select: 'name phone' },
                    { path: 'vendorId', select: 'name phone' }
                ]
            })
            .populate('raisedBy', 'name phone profilePhoto')
            .populate('resolvedBy', 'name');

        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        res.status(200).json({ success: true, data: dispute });
    } catch (error) {
        console.error('Get single dispute error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dispute details' });
    }
};

// Admin: Resolve/Investigate/Dismiss dispute
const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolutionNotes } = req.body;
        const adminId = req.user.id;

        const dispute = await Dispute.findById(id);
        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found' });
        }

        dispute.status = status;
        dispute.resolutionNotes = resolutionNotes;
        if (status === 'resolved' || status === 'dismissed') {
            dispute.resolvedAt = new Date();
            dispute.resolvedBy = adminId;
        }

        await dispute.save();

        // Notify the person who raised the dispute
        await createNotification({
            userId: dispute.raisedBy,
            type: 'dispute_update',
            title: `Dispute Case ${status.toUpperCase()}`,
            message: `Admin has ${status} your dispute for booking #${dispute.bookingId}. Status: ${status}`,
            relatedId: dispute._id,
            relatedType: 'dispute'
        });

        res.status(200).json({
            success: true,
            data: dispute,
            message: `Dispute status updated to ${status}`
        });
    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ success: false, message: 'Failed to update dispute status' });
    }
};

module.exports = {
    raiseDispute,
    getAdminDisputes,
    getAdminDisputeById,
    resolveDispute
};
