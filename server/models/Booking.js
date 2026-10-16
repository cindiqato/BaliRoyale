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
      // pending | confirmed | checked_in | completed | cancelled | no_show | payment_timeout
    },
    paymentStatus: {
      type: String,
      default: 'unpaid',
      // unpaid | partial | paid | refunded
    },

    // Hold timer for unpaid pending bookings
    expiresAt: { type: Date },

    // Blocks the slot. True when pending-with-active-hold, confirmed, or checked_in.
    isSlotBlocked: { type: Boolean, default: false },

    // Kept for backward-compatibility with earlier seed data
    isActiveConfirmed: { type: Boolean, default: false },

    depositStatus: {
      type: String,
      default: 'held',
      // held | returned | deducted
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

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent overlapping slot-blocking bookings on the same package, date, and time
BookingSchema.index(
  { package: 1, bookingDate: 1, startTime: 1, isSlotBlocked: 1 },
  { unique: true, partialFilterExpression: { isSlotBlocked: true } }
);

module.exports = mongoose.model('bookings', BookingSchema);