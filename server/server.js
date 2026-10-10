const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/baliroyale')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Test endpoint
app.get('/api/tryserver', (req, res) => {
  res.json({ message: 'wew' });
});

app.listen(8000, () => {
  console.log('Server is up and running at http://localhost:8000');
});