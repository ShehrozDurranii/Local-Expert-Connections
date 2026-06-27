const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const requestRoutes = require('./routes/request.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/buyers', authRoutes);
app.use('/api/requests', requestRoutes);

module.exports = app;

const db = require('./config/database');

db.query('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.log('Database connection failed', err);
  });
