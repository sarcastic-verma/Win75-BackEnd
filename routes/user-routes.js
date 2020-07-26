const {Router} = require('express');
const {check} = require('express-validator');

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = new Router();


router.get('/', usersController.getUsers);
router.get('/leaderBoard', usersController.getLeaderBoard);

router.get('/:uid', usersController.getUserById);

router.post(
    '/signup',
    fileUpload.single('image'),
    [
        check('username')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('mobile').not().isEmpty(),
        check('password').isLength({min: 6})
    ],
    usersController.signup
);

router.post('/login', usersController.login);
router.get('/forgotPassword/:email', usersController.forgotPassword);
router.use(checkAuth);
router.patch('/changePassword', [check('newPassword').isLength({min: 6})], usersController.changePassword);
router.patch('/edit', fileUpload.single('image'),
    [
        check('username')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('mobile').not().isEmpty()
    ], usersController.editUser);

module.exports = router;
