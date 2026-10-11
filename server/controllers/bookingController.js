const BookingModel = require('../models/Booking');
const PackageModel = require('../models/Package');

// Generate a short booking reference
const generateBookingRef = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'BR-' + Date.now().toString().slice(-6) + '-' + random;
};

// ---------- CREATE BOOKING (guest only) ----------

const createBooking = async (req, res) => {
  try {
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

    // Pricing calculation
    const baseRate = pkg.baseRate;
    const excessGuests = Math.max(0, guestCount - pkg.includedPax);
    const excessPaxFee = excessGuests * pkg.excessPaxRate;
    const addOnsFee = 0; // add-ons pricing later
    const securityDeposit = 3000;
    const totalAmount = baseRate + excessPaxFee + addOnsFee + securityDeposit;
    const downPayment = Math.round(totalAmount * 0.5);
    const balanceDue = totalAmount - downPayment;

    const booking = new BookingModel({
      bookingRef: generateBookingRef(),
      user: req.user.id,
      package: pkg._id,
      bookingDate,
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
      specialRequests,
      statusHistory: [
        {
          status: 'pending',
          changedBy: req.user.id,
          remarks: 'Booking created',
        },
      ],
    });

    await booking.save();
    res.json({ message: 'Booking created', booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- CHECK AVAILABILITY (public) ----------

const checkAvailability = async (req, res) => {
  try {
    const { packageId, bookingDate, startTime } = req.body;

    if (!packageId || !bookingDate || !startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await BookingModel.findOne({
      package: packageId,
      bookingDate: new Date(bookingDate),
      startTime,
      isActiveConfirmed: true,
    });

    res.json({ available: !existing });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------- GET MY BOOKINGS (guest) ----------

const getMyBookings = async (req, res) => {
  try {
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

// ---------- GET ALL BOOKINGS (admin) ----------

const getAllBookings = async (req, res) => {
  try {
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

// ---------- GET ONE BOOKING ----------

const getBookingById = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id)
      .populate('package')
      .populate('user', 'firstName lastName email phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Only the owner or admin can view
    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
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
};