require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const archiveRoutes = require('./routes/archiveRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect('mongodb://localhost:27017/baliroyale')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

app.use('/api', userRoutes);
app.use('/api', packageRoutes);
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);
app.use('/api', archiveRoutes);
app.use('/api', auditLogRoutes);
app.use('/api', dashboardRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/api/tryserver', (req, res) => {
  res.json({ message: 'wew' });
});

app.listen(8000, () => {
  console.log('Server is up and running at http://localhost:8000');
});