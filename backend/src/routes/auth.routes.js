const router = require('express').Router();
const controller = require('../controllers/auth.controller');

// POST /api/buyers/register — public
router.post('/register', controller.register);

// POST /api/buyers/login — public
router.post('/login', controller.login);

module.exports = router;
