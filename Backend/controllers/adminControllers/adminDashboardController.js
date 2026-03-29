const User = require('../../models/User');
const Vendor = require('../../models/Vendor');
const Worker = require('../../models/Worker');
const Booking = require('../../models/Booking');
const Withdrawal = require('../../models/Withdrawal');
const Settlement = require('../../models/Settlement');
const SoilTestRequest = require('../../models/SoilTestRequest');

const { BOOKING_STATUS, PAYMENT_STATUS, VENDOR_STATUS } = require('../../utils/constants');

/**
 * Get overall dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalVendors = await Vendor.countDocuments({ isActive: true });
    const totalWorkers = await Worker.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();

    // Booking stats
    const pendingBookings = await Booking.countDocuments({
      status: { $nin: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED] }
    });
    const completedBookings = await Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED });
    const cancelledBookings = await Booking.countDocuments({ status: BOOKING_STATUS.CANCELLED });

    // Revenue stats
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          status: BOOKING_STATUS.COMPLETED,
          paymentStatus: { $in: [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.COLLECTED_BY_VENDOR, 'success', 'collected_by_vendor', 'collected_by_worker', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const bookingRevData = revenueResult[0] || { totalRevenue: 0, totalBookings: 0 };
    const bookingRevenue = bookingRevData.totalRevenue;
    const bookingCommission = bookingRevenue * 0.2; // 20% commission

    // Soil Test Revenue
    const soilTestRevenueResult = await SoilTestRequest.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$adminCommission' },
          count: { $sum: 1 }
        }
      }
    ]);

    const soilTestRevData = soilTestRevenueResult[0] || { totalAmount: 0, totalCommission: 0, count: 0 };
    const soilTestCommission = soilTestRevData.totalCommission;

    const totalRevenue = bookingCommission + soilTestCommission;

    // Vendor approval stats
    const pendingVendors = await Vendor.countDocuments({ approvalStatus: VENDOR_STATUS.PENDING });
    const approvedVendors = await Vendor.countDocuments({ approvalStatus: VENDOR_STATUS.APPROVED });

    // Withdrawal & Settlement stats
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const pendingSettlementsCount = await Settlement.countDocuments({ status: 'pending' });

    // Recent activities (last 10 bookings)
    const recentActivityDocs = await Booking.find()
      .populate('userId', 'name phone')
      .populate('vendorId', 'name businessName')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentBookings = recentActivityDocs.map(b => ({
      id: b.bookingNumber || b._id,
      _id: b._id,
      status: b.status,
      user: { name: b.userId?.name || 'Customer' },
      serviceType: b.serviceId?.title || b.serviceName,
      price: b.finalAmount || b.basePrice || 0,
      createdAt: b.createdAt,
      acceptedAt: b.acceptedAt,
      assignedAt: b.assignedAt,
      visitedAt: b.visitedAt,
      completedAt: b.completedAt,
      workerPaymentStatus: b.workerPaymentStatus
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVendors,
          totalWorkers,
          totalBookings,
          pendingBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue: totalRevenue,
          bookingRevenue: bookingCommission,
          soilTestRevenue: soilTestCommission,
          platformCommission: totalRevenue,
          bookingCommission: bookingCommission,
          soilTestCommission: soilTestCommission,
          pendingVendors,
          approvedVendors,
          pendingWithdrawals,
          pendingSettlements: pendingSettlementsCount
        },
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats. Please try again.'
    });
  }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let groupFormat = '%Y-%m';
    if (period === 'daily') {
      groupFormat = '%Y-%m-%d';
    } else if (period === 'weekly') {
      groupFormat = '%Y-%W';
    }

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.completedAt = {};
      if (startDate) dateFilter.completedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.completedAt.$lte = new Date(endDate);
    }

    // Revenue analytics
    // Booking Revenue Analytics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: BOOKING_STATUS.COMPLETED,
          paymentStatus: { $in: [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.COLLECTED_BY_VENDOR, 'success', 'collected_by_vendor', 'collected_by_worker', 'paid'] },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$completedAt'
            }
          },
          revenue: { $sum: '$finalAmount' },
          bookings: { $sum: 1 },
          platformCommission: { $sum: { $multiply: ['$finalAmount', 0.2] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Combined revenue analytics
    const mergedData = {};

    revenueData.forEach(item => {
      const commission = item.platformCommission || 0;
      mergedData[item._id] = {
        date: item._id,
        bookingRevenue: commission,
        bookingCommission: commission,
        soilTestRevenue: 0,
        soilTestCommission: 0,
        totalRevenue: commission,
        totalCommission: commission
      };
    });

    // Soil Test Analytics
    const soilTestDateFilter = {};
    if (startDate || endDate) {
      soilTestDateFilter.updatedAt = {};
      if (startDate) soilTestDateFilter.updatedAt.$gte = new Date(startDate);
      if (endDate) soilTestDateFilter.updatedAt.$lte = new Date(endDate);
    }

    const soilTestData = await SoilTestRequest.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          ...soilTestDateFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$updatedAt'
            }
          },
          revenue: { $sum: '$totalAmount' },
          commission: { $sum: '$adminCommission' }
        }
      }
    ]);

    soilTestData.forEach(item => {
      const commission = item.commission || 0;
      if (!mergedData[item._id]) {
        mergedData[item._id] = {
          date: item._id,
          bookingRevenue: 0,
          bookingCommission: 0,
          soilTestRevenue: commission,
          soilTestCommission: commission,
          totalRevenue: commission,
          totalCommission: commission
        };
      } else {
        mergedData[item._id].soilTestRevenue = commission;
        mergedData[item._id].soilTestCommission = commission;
        mergedData[item._id].totalRevenue += commission;
        mergedData[item._id].totalCommission += commission;
      }
    });

    const finalRevenueData = Object.values(mergedData).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: {
        period,
        revenueData: finalRevenueData
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics. Please try again.'
    });
  }
};

/**
 * Get booking trends
 */
const getBookingTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Daily booking trends
    const trends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.COMPLETED] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        days: parseInt(days),
        trends
      }
    });
  } catch (error) {
    console.error('Get booking trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking trends. Please try again.'
    });
  }
};

/**
 * Get user growth metrics
 */
const getUserGrowthMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Vendor growth
    const vendorGrowth = await Vendor.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        days: parseInt(days),
        userGrowth,
        vendorGrowth
      }
    });
  } catch (error) {
    console.error('Get user growth metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user growth metrics. Please try again.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics,
  getBookingTrends,
  getUserGrowthMetrics
};

