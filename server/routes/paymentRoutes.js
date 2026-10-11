const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Guest
router.post(
  '/payments',
  auth,
  upload.single('proofImage'),
  paymentController.submitPayment
);
router.get('/payments/mine', auth, paymentController.getMyPayments);
router.get(
  '/payments/booking/:bookingId',
  auth,
  paymentController.getPaymentsByBooking
);

// Admin
router.get('/payments', auth, admin, paymentController.getAllPayments);
router.put('/payments/:id/verify', auth, admin, paymentController.verifyPayment);
router.put('/payments/:id/reject', auth, admin, paymentController.rejectPayment);
router.post('/payments/cash', auth, admin, paymentController.recordCashPayment);

// Deposit actions live on the booking
router.put('/bookings/:id/deposit-return', auth, admin, paymentController.returnDeposit);
router.put('/bookings/:id/deposit-deduct', auth, admin, paymentController.deductDeposit);

module.exports = router;