const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema(
  {
    originalModel: { type: String, required: true },
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    snapshot: { type: Object, required: true },
    reason: { type: String },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    restoredAt: { type: Date },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isRestored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('archives', ArchiveSchema);