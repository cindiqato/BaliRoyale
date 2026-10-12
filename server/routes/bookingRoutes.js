const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const staffOrAdmin = require('../middleware/staffOrAdmin');

// Public
router.post('/bookings/check-availability', bookingController.checkAvailability);

// Guest
router.post('/bookings', auth, bookingController.createBooking);
router.get('/bookings/mine', auth, bookingController.getMyBookings);
router.get('/bookings/:id', auth, bookingController.getBookingById);
router.put('/bookings/:id/cancel-request', auth, bookingController.requestCancel);
router.put('/bookings/:id/reschedule-request', auth, bookingController.requestReschedule);

// Staff or Admin — read
router.get('/bookings', auth, staffOrAdmin, bookingController.getAllBookings);

// Staff or Admin — workflow
router.put('/bookings/:id/confirm', auth, staffOrAdmin, bookingController.confirmBooking);
router.put('/bookings/:id/checkin', auth, staffOrAdmin, bookingController.checkInBooking);
router.put('/bookings/:id/complete', auth, staffOrAdmin, bookingController.completeBooking);
router.put('/bookings/:id/noshow', auth, staffOrAdmin, bookingController.noShowBooking);
router.put('/bookings/:id/cancel-approve', auth, staffOrAdmin, bookingController.approveCancel);
router.put('/bookings/:id/cancel-reject', auth, staffOrAdmin, bookingController.rejectCancel);
router.put('/bookings/:id/reschedule-approve', auth, staffOrAdmin, bookingController.approveReschedule);
router.put('/bookings/:id/reschedule-reject', auth, staffOrAdmin, bookingController.rejectReschedule);

module.exports = router;