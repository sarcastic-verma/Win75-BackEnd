const {Router} = require('express');
const transactionController = require('../controllers/transaction-controller');
const checkAuth = require('../middleware/check-auth');

const router = new Router();

router.post('/update/:tid', transactionController.updateRedeemStatus);
router.use(checkAuth);

router.post('/add', transactionController.addTransaction);
router.post('/redeem', transactionController.redeemTransaction);

module.exports = router;