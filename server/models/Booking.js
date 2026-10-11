const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, required: true, unique: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'packages', required: true },

    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    guestCount: { type: Number, required: true, min: 1 },
    addOns: [String],

    pricing: {
      baseRate: Number,
      excessPaxFee: Number,
      addOnsFee: Number,
      securityDeposit: { type: Number, default: 3000 },
      totalAmount: Number,
      downPayment: Number,
      balanceDue: Number,
    },

    status: {
      type: String,
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      default: 'unpaid',
    },

    depositStatus: {
      type: String,
      default: 'held',
    },
    depositDeduction: { type: Number, default: 0 },
    depositReason: { type: String },

    cancelRequested: { type: Boolean, default: false },
    cancelReason: { type: String },
    cancelStatus: { type: String },

    rescheduleRequested: { type: Boolean, default: false },
    newDate: { type: Date },
    newStartTime: { type: String },
    newEndTime: { type: String },
    rescheduleReason: { type: String },
    rescheduleStatus: { type: String },

    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        changedAt: { type: Date, default: Date.now },
        remarks: String,
      },
    ],

    specialRequests: String,

    isActiveConfirmed: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent overlapping confirmed bookings on the same package, date, and time
BookingSchema.index(
  { package: 1, bookingDate: 1, startTime: 1, isActiveConfirmed: 1 },
  { unique: true, partialFilterExpression: { isActiveConfirmed: true } }
);

module.exports = mongoose.model('bookings', BookingSchema);