const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const staffOrAdmin = require('../middleware/staffOrAdmin');
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

// Staff or Admin
router.get('/payments', auth, staffOrAdmin, paymentController.getAllPayments);
router.put('/payments/:id/verify', auth, staffOrAdmin, paymentController.verifyPayment);
router.put('/payments/:id/reject', auth, staffOrAdmin, paymentController.rejectPayment);
router.post('/payments/cash', auth, staffOrAdmin, paymentController.recordCashPayment);

// Deposit actions
router.put('/bookings/:id/deposit-return', auth, staffOrAdmin, paymentController.returnDeposit);
router.put('/bookings/:id/deposit-deduct', auth, staffOrAdmin, paymentController.deductDeposit);

module.exports = router;