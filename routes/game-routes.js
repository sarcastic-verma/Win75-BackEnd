const {Router} = require('express');
const gameController = require('../controllers/games-controller');
const checkAuth = require('../middleware/check-auth');

const router = Router();

router.use(checkAuth);
router.get('/:gid', gameController.getGameById);

router.get('/user', gameController.getGamesByUserId);

router.get('/endgame/:gid', gameController.endGame);

module.exports = router;