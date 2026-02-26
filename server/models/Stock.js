const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  date: String,
  companyName: { type: String, required: true },
  sector: String,
  price: Number,
  charges: Number,
  quantity: Number,
  type: String,
});

module.exports = mongoose.models.Stock || mongoose.model('Stock', stockSchema);
