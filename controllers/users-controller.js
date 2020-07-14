const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    await res.json({users: users.map(user => user.toObject({getters: true}))});
};

const getUserById = async (req, res, next) => {
    const userId = req.params.uid;
    let user;
    try {
        user = await User.findById(userId)
    } catch (err) {
        const error = new HttpError("Something went wrong can't get user.", 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError("Can't find user for provided id", 404);
        return next(error);
    }
    res.status(200).json({
        user: user.toObject(
            {getters: true}
        )
    });
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid Inputs passed', 422)
        );
    }

    let referralCode, inWalletCash;
    const {username, email, password} = req.body;
    if (req.body.referralCode) {
        referralCode = req.body.referralCode;
        inWalletCash = 20;
    } else {
        referralCode = "none";
        inWalletCash = 0;
    }
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
            'Could not create user, please try again.',
            500
        );
        return next(error);
    }
    const date = Date().toLocaleString();
    let filePath;
    try {
        if (req.file) {
            filePath = req.file.path;
        } else {
            filePath = 'uploads/images/DUser.jpeg'
        }
    } catch (err) {
        const error = new HttpError(err.message, err.code);
        return next(error);
    }

    const createdUser = new User({
        username,
        email,
        image: 'http://localhost:5000/' + filePath,
        password: hashedPassword,
        games: [],
        transactions: [],
        referralCode: referralCode,
        joinedOn: date,
        inWalletCash: inWalletCash, points: 0,
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            {userId: createdUser.id, email: createdUser.email},
            'supersecret_dont_share',{expiresIn: '1d'}
        );
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    await res
        .status(201)
        .json({userId: createdUser.id, email: createdUser.email, token: token});
};

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'You are not registered!!!',
            403
        );
        return next(error);
        // res.json(
        //     {error: error, existingUser}
        // );
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError(
            'Could not log you in, please check your credentials and try again.',
            500
        );
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError(
            'Wrong Password!!',
            403
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            {userId: existingUser.id, email: existingUser.email},
            'supersecret_dont_share',
        );
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    await res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });
};
const forgotPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid Inputs passed', 422)
        );
    }
    const email = req.params.email;
    const password = req.body.password;
    let user;
    try {
        console.log(email);
        user = await User.findOne({
            email
        });
        console.log(user);
        // User.findByIdAndUpdate(userId, {password: password}, {}, () => {
        // });
    } catch (err) {
        const error = new HttpError("Something went wrong, please try again later.", err.status);
        return next(error);
    }
    if (!user) {
        const error = new HttpError(
            'You are not registered!!!',
            403
        );
        return next(error);
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
            'Could not create user, please try again.',
            500
        );
        return next(error);
    }
    user.password = hashedPassword;
    try {
        await user.save();
    } catch (err) {
        const error = new HttpError("Error saving user, try again later.", err.status);
        return next(error);
    }

    res.status(200).json({
        message: "Password updated"
    });
};
const editUser = async (req, res, next) => {
    const userId = req.params.uid;
    let user;
    try {
        user = await User.findById(userId)
    } catch (err) {
        const error = new HttpError("Something went wrong can't get user.", 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError("Can't find user for provided id", 404);
        return next(error);
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const {username, email, password} = req.body;
    let filePath;
    try {
        if (req.file) {
            filePath = req.file.path;
        } else {
            filePath = 'uploads/images/DUser.jpeg'
        }
    } catch (err) {
        const error = new HttpError(err.message + "olol", err.code);
        return next(error);
    }
    user.username = username;
    user.email = email;
    user.password = password;
    user.image = 'http://localhost:5000/' + filePath;
    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(
            err.message,
            500
        );
        return next(error);
    }
    res.status(200).json({
        user: user.toObject(
            {getters: true})
    });
};
const getLeaderBoard = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    users.sort((a, b) => Number(b.totalAmountWon) - Number(a.totalAmountWon));
    await res.json({users: users.map(user => user.toObject({getters: true}))});
};
exports.getUsers = getUsers;
exports.getLeaderBoard = getLeaderBoard;
exports.editUser = editUser;
exports.signup = signUp;
exports.login = login;
exports.getUserById = getUserById;
exports.forgotPassword = forgotPassword;