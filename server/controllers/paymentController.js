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

module.exports = {
  submitPayment,
  getMyPayments,
  getAllPayments,
  getPaymentsByBooking,
};