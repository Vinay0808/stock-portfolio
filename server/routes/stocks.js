const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// POST: Save new stock
router.post('/', async (req, res) => {
  try {
    const newStock = new Stock(req.body);
    await newStock.save();
    res.status(201).json(newStock);
  } catch (err) {
    console.error('Error in POST /api/stocks:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET: All stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET: Unique fields (stockNames + sectors)
router.get('/unique-fields', async (req, res) => {
  try {
    const stocks = await Stock.find({}, 'companyName sector');
    const stockNames = [...new Set(stocks.map(s => s.companyName).filter(Boolean))];
    const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
    res.json({ stockNames, sectors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unique fields' });
  }
});

// PUT: Update a stock by ID ✅
// PUT: Update a stock by ID ✅
router.put('/:id', async (req, res) => {
  try {
    const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(updatedStock);
  } catch (err) {
    console.error('Error updating stock:', err.message);
    res.status(500).json({ error: 'Error updating stock' });
  }
});


// DELETE: single stock by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting stock:', err.message);
    res.status(500).json({ error: 'Server error while deleting stock' });
  }
});

// DELETE: multiple stocks by IDs
router.post('/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid request: ids must be an array' });
    }

    const result = await Stock.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting multiple stocks:', err.message);
    res.status(500).json({ error: 'Server error while deleting stocks' });
  }
});

module.exports = router;
