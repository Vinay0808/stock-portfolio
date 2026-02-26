// models/Fund.js
const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  comment: { type: String }
});

module.exports = mongoose.model('Fund', fundSchema);
