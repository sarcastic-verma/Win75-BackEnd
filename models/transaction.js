const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId,required: true,ref:'User'},
    transactionId: {type: String, required: true},
    amount: {type: Number, required: true},
    type: {type: String, required: true},
    status: {type: String, required: true},
});

module.exports = mongoose.model('Transaction', transactionSchema);
