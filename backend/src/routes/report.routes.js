const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/reports — File a report
router.post('/reports', authenticate, reportController.fileReport);

module.exports = router;
