// models/Capital.js
const mongoose = require('mongoose');

const capitalSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Capital', capitalSchema);
