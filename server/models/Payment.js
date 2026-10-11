const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'bookings',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    type: { type: String, required: true }, // down_payment | balance | refund
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // cash | bank | gcash | maya
    referenceNo: { type: String },
    proofImage: { type: String },

    status: { type: String, default: 'pending' }, // pending | verified | rejected
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    verifiedAt: { type: Date },
    rejectionReason: String,

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('payments', PaymentSchema);