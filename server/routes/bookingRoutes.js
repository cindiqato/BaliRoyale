const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public
router.post('/bookings/check-availability', bookingController.checkAvailability);

// Guest
router.post('/bookings', auth, bookingController.createBooking);
router.get('/bookings/mine', auth, bookingController.getMyBookings);
router.get('/bookings/:id', auth, bookingController.getBookingById);
router.put('/bookings/:id/cancel-request', auth, bookingController.requestCancel);
router.put('/bookings/:id/reschedule-request', auth, bookingController.requestReschedule);

// Admin
router.get('/bookings', auth, admin, bookingController.getAllBookings);
router.put('/bookings/:id/confirm', auth, admin, bookingController.confirmBooking);
router.put('/bookings/:id/checkin', auth, admin, bookingController.checkInBooking);
router.put('/bookings/:id/complete', auth, admin, bookingController.completeBooking);
router.put('/bookings/:id/noshow', auth, admin, bookingController.noShowBooking);
router.put('/bookings/:id/cancel-approve', auth, admin, bookingController.approveCancel);
router.put('/bookings/:id/cancel-reject', auth, admin, bookingController.rejectCancel);
router.put('/bookings/:id/reschedule-approve', auth, admin, bookingController.approveReschedule);
router.put('/bookings/:id/reschedule-reject', auth, admin, bookingController.rejectReschedule);

module.exports = router;