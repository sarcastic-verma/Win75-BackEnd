const {Router} = require('express');
const playerSummaryController = require('../controllers/playerSummary-controller');
const checkAuth = require('../middleware/check-auth');

const router = new Router();

// router.get('/updatePlayerSummary/:gid', playerSummaryController.updatePlayerSummary);
router.use(checkAuth);
router.get('/:summaryId', playerSummaryController.getPlayerSummary);
router.post('/makePlayerSummary/:gid', playerSummaryController.makePlayerSummary);
module.exports = router;
