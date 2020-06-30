const {Router} = require("express");
const router = Router();
const categoryControllers = require('../controllers/slots-controller');

router.post('/',categoryControllers.createCategory);
router.get('/',categoryControllers.getAllCategories);


module.exports = router;