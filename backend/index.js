// Vercel serverless entry point — minimal test
const express = require('express');
const app = express();

app.get('/health', (req, res) => res.json({ status: 'ok', env: 'vercel' }));
app.get('/', (req, res) => res.json({ message: 'ExpertConnect API is live' }));

// Try loading the full app, catch any errors
try {
  const fullApp = require('./src/app');
  // Re-export the full app if it loads successfully
  module.exports = fullApp;
} catch (err) {
  // If full app fails to load, serve error info via the minimal app
  app.get('/debug', (req, res) =>
    res.json({
      error: err.message,
      stack: err.stack,
    })
  );
  app.all('*', (req, res) =>
    res.status(500).json({
      error: 'App failed to load',
      message: err.message,
    })
  );
  module.exports = app;
}
