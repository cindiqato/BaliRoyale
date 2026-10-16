const PaymentModel = require('../models/Payment');
const BookingModel = require('../models/Booking');
const { logAction } = require('./auditLogController');

const HOLD_MINUTES = 15;

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
};

const submitPayment = async (req, res) => {
  try {
    await sweepExpiredHolds();

    const { bookingId, type, amount, method, referenceNo } = req.body;

    if (!bookingId || !type || !amount || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['down_payment', 'balance'].includes(type)) {
      return res.status(400).json({ error: 'Invalid payment type' });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['cancelled', 'no_show', 'payment_timeout'].includes(booking.status)) {
      return res.status(400).json({
        error: 'This booking can no longer accept payments',
      });
    }

    const payment = new PaymentModel({
      booking: booking._id,
      user: req.user.id,
      type,
      amount,
      method,
      referenceNo,
      proofImage: req.file ? req.file.filename : null,
      status: 'pending',
    });

    await payment.save();

    // Once any payment is submitted, the 15-minute timer stops.
    // The slot stays blocked until staff confirms/cancels.
    if (booking.expiresAt) {
      booking.expiresAt = undefined;
      booking.statusHistory.push({
        status: 'payment_submitted',
        changedBy: req.user.id,
        changedAt: new Date(),
        remarks: `${type.replace('_', ' ')} of ₱${amount} submitted. Awaiting staff verification.`,
      });
      await booking.save();
    }

    res.json({ message: 'Payment submitted', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find({
      user: req.user.id,
      isArchived: false,
    })
      .populate('booking', 'bookingRef status paymentStatus')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find({ isArchived: false })
      .populate('booking', 'bookingRef status paymentStatus')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPaymentsByBooking = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isStaffOrAdmin =
      req.user.role === 'staff' || req.user.role === 'admin';
    const isOwner = booking.user.toString() === req.user.id;

    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payments = await PaymentModel.find({
      booking: booking._id,
      isArchived: false,
    }).sort({ createdAt: 1 });

    res.json(payments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be verified' });
    }

    payment.status = 'verified';
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    await payment.save();

    const booking = await BookingModel.findById(payment.booking);
    if (booking) {
      const allPayments = await PaymentModel.find({
        booking: booking._id,
        status: 'verified',
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= booking.pricing.totalAmount) {
        booking.paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        booking.paymentStatus = 'partial';
      } else {
        booking.paymentStatus = 'unpaid';
      }

      await booking.save();
    }

    await logAction({
      actor: req.user.id,
      action: 'verify_payment',
      targetModel: 'payments',
      targetId: payment._id,
      details: `Verified ${payment.type} of ${payment.amount}`,
    });

    res.json({ message: 'Payment verified', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending payments can be rejected' });
    }

    payment.status = 'rejected';
    payment.rejectionReason = reason;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    await payment.save();

    await logAction({
      actor: req.user.id,
      action: 'reject_payment',
      targetModel: 'payments',
      targetId: payment._id,
      details: `Rejected: ${reason}`,
    });

    res.json({ message: 'Payment rejected', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const recordCashPayment = async (req, res) => {
  try {
    const { bookingId, type, amount } = req.body;

    if (!bookingId || !type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['down_payment', 'balance'].includes(type)) {
      return res.status(400).json({ error: 'Invalid payment type' });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const payment = new PaymentModel({
      booking: booking._id,
      user: booking.user,
      type,
      amount,
      method: 'cash',
      status: 'verified',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    });

    await payment.save();

    // Stop any active hold timer
    if (booking.expiresAt) {
      booking.expiresAt = undefined;
    }

    const allPayments = await PaymentModel.find({
      booking: booking._id,
      status: 'verified',
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= booking.pricing.totalAmount) {
      booking.paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      booking.paymentStatus = 'partial';
    } else {
      booking.paymentStatus = 'unpaid';
    }
    await booking.save();

    res.json({ message: 'Cash payment recorded', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const returnDeposit = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed bookings can have deposits returned' });
    }

    if (booking.depositStatus !== 'held') {
      return res.status(400).json({ error: 'Deposit already settled' });
    }

    booking.depositStatus = 'returned';
    booking.statusHistory.push({
      status: 'deposit_returned',
      changedBy: req.user.id,
      remarks: 'Security deposit returned',
    });

    await booking.save();
    res.json({ message: 'Deposit returned', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deductDeposit = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({ error: 'Amount and reason required' });
    }

    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed bookings can have deposits deducted' });
    }

    if (booking.depositStatus !== 'held') {
      return res.status(400).json({ error: 'Deposit already settled' });
    }

    if (amount > booking.pricing.securityDeposit) {
      return res.status(400).json({ error: 'Deduction exceeds deposit amount' });
    }

    booking.depositStatus = 'deducted';
    booking.depositDeduction = amount;
    booking.depositReason = reason;
    booking.statusHistory.push({
      status: 'deposit_deducted',
      changedBy: req.user.id,
      remarks: `Deducted ${amount}: ${reason}`,
    });

    await booking.save();
    res.json({ message: 'Deposit deducted', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  submitPayment,
  getMyPayments,
  getAllPayments,
  getPaymentsByBooking,
  verifyPayment,
  rejectPayment,
  recordCashPayment,
  returnDeposit,
  deductDeposit,
};