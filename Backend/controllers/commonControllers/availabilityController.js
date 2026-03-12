const Booking = require('../../models/Booking');
const { BOOKING_STATUS } = require('../../utils/constants');

/**
 * Get available time slots for a specific service (equipment)
 * GET /api/availabilities?serviceId=...&date=...
 */
const getAvailableSlots = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        if (!serviceId || !date) {
            return res.status(400).json({ success: false, message: 'ServiceId and Date are required' });
        }

        // 1. Define standard Agri Slots
        const standardSlots = [
            { id: 'morning', label: 'Morning (6:00 AM - 12:00 PM)', start: '06:00', end: '12:00' },
            { id: 'afternoon', label: 'Afternoon (1:00 PM - 6:00 PM)', start: '13:00', end: '18:00' },
            { id: 'full_day', label: 'Full Day (6:00 AM - 6:00 PM)', start: '06:00', end: '18:00' }
        ];

        // 2. Fetch existing bookings for this service on this date
        // We filter by active statuses (Pending, Accepted, Confirmed, Started, In Progress)
        const activeStatuses = [
            BOOKING_STATUS.PENDING,
            BOOKING_STATUS.ACCEPTED,
            BOOKING_STATUS.CONFIRMED,
            BOOKING_STATUS.STARTED,
            BOOKING_STATUS.IN_PROGRESS
        ];

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await Booking.find({
            serviceId,
            scheduledDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: activeStatuses }
        }).select('timeSlot');

        // 3. Check availability for each slot
        const slotsWithAvailability = standardSlots.map(slot => {
            let isAvailable = true;

            // Check if any existing booking overlaps with this slot
            for (const booking of existingBookings) {
                if (!booking.timeSlot || !booking.timeSlot.start) continue;

                const bStart = booking.timeSlot.start;
                const bEnd = booking.timeSlot.end;

                // Overlap logic: (StartA < EndB) and (EndA > StartB)
                if (slot.start < bEnd && slot.end > bStart) {
                    isAvailable = false;
                    break;
                }
            }

            return {
                ...slot,
                isAvailable
            };
        });

        res.status(200).json({
            success: true,
            data: slotsWithAvailability
        });

    } catch (error) {
        console.error('Availability API Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch availability' });
    }
};

module.exports = {
    getAvailableSlots
};
