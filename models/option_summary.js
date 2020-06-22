const mongoose = require("mongoose");

const optionSummarySchema = new mongoose.Schema({
    optionName: {
        type: String, required: true
    },
    playerIds: [{
        type: mongoose.Types.ObjectId, ref: 'User', required: true
    }],
    totalMoney: {
        type: Number,
        required: true
    }

});
module.exports = new mongoose.model("OptionSummary", optionSummarySchema);
