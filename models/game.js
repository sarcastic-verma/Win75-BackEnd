const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const gameSchema = new Schema({
    slotId: {type: mongoose.Types.ObjectId, ref: 'Slot', required: true},
    distributableProfitPercent: {type: Number, required: true},
    businessProfit: {type: Number, required: true},
    distributableProfit: {type: Number, required: true},
    totalProfit: {type: Number, required: true},
    gameInvestment: {type: Number, required: true},
    playerCount: {type: Number, required: true},
    droppedOptions: [{type: String, required: true}],
    spadesTotalInvestment: {type: Number, required: true},
    heartTotalInvestment: {type: Number, required: true},
    diamondTotalInvestment: {type: Number, required: true},
    clubTotalInvestment: {type: Number, required: true},
    betValue: {type: Number, required: true},
    optionSummary: [{type: mongoose.Types.ObjectId, ref: 'OptionSummary', required: true}],
    playerSummary: [{type: mongoose.Types.ObjectId, ref: 'PlayerSummary', required: true}],
});

module.exports = mongoose.model('Game', gameSchema);
