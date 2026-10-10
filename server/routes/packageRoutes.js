const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public
router.get('/packages', packageController.getPackages);
router.get('/packages/:id', packageController.getPackageById);

// Admin only
router.post('/packages', auth, admin, packageController.createPackage);
router.put('/packages/:id', auth, admin, packageController.updatePackage);
router.delete('/packages/:id', auth, admin, packageController.archivePackage);

module.exports = router;