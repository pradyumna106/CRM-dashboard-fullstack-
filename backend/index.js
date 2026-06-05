require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const leadRoutes = require('./routes/leadRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://crm-dashboard-fullstack.vercel.app' // IMPORTANT: Replace this with your actual Vercel URL later!
  ]
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/leads', leadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});