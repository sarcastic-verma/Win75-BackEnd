const mongoose = require("mongoose");


const playerSummarySchema = new mongoose.Schema({
    gameId: {type: mongoose.Types.ObjectId, required: true, ref: 'Game'},
    playerId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    optedOptions: [{type: String, required: true}],
    totalInvestment: {type: Number, required: true},
    /////////////////////////////////////////////////
    acceptedOptions: [{type: String}],
    profitableInvestment: {type: Number},
    proportionalGain: {type: Number},
    totalGain: {type: Number}
});
module.exports = new mongoose.model("PlayerSummary", playerSummarySchema);
