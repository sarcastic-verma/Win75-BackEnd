const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    image: {type: String},
    password: {type: String, required: true, minlength: 6},
    referralCode: {type: String},
    transactions: [{type: mongoose.Types.ObjectId, ref: 'Transaction'}],
    games: [{type: mongoose.Types.ObjectId, ref: 'Game'}],
    points: {type: Number, default: 50},
    wallet: {type: Number, default: 50},
    joinedOn: {type: String, required: true},
    totalAmountWon: {type: Number, default: 0},
    totalAmountSpent: {type: Number, default: 0},
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
