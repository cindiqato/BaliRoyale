const BookingModel = require('../models/Booking');
const PaymentModel = require('../models/Payment');
const UserModel = require('../models/User');
const PackageModel = require('../models/Package');
const ArchiveModel = require('../models/Archive');

// ---------- GUEST DASHBOARD ----------

const getGuestDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalBookings = await BookingModel.countDocuments({
      user: userId,
      isArchived: false,
    });
    const pending = await BookingModel.countDocuments({
      user: userId,
      status: 'pending',
      isArchived: false,
    });
    const confirmed = await BookingModel.countDocuments({
      user: userId,
      status: 'confirmed',
      isArchived: false,
    });
    const completed = await BookingModel.countDocuments({
      user: userId,
      status: 'completed',
      isArchived: false,
    });
    const cancelled = await BookingModel.countDocuments({
      user: userId,
      status: 'cancelled',
      isArchived: false,
    });

    const payments = await PaymentModel.find({
      user: userId,
      status: 'verified',
      isArchived: false,
    });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalBookings,
      pending,
      confirmed,
      completed,
      cancelled,
      totalPaid,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- STAFF DASHBOARD ----------

const getStaffDashboard = async (req, res) => {
  try {
    const pendingBookings = await BookingModel.countDocuments({
      status: 'pending',
      isArchived: false,
    });
    const confirmedBookings = await BookingModel.countDocuments({
      status: 'confirmed',
      isArchived: false,
    });
    const pendingPayments = await PaymentModel.countDocuments({
      status: 'pending',
      isArchived: false,
    });
    const pendingCancelRequests = await BookingModel.countDocuments({
      cancelRequested: true,
      cancelStatus: 'pending',
      isArchived: false,
    });
    const pendingRescheduleRequests = await BookingModel.countDocuments({
      rescheduleRequested: true,
      rescheduleStatus: 'pending',
      isArchived: false,
    });

    res.json({
      pendingBookings,
      confirmedBookings,
      pendingPayments,
      pendingCancelRequests,
      pendingRescheduleRequests,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- ADMIN DASHBOARD ----------

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments({
      isArchived: false,
    });
    const totalGuests = await UserModel.countDocuments({
      role: 'guest',
      isArchived: false,
    });
    const totalStaff = await UserModel.countDocuments({
      role: 'staff',
      isArchived: false,
    });
    const totalPackages = await PackageModel.countDocuments({
      isArchived: false,
    });
    const totalBookings = await BookingModel.countDocuments({
      isArchived: false,
    });
    const totalArchived = await ArchiveModel.countDocuments({
      isRestored: false,
    });

    res.json({
      totalUsers,
      totalGuests,
      totalStaff,
      totalPackages,
      totalBookings,
      totalArchived,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getGuestDashboard,
  getStaffDashboard,
  getAdminDashboard,
};