const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET /api/messages?room=general&limit=50
router.get('/', messageController.getMessages);

// POST /api/messages
router.post('/', messageController.sendMessage);

// GET /api/messages/rooms
router.get('/rooms', messageController.getRooms);

module.exports = router;
