const express = require('express');
const playerSummaryController = require('../controllers/playerSummary-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();