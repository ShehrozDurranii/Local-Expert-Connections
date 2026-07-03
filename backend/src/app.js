const express = require('express');
const cors = require('cors');

const path = require('path');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const savedExpertsRoutes = require('./routes/saved-experts.routes');
const offerRoutes = require('./routes/offer.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const milestoneRoutes = require('./routes/milestone.routes');
const proofRoutes = require('./routes/proof.routes');
const messageRoutes = require('./routes/message.routes');
const attachmentRoutes = require('./routes/attachment.routes');
const reviewRoutes = require('./routes/review.routes');
const blocklistRoutes = require('./routes/blocklist.routes');
const reportRoutes = require('./routes/report.routes');
const requestRoutes = require('./routes/request.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/buyers', authRoutes);
app.use('/api/buyers', profileRoutes);
app.use('/api/buyers', notificationsRoutes);
app.use('/api/buyers', savedExpertsRoutes);
app.use('/api', offerRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', milestoneRoutes);
app.use('/api', proofRoutes);
app.use('/api', messageRoutes);
app.use('/api', attachmentRoutes);
app.use('/api', reviewRoutes);
app.use('/api', blocklistRoutes);
app.use('/api', reportRoutes);
app.use('/api', requestRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = app;

const db = require('./config/database');

db.query('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.log('Database connection failed', err);
  });
