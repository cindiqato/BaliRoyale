const BookingModel = require('../models/Booking');
const PackageModel = require('../models/Package');
const UserModel = require('../models/User');
const { logAction } = require('./auditLogController');
const sendBookingEmail = require('../middleware/mailer');

const HOLD_MINUTES = 15;

const generateBookingRef = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'BR-' + Date.now().toString().slice(-6) + '-' + random;
};

// Cancels any pending bookings whose 15-min hold has expired.
// Called before availability checks and before creating new bookings.
const sweepExpiredHolds = async () => {
  const now = new Date();
  const expired = await BookingModel.find({
    status: 'pending',
    isSlotBlocked: true,
    expiresAt: { $lte: now },
  });

  for (const b of expired) {
    b.status = 'payment_timeout';
    b.isSlotBlocked = false;
    b.isActiveConfirmed = false;
    b.statusHistory.push({
      status: 'payment_timeout',
      changedAt: now,
      remarks: 'Payment not submitted within 15 minutes',
    });
    await b.save();
  }

  return expired.length;
};

const createBooking = async (req, res) => {
  try {
    // Free any expired holds so the slot is truly free
    await sweepExpiredHolds();

    const {
      packageId,
      bookingDate,
      startTime,
      endTime,
      guestCount,
      addOns,
      specialRequests,
    } = req.body;

    if (!packageId || !bookingDate || !startTime || !endTime || !guestCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pkg = await PackageModel.findById(packageId);
    if (!pkg || pkg.isArchived) {
      return res.status(404).json({ error: 'Package not found' });
    }

    if (guestCount < 1) {
      return res.status(400).json({ error: 'Guest count must be at least 1' });
    }

    if (guestCount > pkg.maxPax) {
      return res.status(400).json({
        error: `Guest count exceeds package maximum of ${pkg.maxPax}`,
      });
    }

    const baseRate = pkg.baseRate;
    const excessGuests = Math.max(0, guestCount - pkg.includedPax);
    const excessPaxFee = excessGuests * pkg.excessPaxRate;
    const addOnsFee = 0;
    const securityDeposit = 3000;
    const totalAmount = baseRate + excessPaxFee + addOnsFee + securityDeposit;
    const downPayment = Math.round(totalAmount * 0.5);
    const balanceDue = totalAmount - downPayment;

    const normalizedDate = new Date(bookingDate);
    const bookingDateUTC = new Date(
      Date.UTC(
        normalizedDate.getUTCFullYear(),
        normalizedDate.getUTCMonth(),
        normalizedDate.getUTCDate()
      )
    );

    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

    const booking = new BookingModel({
      bookingRef: generateBookingRef(),
      user: req.user.id,
      package: pkg._id,
      bookingDate: bookingDateUTC,
      startTime,
      endTime,
      guestCount,
      addOns: addOns || [],
      pricing: {
        baseRate,
        excessPaxFee,
        addOnsFee,
        securityDeposit,
        totalAmount,
        downPayment,
        balanceDue,
      },
      status: 'pending',
      isSlotBlocked: true,
      expiresAt,
      specialRequests,
      statusHistory: [
        {
          status: 'pending',
          changedBy: req.user.id,
          remarks: `Booking created. Payment due within ${HOLD_MINUTES} minutes.`,
        },
      ],
    });

    try {
      await booking.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          error:
            'This slot is currently held by another guest. Please pick a different date or time.',
        });
      }
      throw err;
    }

    res.json({ message: 'Booking created', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const checkAvailability = async (req, res) => {
  try {
    // Sweep first so expired holds don't block the slot
    await sweepExpiredHolds();

    const { packageId, bookingDate, startTime } = req.body;

    if (!packageId || !bookingDate || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const targetDate = new Date(bookingDate);
    const dayStart = new Date(
      Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate()
      )
    );
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const existing = await BookingModel.findOne({
      package: packageId,
      bookingDate: { $gte: dayStart, $lt: dayEnd },
      startTime,
      isSlotBlocked: true,
    });

    res.json({ available: !existing });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    await sweepExpiredHolds();
    const bookings = await BookingModel.find({
      user: req.user.id,
      isArchived: false,
    })
      .populate('package', 'name baseRate')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    await sweepExpiredHolds();
    const bookings = await BookingModel.find({ isArchived: false })
      .populate('package', 'name baseRate')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBookingById = async (req, res) => {
  try {
    await sweepExpiredHolds();
    const booking = await BookingModel.findById(req.params.id)
      .populate('package')
      .populate('user', 'firstName lastName email phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isStaffOrAdmin =
      req.user.role === 'staff' || req.user.role === 'admin';
    const isOwner = booking.user._id.toString() === req.user.id;

    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be confirmed' });
    }

    booking.isSlotBlocked = true;
    booking.isActiveConfirmed = true;
    booking.expiresAt = undefined;
    booking.status = 'confirmed';
    booking.statusHistory.push({
      status: 'confirmed',
      changedBy: req.user.id,
      remarks: 'Booking confirmed',
    });

    await booking.save();

    await logAction({
      actor: req.user.id,
      action: 'confirm_booking',
      targetModel: 'bookings',
      targetId: booking._id,
      details: `Confirmed booking ${booking.bookingRef}`,
    });

    const guest = await UserModel.findById(booking.user);
    if (guest) {
      await sendBookingEmail({
        to: guest.email,
        subject: `Booking Confirmed — ${booking.bookingRef}`,
        html: `
          <h2>Your booking is confirmed!</h2>
          <p>Hi ${guest.firstName},</p>
          <p>Your reservation at <strong>Bali Royale Private Resort</strong> is confirmed.</p>
          <ul>
            <li><strong>Booking Reference:</strong> ${booking.bookingRef}</li>
            <li><strong>Date:</strong> ${new Date(booking.bookingDate).toDateString()}</li>
            <li><strong>Time:</strong> ${booking.startTime} – ${booking.endTime}</li>
            <li><strong>Guests:</strong> ${booking.guestCount}</li>
            <li><strong>Total Amount:</strong> PHP ${booking.pricing.totalAmount}</li>
          </ul>
          <p>We look forward to hosting you!</p>
          <p>— Bali Royale</p>
        `,
      });
    }

    res.json({ message: 'Booking confirmed', booking });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Another confirmed booking already exists for this date and time',
      });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const checkInBooking = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be checked in' });
    }

    booking.status = 'checked_in';
    booking.isSlotBlocked = true;
    booking.isActiveConfirmed = true;
    booking.statusHistory.push({
      status: 'checked_in',
      changedBy: req.user.id,
      remarks: 'Guest checked in',
    });

    await booking.save();
    res.json({ message: 'Checked in', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const completeBooking = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'checked_in') {
      return res.status(400).json({ error: 'Only checked-in bookings can be completed' });
    }

    booking.isSlotBlocked = false;
    booking.isActiveConfirmed = false;
    booking.status = 'completed';
    booking.statusHistory.push({
      status: 'completed',
      changedBy: req.user.id,
      remarks: 'Booking completed',
    });

    await booking.save();
    res.json({ message: 'Booking completed', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const noShowBooking = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be marked no-show' });
    }

    booking.isSlotBlocked = false;
    booking.isActiveConfirmed = false;
    booking.status = 'no_show';
    booking.depositStatus = 'deducted';
    booking.depositDeduction = booking.pricing.securityDeposit;
    booking.depositReason = 'No-show - deposit forfeited';
    booking.statusHistory.push({
      status: 'no_show',
      changedBy: req.user.id,
      remarks: 'Guest did not show up',
    });

    await booking.save();
    res.json({ message: 'Marked as no-show', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const requestCancel = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['cancelled', 'completed', 'no_show', 'payment_timeout'].includes(booking.status)) {
      return res.status(400).json({ error: 'This booking can no longer be cancelled' });
    }

    if (booking.cancelRequested) {
      return res.status(400).json({ error: 'Cancellation already requested' });
    }

    booking.cancelRequested = true;
    booking.cancelReason = req.body.reason || 'No reason provided';
    booking.cancelStatus = 'pending';
    booking.statusHistory.push({
      status: 'cancel_requested',
      changedBy: req.user.id,
      remarks: booking.cancelReason,
    });

    await booking.save();
    res.json({ message: 'Cancellation requested', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const approveCancel = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!booking.cancelRequested || booking.cancelStatus !== 'pending') {
      return res.status(400).json({ error: 'No pending cancellation request' });
    }

    booking.cancelStatus = 'approved';
    booking.isSlotBlocked = false;
    booking.isActiveConfirmed = false;
    booking.status = 'cancelled';
    booking.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user.id,
      remarks: 'Cancellation approved',
    });

    await booking.save();

    await logAction({
      actor: req.user.id,
      action: 'approve_cancel',
      targetModel: 'bookings',
      targetId: booking._id,
      details: `Approved cancellation for ${booking.bookingRef}`,
    });

    const guest = await UserModel.findById(booking.user);
    if (guest) {
      await sendBookingEmail({
        to: guest.email,
        subject: `Booking Cancelled — ${booking.bookingRef}`,
        html: `
          <h2>Your booking has been cancelled</h2>
          <p>Hi ${guest.firstName},</p>
          <p>Your reservation <strong>${booking.bookingRef}</strong> on ${new Date(booking.bookingDate).toDateString()} has been cancelled.</p>
          <p>If you have questions, please contact the resort directly.</p>
          <p>— Bali Royale</p>
        `,
      });
    }

    res.json({ message: 'Cancellation approved', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const rejectCancel = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!booking.cancelRequested || booking.cancelStatus !== 'pending') {
      return res.status(400).json({ error: 'No pending cancellation request' });
    }

    booking.cancelStatus = 'rejected';
    booking.cancelRequested = false;
    booking.statusHistory.push({
      status: 'cancel_rejected',
      changedBy: req.user.id,
      remarks: req.body.reason || 'Cancellation rejected',
    });

    await booking.save();
    res.json({ message: 'Cancellation rejected', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const requestReschedule = async (req, res) => {
  try {
    const { newDate, newStartTime, newEndTime, reason } = req.body;

    if (!newDate || !newStartTime || !newEndTime) {
      return res.status(400).json({ error: 'New date and time required' });
    }

    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['cancelled', 'completed', 'no_show', 'payment_timeout'].includes(booking.status)) {
      return res.status(400).json({ error: 'This booking can no longer be rescheduled' });
    }

    if (booking.rescheduleRequested) {
      return res.status(400).json({ error: 'Reschedule already requested' });
    }

    booking.rescheduleRequested = true;
    booking.newDate = newDate;
    booking.newStartTime = newStartTime;
    booking.newEndTime = newEndTime;
    booking.rescheduleReason = reason || 'No reason provided';
    booking.rescheduleStatus = 'pending';
    booking.statusHistory.push({
      status: 'reschedule_requested',
      changedBy: req.user.id,
      remarks: `Requested ${newDate} ${newStartTime}-${newEndTime}`,
    });

    await booking.save();
    res.json({ message: 'Reschedule requested', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const approveReschedule = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!booking.rescheduleRequested || booking.rescheduleStatus !== 'pending') {
      return res.status(400).json({ error: 'No pending reschedule request' });
    }

    booking.bookingDate = booking.newDate;
    booking.startTime = booking.newStartTime;
    booking.endTime = booking.newEndTime;

    booking.rescheduleStatus = 'approved';
    booking.rescheduleRequested = false;
    booking.newDate = undefined;
    booking.newStartTime = undefined;
    booking.newEndTime = undefined;

    booking.statusHistory.push({
      status: 'reschedule_approved',
      changedBy: req.user.id,
      remarks: 'Reschedule approved',
    });

    await booking.save();

    await logAction({
      actor: req.user.id,
      action: 'approve_reschedule',
      targetModel: 'bookings',
      targetId: booking._id,
      details: `Approved reschedule for ${booking.bookingRef}`,
    });

    const guest = await UserModel.findById(booking.user);
    if (guest) {
      await sendBookingEmail({
        to: guest.email,
        subject: `Booking Rescheduled — ${booking.bookingRef}`,
        html: `
          <h2>Your booking has been rescheduled</h2>
          <p>Hi ${guest.firstName},</p>
          <p>Your reservation <strong>${booking.bookingRef}</strong> has been moved to a new schedule:</p>
          <ul>
            <li><strong>New Date:</strong> ${new Date(booking.bookingDate).toDateString()}</li>
            <li><strong>New Time:</strong> ${booking.startTime} – ${booking.endTime}</li>
          </ul>
          <p>— Bali Royale</p>
        `,
      });
    }

    res.json({ message: 'Reschedule approved', booking });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Another confirmed booking already exists for the requested date and time',
      });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const rejectReschedule = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!booking.rescheduleRequested || booking.rescheduleStatus !== 'pending') {
      return res.status(400).json({ error: 'No pending reschedule request' });
    }

    booking.rescheduleStatus = 'rejected';
    booking.rescheduleRequested = false;
    booking.newDate = undefined;
    booking.newStartTime = undefined;
    booking.newEndTime = undefined;

    booking.statusHistory.push({
      status: 'reschedule_rejected',
      changedBy: req.user.id,
      remarks: req.body.reason || 'Reschedule rejected',
    });

    await booking.save();
    res.json({ message: 'Reschedule rejected', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createBooking,
  checkAvailability,
  getMyBookings,
  getAllBookings,
  getBookingById,
  confirmBooking,
  checkInBooking,
  completeBooking,
  noShowBooking,
  requestCancel,
  approveCancel,
  rejectCancel,
  requestReschedule,
  approveReschedule,
  rejectReschedule,
};