const {Router} = require("express");
const router = Router();
const slotControllers = require('../controllers/slots-controller');

router.post('/',slotControllers.createSlot);
router.get('/',slotControllers.getAllCategories);


module.exports = router;