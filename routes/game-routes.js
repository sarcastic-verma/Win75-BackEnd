const express = require('express');
const gameController = require('../controllers/games-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);
router.get('/:gid', gameController.getGameById);

router.get('/user/:uid', gameController.getGamesByUserId);

// router.get(
//     '/start/:gid',
//     gameController.startGame
// );
router.get('/endgame/:gid', gameController.endGame);

module.exports = router;