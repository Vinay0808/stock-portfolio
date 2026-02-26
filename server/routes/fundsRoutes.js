const express = require('express');
const router = express.Router();
const Fund = require('../models/Fund');
const Capital = require('../models/Capital');

// Get all funds
router.get('/', async (req, res) => {
  try {
    const funds = await Fund.find().sort({ date: -1 });
    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new fund
router.post('/', async (req, res) => {
  try {
    const newFund = new Fund(req.body);
    await newFund.save();
    res.status(201).json(newFund);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a fund
router.put('/:id', async (req, res) => {
  try {
    const updated = await Fund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a fund
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Fund.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted', deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
