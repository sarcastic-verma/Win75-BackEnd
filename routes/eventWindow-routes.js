const {Router} = require('express');
const eventWindowController = require('../controllers/eventWindow-controller');

const router = new Router();

router.get('/:bid', eventWindowController.getEventWindow);

module.exports = router;