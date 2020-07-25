const HttpError = require('../models/http-error');
const User = require('../models/user');
const mongoose = require('mongoose');
const mailer = require('nodemailer');
const Transaction = require('../models/transaction');
const constants = require('../constants');

function addMoney() {
    return [constants.success, "succ101101"];
}

function giveMoney(tid, amount, name, mobile) {
    const transporter = mailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: process.env.Email_Name,
            pass: process.env.Email_Pass
        }
    });

    const mailOptions = {
        from: process.env.Email_Name,
        to: 'mohanu526@gmail.com, shivamthegreat.sv@gmail.com,rajat36lohan@gmail.com',
        subject: 'Give money to this user!!!',
        text: `Pay the transaction with id: ${tid}, name: ${name}, mobile: ${mobile}
        amount: ${amount}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            // return [constants.fail, "Mail hi ni gyi"]
        } else {
            // return [constants.inProgress, "Not yet returned"];
            console.log("yay");
        }
    });
}

const addTransaction = async (req, res, next) => {
    const userId = req.userData.userId;
    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    if (!user) {
        return next(new HttpError("User not found for the given id!", 404));
    }
    const amount = req.body.amount;
    let status, transaction;
    status = await addMoney();
    if (status[0] === constants.success) {
        user.inWalletCash += amount;
        transaction = new Transaction({
            userId,
            transactionId: status[1],
            amount,
            status: status[0]
        });
    } else if (status[0] === constants.fail) {
        transaction = new Transaction({
            userId,
            transactionId: status[1],
            amount,
            status: status[0]
        });
    }
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await transaction.save();
        await user.transactions.push(transaction);
        await user.save();
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    await res.json({transaction: transaction});
};

const redeemTransaction = async (req, res, next) => {
    const userId = req.userData.userId;
    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    if (!user) {
        return next(new HttpError("User not found for the given id!", 404));
    }
    const amount = req.body.amount;
    if (amount <= user.inWalletCash) {
        let transaction, transactionId;
        user.inWalletCash -= amount;
        transaction = new Transaction({
            userId,
            transactionId: "not yet returned",
            amount,
            status: constants.inProgress
        });
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            await transaction.save(
                async function (err, transaction_done) {
                    try {
                        transactionId = transaction_done.id;
                        try {
                            await giveMoney(transactionId, amount, user.username, user.mobile);
                        } catch (err) {
                            return next(new HttpError(err.message, err.statusCode));
                        }
                    } catch (error) {
                        console.log(error.message);
                    }
                }
            );
            await user.transactions.push(transaction);
            await user.save();
            await sess.commitTransaction();
        } catch (err) {
            return next(new HttpError(err.message, err.statusCode));
        }
        await res.json({transaction: transaction});
    } else {
        return next(new HttpError("Redeem amount unrealistic", 404));
    }
};
const addPoints = async (req, res, next) => {
    const userId = req.userData.userId;
    const amount = req.body.amount;
    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    if (!user) {
        return next(new HttpError("User not found for the given id!", 404));
    }
    user.points += amount;
    try {
        await user.save();
    } catch (err) {
        return next(new HttpError("Something went wrong can't update user", 404));
    }
    await res.json({message: "added"});
};

const reducePoints = async (req, res, next) => {
    const userId = req.userData.userId;
    const amount = req.body.amount;
    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    if (!user) {
        return next(new HttpError("User not found for the given id!", 404));
    }
    if (user.points < amount) {
        return next(new HttpError("Itne points ni h iss parr", 404));
    }
    user.points -= amount;
    try {
        await user.save();
    } catch (err) {
        return next(new HttpError("Something went wrong can't update user", 404));
    }
    await res.json({message: "reduced"});
};

const updateRedeemStatus = async (req, res, next) => {
    const transactionId = req.params.tid;
    const realTransactionId = req.body.realTransactionId;
    let transaction;
    try {
        transaction = await Transaction.findById(transactionId);
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    if (!transaction) {
        return next(new HttpError("Transaction not found for the given id!", 404));
    }
    transaction.status = constants.success;
    transaction.transactionId = realTransactionId;
    try {
        await transaction.save()
    } catch (err) {
        return next(new HttpError(err.message, err.statusCode));
    }
    await res.json({transaction: transaction});
};
exports.addTransaction = addTransaction;
exports.updateRedeemStatus = updateRedeemStatus;
exports.redeemTransaction = redeemTransaction;
exports.reducePoints = reducePoints;
exports.addPoints = addPoints;