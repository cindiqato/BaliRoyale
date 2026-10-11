const PaymentModel = require('../models/Payment');
const BookingModel = require('../models/Booking');

// ---------- SUBMIT PAYMENT (guest) ----------

const submitPayment = async (req, res) => {
  try {
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

    if (['cancelled', 'no_show'].includes(booking.status)) {
      return res.status(400).json({ error: 'Cannot pay for a cancelled booking' });
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
    res.json({ message: 'Payment submitted', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- GET MY PAYMENTS (guest) ----------

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

// ---------- GET ALL PAYMENTS (admin) ----------

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

// ---------- GET PAYMENTS FOR ONE BOOKING ----------

const getPaymentsByBooking = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Owner or admin only
    if (
      req.user.role !== 'admin' &&
      booking.user.toString() !== req.user.id
    ) {
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

// ---------- VERIFY PAYMENT (admin) ----------

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

    // Update the booking's paymentStatus
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

    res.json({ message: 'Payment verified', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- REJECT PAYMENT (admin) ----------

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

    res.json({ message: 'Payment rejected', payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- RECORD CASH PAYMENT (admin) ----------

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
      status: 'verified', // cash is auto-verified
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    });

    await payment.save();

    // Update booking paymentStatus
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

// ---------- RETURN DEPOSIT (admin) ----------

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

// ---------- DEDUCT DEPOSIT (admin) ----------

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