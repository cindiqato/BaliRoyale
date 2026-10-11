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

module.exports = router;