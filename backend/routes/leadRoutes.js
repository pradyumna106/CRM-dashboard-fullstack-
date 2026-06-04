const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// 1. CREATE a new lead
router.post('/', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. GET all leads (with optional search)
router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    let query = {};

    // Search logic for name, email, or company name
    if (searchQuery) {
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { companyName: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 }); // Newest first
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. UPDATE a lead
router.put('/:id', async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. DELETE a lead
router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;