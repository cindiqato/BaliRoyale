const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Auth
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/users/me', auth, userController.getMe);
router.put('/users/me', auth, userController.updateProfile);

// User CRUD (admin only)
router.get('/getUsers', auth, admin, userController.getUsers);
router.post('/createUser', auth, admin, userController.createUser);
router.put('/updateUser/:id', auth, admin, userController.updateUser);
router.delete('/deleteUser/:id', auth, admin, userController.deleteUser);

module.exports = router;