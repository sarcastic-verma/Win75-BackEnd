const {Router} = require('express');
const transactionController = require('../controllers/transaction-controller');
const checkAuth = require('../middleware/check-auth');

const router = new Router();

router.post('/update/:tid', transactionController.updateRedeemStatus);
router.use(checkAuth);

router.post('/add', transactionController.addTransaction);
router.post('/redeem', transactionController.redeemTransaction);
router.post('/reducePoints',transactionController.reducePoints);
router.post('/addPoints', transactionController.addPoints);

module.exports = router;