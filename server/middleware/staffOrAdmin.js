const staffOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Staff or admin access only' });
  }
  next();
};

module.exports = staffOrAdmin;