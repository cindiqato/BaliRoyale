const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const staffOrAdmin = require('../middleware/staffOrAdmin');

router.get('/dashboard/guest', auth, dashboardController.getGuestDashboard);
router.get('/dashboard/staff', auth, staffOrAdmin, dashboardController.getStaffDashboard);
router.get('/dashboard/admin', auth, admin, dashboardController.getAdminDashboard);

module.exports = router;