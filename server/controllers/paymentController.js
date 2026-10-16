const PaymentModel = require('../models/Payment');
const BookingModel = require('../models/Booking');
const UserModel = require('../models/User');
const { logAction } = require('./auditLogController');
const sendBookingEmail = require('../middleware/mailer');

const HOLD_MINUTES = 15;
const AMOUNT_EPSILON = 0.01;

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

const VALID_ONLINE_METHODS = ['gcash', 'bank'];

const sumVerified = async (bookingId) => {
  const payments = await PaymentModel.find({
    booking: bookingId,
    status: 'verified',
    type: { $ne: 'refund' },
  });
  return payments.reduce((sum, p) => sum + p.amount, 0);
};

const computePaymentStatus = (totalAmount, totalPaid) => {
  if (totalPaid + AMOUNT_EPSILON >= totalAmount) return 'paid';
  if (totalPaid > 0) return 'partial';
  return 'unpaid';
};

const computeExpectedAmount = (booking, type, alreadyPaid) => {
  if (type === 'down_payment') return booking.pricing.downPayment;
  if (type === 'full_payment') return booking.pricing.totalAmount;
  if (type === 'balance') {
    return Math.max(0, (booking.pricing.totalAmount || 0) - alreadyPaid);
  }
  return 0;
};

const getAllowedTypes = (booking) => {
  if (booking.status === 'pending' && booking.paymentStatus === 'unpaid') {
    return ['down_payment', 'full_payment'];
  }
  if (
    ['confirmed', 'checked_in'].includes(booking.status) &&
    booking.paymentStatus !== 'paid'
  ) {
    return ['balance'];
  }
  if (booking.status === 'pending' && booking.paymentStatus === 'partial') {
    return ['balance'];
  }
  return [];
};

