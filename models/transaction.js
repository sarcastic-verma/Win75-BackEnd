const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId,required: true,ref:'User'},
    transactionId: {type: String, required: true},
    amount: {type: Number, required: true},
    status: {type: String, required: true},
});

module.exports = new mongoose.model('Transaction', transactionSchema);
