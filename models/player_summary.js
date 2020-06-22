const mongoose = require("mongoose");


const playerSummarySchema = new mongoose.Schema({
    playerId: {type: String, required: true},
    optedOptions: [{type: String, required: true}],
    acceptedOptions: [{type: String, required: true}],
    totalInvestment: {type: Number, required: true},
    profitableInvestment: {type: Number, required: true},
    proportionalGain: {type: Number, required: true},
    totalGain: {type: Number, required: true}
});
module.exports = new mongoose.model("PlayerSummary", playerSummarySchema);
