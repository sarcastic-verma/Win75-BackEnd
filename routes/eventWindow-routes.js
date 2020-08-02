const {Router} = require('express');
const eventWindowController = require('../controllers/eventWindow-controller');
const checkAuth = require('../middleware/check-auth');

const router = new Router();

router.get('/', eventWindowController.createEventWindow);
router.get('/:eid', eventWindowController.getEventWindow);
router.use(checkAuth);
router.get('/getCurrentWindow/now', eventWindowController.getCurrentEventWindow);

module.exports = router;