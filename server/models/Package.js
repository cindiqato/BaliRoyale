const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    scheduleType: { type: String },
    dayType: { type: String },
    startTime: { type: String },
    endTime: { type: String },

    baseRate: { type: Number, required: true },
    includedPax: { type: Number, default: 10 },
    maxPax: { type: Number, required: true },
    excessPaxRate: { type: Number, default: 350 },
    bedrooms: { type: Number },

    amenities: [String],
    inclusions: [String],
    blockedDates: [Date],

    status: { type: String, default: 'active' },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('packages', PackageSchema);