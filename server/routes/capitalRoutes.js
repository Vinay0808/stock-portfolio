// routes/capitalRoutes.js
const express = require('express');
const router = express.Router();
const Capital = require('../models/Capital');  // Make sure path is correct

// GET current capital
router.get('/', async (req, res) => {
  try {
    const latest = await Capital.findOne().sort({ createdAt: -1 });
    res.json(latest || { amount: 0 });
  } catch (err) {
    console.error("Error in GET /capital:", err); // add logging
    res.status(500).json({ error: 'Failed to fetch capital' });
  }
});

// POST or update capital
router.post('/', async (req, res) => {
  try {
    const { amount } = req.body;

    await Capital.deleteMany({}); // replace previous entry

    const newCapital = new Capital({ amount });
    await newCapital.save();

    res.json({ message: 'Capital saved', capital: newCapital });
  } catch (err) {
    console.error("Error in POST /capital:", err); // add logging
    res.status(500).json({ error: 'Failed to save capital' });
  }
});

module.exports = router;
