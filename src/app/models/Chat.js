// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatHistory: [{
    role: { type: String, required: true },
    content: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;