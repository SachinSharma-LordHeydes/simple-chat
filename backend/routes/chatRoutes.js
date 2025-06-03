const express = require('express');
const chatRouter = express.Router();
const { getChatHistory, markMessagesAsRead } = require('../controllers/chatController');

chatRouter.post('/history', getChatHistory);
chatRouter.post('/mark-read', markMessagesAsRead);

module.exports = chatRouter;