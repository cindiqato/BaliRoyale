const ArchiveModel = require('../models/Archive');
const BookingModel = require('../models/Booking');
const UserModel = require('../models/User');
const PackageModel = require('../models/Package');
const { logAction } = require('./auditLogController');

const getModel = (name) => {
  if (name === 'bookings') return BookingModel;
  if (name === 'users') return UserModel;
  if (name === 'packages') return PackageModel;
  return null;
};

const archiveRecord = async (req, res) => {
  try {
    const { modelName, recordId, reason } = req.body;

    const Model = getModel(modelName);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid model name' });
    }

    const record = await Model.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (record.isArchived) {
      return res.status(400).json({ error: 'Record already archived' });
    }

    const archive = new ArchiveModel({
      originalModel: modelName,
      originalId: record._id,
      snapshot: record.toObject(),
      reason: reason || 'No reason provided',
      archivedBy: req.user.id,
    });
    await archive.save();

    record.isArchived = true;
    await record.save();

    await logAction({
      actor: req.user.id,
      action: 'archive_record',
      targetModel: modelName,
      targetId: record._id,
      details: `Archived ${modelName}: ${reason || 'No reason'}`,
    });

    res.json({ message: 'Record archived', archive });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getArchives = async (req, res) => {
  try {
    const archives = await ArchiveModel.find()
      .populate('archivedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(archives);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getArchiveById = async (req, res) => {
  try {
    const archive = await ArchiveModel.findById(req.params.id)
      .populate('archivedBy', 'firstName lastName email');

    if (!archive) return res.status(404).json({ error: 'Archive not found' });
    res.json(archive);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const restoreArchive = async (req, res) => {
  try {
    const archive = await ArchiveModel.findById(req.params.id);
    if (!archive) return res.status(404).json({ error: 'Archive not found' });

    if (archive.isRestored) {
      return res.status(400).json({ error: 'Record already restored' });
    }

    const Model = getModel(archive.originalModel);
    if (!Model) {
      return res.status(400).json({ error: 'Original model not found' });
    }

    const record = await Model.findById(archive.originalId);
    if (!record) {
      return res.status(404).json({ error: 'Original record no longer exists' });
    }

    record.isArchived = false;
    await record.save();

    archive.isRestored = true;
    archive.restoredAt = new Date();
    archive.restoredBy = req.user.id;
    await archive.save();

    await logAction({
      actor: req.user.id,
      action: 'restore_record',
      targetModel: archive.originalModel,
      targetId: archive.originalId,
      details: `Restored ${archive.originalModel}`,
    });

    res.json({ message: 'Record restored', archive });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  archiveRecord,
  getArchives,
  getArchiveById,
  restoreArchive,
};