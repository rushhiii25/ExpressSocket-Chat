const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/login
router.post('/login', userController.loginUser);

// GET /api/users
router.get('/', userController.getUsers);

// POST /api/users/clear & DELETE /api/users/clear
router.post('/clear', userController.clearAllUsers);
router.delete('/clear', userController.clearAllUsers);

module.exports = router;
