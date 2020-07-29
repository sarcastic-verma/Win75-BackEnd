const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const mailer = require('nodemailer');

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

const forgotPassword = async (req, res, next) => {
    const email = req.params.email;
    let password = Math.random().toString().substring(0, 3) + Math.random().toString().slice(0, 3) + 'win';
    let user;
    try {
        user = await User.findOne({
            email
        });
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
    await sendMail(password, email);
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
const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid Inputs passed', 422)
        );
    }

    let referralCode, inWalletCash;
    const {username, email, password, mobile} = req.body;
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
        image: 'https://win75.herokuapp.com/' + filePath,
        password: hashedPassword,
        games: [],
        transactions: [],
        referralCode: referralCode,
        mobile,
        joinedOn: date,
        inWalletCash: inWalletCash,
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
            process.env.Jwt_Key,
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
        .json({user: createdUser, email: createdUser.email, token: token});
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
            {userId: existingUser.id, email: existingUser.email,},
            process.env.Jwt_Key,
        );
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    await res.json({
        user: existingUser,
        token: token
    });
};


function sendMail(code, email) {
    const transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        secure: false,
        ignoreTLS: false,
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
        port: 465,
        auth: {
            user: process.env.Email_Name,
            pass: process.env.Email_Pass
        }
    });

    const mailOptions = {
        from: process.env.Email_Name,
        to: email,
        subject: '',
        text: `${code} 
        Use this as a temporary password, please change it when you login. 
        We will not be responsible if it is leaked.`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            // return [constants.fail, "Mail hi ni gyi"]
            transporter.close();
        } else {
            // return [constants.inProgress, "Not yet returned"];
            console.log("yay");
            transporter.close();

        }
    });
}

const editUser = async (req, res, next) => {
    const userId = req.userData.userId;
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
    const {username, email, mobile} = req.body;
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
    user.mobile = mobile;
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
    users = users.sort((a, b) => Number(b.totalAmountWon) - Number(a.totalAmountWon));
    await res.json({users: users.map(user => user.toObject({getters: true}))});
};
const changePassword = async (req, res, next) => {
    const userId = req.userData.userId;
    console.log(userId);
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
    const newPassword = req.body.newPassword;
    const currentPassword = req.body.currentPassword;
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(currentPassword, user.password);
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
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(newPassword, 12);
    } catch (err) {
        const error = new HttpError(
            'Could not update password, please try again.',
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
exports.getUsers = getUsers;
exports.getLeaderBoard = getLeaderBoard;
exports.editUser = editUser;
exports.signup = signUp;
exports.login = login;
exports.forgotPassword = forgotPassword;
exports.changePassword = changePassword;
exports.getUserById = getUserById;