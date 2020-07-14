const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    image: {type: String},
    password: {type: String, required: true, minlength: 6},
    mobile: {type:String,required: true},
    referralCode: {type: String, default: "none"},
    /////
    transactions: [{type: mongoose.Types.ObjectId, ref: 'Transaction'}],
    games: [{type: mongoose.Types.ObjectId, ref: 'Game'}],
    points: {type: Number, default: 50},
    inWalletCash: {type: Number, default: 0},
    joinedOn: {type: String, required: true},
    totalAmountWon: {type: Number, default: 0},
    disabled: {type: Boolean, default: false},
    totalAmountSpent: {type: Number, default: 0},
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
