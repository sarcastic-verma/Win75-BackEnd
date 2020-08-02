const {Router} = require('express');
const gameController = require('../controllers/games-controller');
const checkAuth = require('../middleware/check-auth');

const router = Router();

router.get('/endgame/:gid', gameController.endGame);
router.use(checkAuth);
router.get('/:gid', gameController.getGameById);

router.get('/user', gameController.getGamesByUserId);


module.exports = router;
