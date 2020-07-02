const {Router} = require('express');
const eventWindowController = require('../controllers/eventWindow-controller');

const router = new Router();

router.get('/', eventWindowController.createEventWindow);

module.exports = router;