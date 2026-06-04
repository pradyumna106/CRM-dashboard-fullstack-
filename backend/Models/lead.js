const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  companyName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
    default: 'New'
  },
  notes: { type: String },
}, { timestamps: true }); // Automatically creates 'createdAt' and 'updatedAt'

module.exports = mongoose.model('Lead', leadSchema);