const submitPayment = async (req, res) => {
  try {
    await sweepExpiredHolds();

    const { bookingId, type, method, referenceNo } = req.body;

    if (!bookingId || !type || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!referenceNo || !referenceNo.trim()) {
      return res.status(400).json({
        error: 'Reference number is required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Proof of payment (image or PDF) is required.',
      });
    }

    if (!VALID_ONLINE_METHODS.includes(method)) {
      return res.status(400).json({
        error: 'Online payments can only be made via GCash or Bank Transfer.',
      });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['cancelled', 'completed', 'no_show', 'payment_timeout'].includes(booking.status)) {
      return res.status(400).json({
        error: 'This booking can no longer accept payments.',
      });
    }

    // Reject if there's already a pending payment for this booking
    const existingPending = await PaymentModel.findOne({
      booking: booking._id,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        error: 'You already have a payment awaiting verification for this booking.',
      });
    }

    const allowedTypes = getAllowedTypes(booking);

    if (allowedTypes.length === 0) {
      if (booking.paymentStatus === 'paid') {
        return res.status(400).json({
          error: 'This booking is already fully paid.',
        });
      }
      return res.status(400).json({
        error: 'This booking is not eligible for payment at this time.',
      });
    }

    if (!allowedTypes.includes(type)) {
      if (type === 'balance' && allowedTypes.includes('down_payment')) {
        return res.status(400).json({
          error: 'The balance payment is only available after the booking has been confirmed. Please pay the down payment or the full amount instead.',
        });
      }
      if ((type === 'down_payment' || type === 'full_payment') && allowedTypes.includes('balance')) {
        return res.status(400).json({
          error: 'This booking requires a balance payment. The down payment option is no longer available.',
        });
      }
      return res.status(400).json({
        error: `Payment type "${type}" is not allowed for this booking.`,
      });
    }

    const alreadyPaid = await sumVerified(booking._id);
    const expectedAmount = computeExpectedAmount(booking, type, alreadyPaid);

    if (expectedAmount <= 0) {
      return res.status(400).json({
        error: 'This payment option is not applicable to this booking.',
      });
    }

    const payment = new PaymentModel({
      booking: booking._id,
      user: req.user.id,
      type,
      amount: expectedAmount,
      method,
      referenceNo: referenceNo.trim(),
      proofImage: req.file.filename,
      status: 'pending',
    });

    await payment.save();

    if (booking.expiresAt) {
      booking.expiresAt = undefined;
      booking.statusHistory.push({
        status: 'payment_submitted',
        changedBy: req.user.id,
        changedAt: new Date(),
        remarks: `${type.replace('_', ' ')} of ₱${expectedAmount} submitted. Awaiting staff verification.`,
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
      const totalPaid = await sumVerified(booking._id);
      booking.paymentStatus = computePaymentStatus(
        booking.pricing.totalAmount,
        totalPaid
      );

      const confirmTrigger =
        (payment.type === 'down_payment' || payment.type === 'full_payment') &&
        booking.status === 'pending';

      if (confirmTrigger) {
        booking.status = 'confirmed';
        booking.isSlotBlocked = true;
        booking.isActiveConfirmed = true;
        booking.expiresAt = undefined;
        booking.statusHistory.push({
          status: 'confirmed',
          changedBy: req.user.id,
          changedAt: new Date(),
          remarks: `Auto-confirmed after verification of ${payment.type.replace('_', ' ')}`,
        });
      }

      await booking.save();

      if (confirmTrigger) {
        await logAction({
          actor: req.user.id,
          action: 'confirm_booking',
          targetModel: 'bookings',
          targetId: booking._id,
          details: `Auto-confirmed ${booking.bookingRef} after payment verification`,
        });

        const guest = await UserModel.findById(booking.user);
        if (guest) {
          const remainingBalance = Math.max(
            0,
            (booking.pricing.totalAmount || 0) - totalPaid
          );

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
                <li><strong>Total Amount:</strong> PHP ${booking.pricing.totalAmount.toLocaleString()}</li>
                <li><strong>Amount Paid:</strong> PHP ${totalPaid.toLocaleString()}</li>
                <li><strong>Remaining Balance:</strong> PHP ${remainingBalance.toLocaleString()}</li>
              </ul>
              <p>We look forward to hosting you!</p>
              <p>— Bali Royale</p>
            `,
          });
        }
      }
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

    if (type !== 'balance') {
      return res.status(400).json({
        error: 'Cash payments can only be applied to the remaining balance.',
      });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!['confirmed', 'checked_in'].includes(booking.status)) {
      return res.status(400).json({
        error: 'Cash payments can only be recorded for confirmed bookings.',
      });
    }

    const alreadyPaid = await sumVerified(booking._id);
    const remainingBalance = Math.max(
      0,
      (booking.pricing.totalAmount || 0) - alreadyPaid
    );

    if (remainingBalance <= 0) {
      return res.status(400).json({
        error: 'This booking has no remaining balance.',
      });
    }

    if (Number(amount) > remainingBalance + AMOUNT_EPSILON) {
      return res.status(400).json({
        error: `Cash amount cannot exceed the remaining balance of ₱${remainingBalance.toLocaleString()}.`,
      });
    }

    const safeAmount = Math.min(Number(amount), remainingBalance);

    const payment = new PaymentModel({
      booking: booking._id,
      user: booking.user,
      type,
      amount: safeAmount,
      method: 'cash',
      status: 'verified',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    });

    await payment.save();

    const newTotalPaid = await sumVerified(booking._id);
    booking.paymentStatus = computePaymentStatus(
      booking.pricing.totalAmount,
      newTotalPaid
    );

    booking.statusHistory.push({
      status: 'cash_payment_recorded',
      changedBy: req.user.id,
      changedAt: new Date(),
      remarks: `Recorded cash payment of ₱${safeAmount.toLocaleString()}`,
    });

    await booking.save();

    await logAction({
      actor: req.user.id,
      action: 'record_cash_payment',
      targetModel: 'payments',
      targetId: payment._id,
      details: `Recorded cash payment of ₱${safeAmount} for ${booking.bookingRef}`,
    });

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
      remarks: `Deducted ₱${amount}: ${reason}`,
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