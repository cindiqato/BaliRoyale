const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/auditlogs', auth, admin, auditLogController.getAuditLogs);

module.exports = router;