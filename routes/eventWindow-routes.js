const {Router} = require('express');
const eventWindowController = require('../controllers/eventWindow-controller');

const router = new Router();

router.get('/', eventWindowController.createEventWindow);
router.get('/:eid',eventWindowController.getEventWindow);

module.exports = router;