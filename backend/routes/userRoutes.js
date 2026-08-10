const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/login
router.post('/login', userController.loginUser);

// GET /api/users
router.get('/', userController.getUsers);

module.exports = router;
