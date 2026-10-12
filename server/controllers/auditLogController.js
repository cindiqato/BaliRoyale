const AuditLogModel = require('../models/AuditLog');

const logAction = async ({ actor, action, targetModel, targetId, details }) => {
  try {
    await AuditLogModel.create({
      actor,
      action,
      targetModel,
      targetId,
      details,
    });
  } catch (err) {
    console.log('Audit log error:', err);
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLogModel.find()
      .populate('actor', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { logAction, getAuditLogs };