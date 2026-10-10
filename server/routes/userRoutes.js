const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Auth
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/users/me', auth, userController.getMe);

// User CRUD
router.get('/getUsers', userController.getUsers);
router.post('/createUser', userController.createUser);
router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router;