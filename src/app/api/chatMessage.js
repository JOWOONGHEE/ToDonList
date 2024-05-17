const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('chatMessage', chatMessageSchema);
